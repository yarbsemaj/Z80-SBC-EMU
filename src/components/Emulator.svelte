<script lang="ts">
	import { onMount } from 'svelte';

	import { Screen } from '../emu/component/Screen';
	import { ZCore, type ROM } from '../emu/component/ZCore';

	import root from '../roms/root.cim';

	import puc from '../roms/puc.cim';
	import minesweper from '../roms/minesweeper.cim';
	import snake from '../roms/snake.cim';
	import image from '../roms/image.cim';

	var theComputer: ZCore;
	var screen: Screen;
	let canvas: HTMLCanvasElement;

	export const emulator = {
		reset() {
			theComputer.cpu.reset();
		},
		loadRom(rom: ROM) {
			theComputer.mmap.addROM(rom.name, rom.start, rom.size, rom.uri);
			theComputer.cpu.reset();
			//Give time for the CPU to reset
			setTimeout(() => {
				theComputer.addToKeyboardBuffer('E9000\n');
			}, 50);
		},
		loadIhex(file: Blob) {
			let fr = new FileReader();
			fr.onload = function () {
				setTimeout(() => {
					theComputer.addToKeyboardBuffer(
						fr.result?.toString().replaceAll(String.fromCharCode(10), '\r') as string | ArrayBuffer
					);
				}, 50);
			};
			fr.readAsText(file);
		}
	};

	function inputCharacter(character: string) {
		theComputer.addToKeyboardBuffer(character);
		if (character.charCodeAt(0) == 10) {
			theComputer.addToKeyboardBuffer('\r');
		}
	}
	function onkeypress(event: KeyboardEvent) {
		if (event.which == 9 || event.which == 13 || event.which == 16) {
			event.preventDefault();
			if (event.which == 13) {
				//Enter
				inputCharacter('\n');
			}
		} else {
			var key = String.fromCharCode(event.which);
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
		{ name: 'PUC', start: 0x9000, size: 0x3000, uri: puc },
		{ name: 'Minesweeper', start: 0x9000, size: 0x3000, uri: minesweper },
		{ name: 'Snake', start: 0x9000, size: 0x3000, uri: snake },
		{ name: 'Image', start: 0x9000, size: 0x3000, uri: image }
	];

	onMount(async () => {
		screen = new Screen(80, 37, canvas);
		var emuConfig = {
			updateInterval: 0.1, // ms tick interval
			numCyclesPerTick: 30000, // clock cycles per interval
			peripherals: {
				ROM: [{ name: '8k ROM 0', start: 0x0000, size: 0x2000, uri: root }]
			},
			sendOutput: (text: string) => screen.newChar(text)
		};

		screen.clear();
		setInterval(() => screen.draw(), 32);
		theComputer = new ZCore(emuConfig);

		//Get Rom from hash
		var romName = window.location.hash.substr(1);
		console.log(romName);
		let rom = roms.find((rom) => romName.toLocaleLowerCase() == rom.name.toLocaleLowerCase());
		if (rom) {
			emulator.loadRom(rom);
		}
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
