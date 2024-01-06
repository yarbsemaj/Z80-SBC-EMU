<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import { Screen } from '../emu/component/Screen';
		import type { ROM } from '../emu/component/HAL';

	import root from '../roms/root.cim';

	import puc from '../roms/puc.cim';
	import minesweper from '../roms/minesweeper.cim';
	import snake from '../roms/snake.cim';
	import image from '../roms/image.cim';
	import banner from '../roms/banner.cim';
	import connect4 from '../roms/connect4.cim';
	import life from '../roms/life.cim';
	import threed from '../roms/threed.cim';
	import paint from '../roms/paint.cim';
	import { RXType, TXType, type TXMessage } from '../workers/emulator';
	import EmulatorWorker from '../workers/emulator?worker';
	let loop: NodeJS.Timer;

	let screen: Screen;
	let canvas: HTMLCanvasElement;
	let worker: Worker;

	export const emulator = {
		reset() {
			worker.postMessage({ action: RXType.RESET });
		},
		loadRom(rom: ROM) {
			worker.postMessage({ action: RXType.LOAD_ROM, data: rom });
		},
		loadIhex(file: Blob) {
			let fr = new FileReader();
			fr.onload = function () {
				setTimeout(() => {
					addToKeyboardBuffer(
						fr.result?.toString().replaceAll(String.fromCharCode(10), '\r') as string
					);
				}, 50);
			};
			fr.readAsText(file);
		}
	};

	function inputCharacter(character: string) {
		addToKeyboardBuffer(character);
		if (character.charCodeAt(0) == 10) {
			addToKeyboardBuffer('\r');
		}
	}
	function addToKeyboardBuffer(char: string) {
		worker.postMessage({ action: RXType.SEND_CHAR, data: char });
	}
	function onkeypress(event: KeyboardEvent) {
		if (event.which == 9 || event.which == 13 || event.which == 16) {
			event.preventDefault();
			if (event.which == 13) {
				//Enter
				inputCharacter('\n');
			}
		} else {
			let key = String.fromCharCode(event.which);
			inputCharacter(key);
		}
	}

	function onkeyup(event: KeyboardEvent) {
		//Backspace
		if (event.which == 8) {
			inputCharacter('\b');
		}
		//Break
		if (event.code == 'KeyC' && event.ctrlKey) {
			inputCharacter(String.fromCharCode(3));
		}
	}

	let roms = [
		{ name: 'PUC', start: 0x9000, uri: puc },
		{ name: 'Minesweeper', start: 0x9000, uri: minesweper },
		{ name: 'Snake', start: 0x9000, uri: snake },
		{ name: 'Image', start: 0x9000, uri: image },
		{ name: 'Banner', start: 0x9000, uri: banner },
		{ name: 'Connect4', start: 0x9000, uri: connect4 },
		{ name: 'Life', start: 0x9000, uri: life },
		{ name: 'threed', start: 0x9000, uri: threed },
		{ name: 'paint', start: 0x9000, uri: paint }
	];

	onDestroy(() => {
		clearInterval(loop);
		worker?.terminate();
	});

	onMount(async () => {
		screen = new Screen(80, 37, canvas);

		worker = new EmulatorWorker();
		worker.onmessage = async (e: MessageEvent<TXMessage>) => {
			switch (e.data.action) {
				case TXType.OUTPUT_CHAR:
					screen.newChar(e.data.data);
					break;
				case TXType.INIT:
					screen.clear();
					//Get Rom from hash
					let romName = window.location.hash.substr(1);
					let rom = roms.find((rom) => romName.toLocaleLowerCase() == rom.name.toLocaleLowerCase());
					if (rom) {
						emulator.loadRom(rom);
					}
					break;
				case TXType.ROM_LOADED:
					//Give time for the CPU to reset
					emulator.reset();
					screen.clear();
					setTimeout(() => {
						addToKeyboardBuffer('E9000\n');
					}, 50);
			}
		};

		screen.clear();
		loop = setInterval(() => screen.draw(), 32);
		worker.postMessage({ action: RXType.INIT, data: { name: 'Base', start: 0x0000, uri: root } });
	});
</script>

<canvas width="800" height="600" bind:this={canvas} />

<svelte:window on:keyup={onkeyup} on:keypress={onkeypress} />

<style>
	@font-face {
		font-family: 'Windows Command Prompt';
		src: url('/fonts/Windows-Command-Prompt.woff2') format('woff2'),
			url('/fonts/Windows-Command-Prompt.woff') format('woff');
		font-weight: normal;
		font-style: normal;
		font-display: swap;
	}
</style>
