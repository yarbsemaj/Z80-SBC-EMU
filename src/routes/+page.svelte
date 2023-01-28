<script lang="ts">
	import { help, about, roms } from '../store';
	import '98.css';
	import Emulator from '../components/Emulator.svelte';
	import Menubar from '../components/menu/Menubar.svelte';
	import Modal from '../components/modals/Modal.svelte';
	import Help from '../components/modals/Help.svelte';
	import About from '../components/modals/About.svelte';
	import Roms from '../components/modals/Roms/Roms.svelte';

	let showHelp: boolean, showAbout: boolean, showRoms: boolean;
	let emulator: any;

	help.subscribe((value) => {
		showHelp = value;
	});

	about.subscribe((value) => {
		showAbout = value;
	});

	roms.subscribe((value) => {
		showRoms = value;
	});

	function reset() {
		emulator.reset();
	}

	function loadRom(rom: any) {
		roms.set(false);
		emulator.loadRom(rom.detail);
	}

	function openIhex() {
		let input = document.createElement('input');
		input.type = 'file';
		input.onchange = (_) => {
			// you can use this method to get file and perform respective operations
			let files = Array.from(input.files);
			emulator.loadIhex(files[0]);
		};
		input.click();
	}
</script>

<svelte:head>
	<title>Z80 Single Board Computer Emulator</title>
	<meta
		name="description"
		content="An emulator for my own RC2014 compatable Z80 based single board computer. Games included."
	/>
	<meta name="author" content="James Bray" />
</svelte:head>

<div class="window" style="width: fit-content;">
	<div class={`title-bar ${showHelp || showAbout || showRoms ? 'inactive' : ''}`}>
		<div class="title-bar-text">Z80 Single Board Computer</div>

		<div class="title-bar-controls">
			<button aria-label="Close" on:click={reset} />
		</div>
	</div>
	<div class="window-body">
		<Menubar on:reset={reset} on:ihex={openIhex} />
		<div class="inset" style="background-color: #000;">
			<Emulator bind:emulator />
		</div>
	</div>
</div>

{#if showHelp}
	<Modal title="Help" on:close={() => help.set(false)}>
		<Help />
	</Modal>
{/if}

{#if showAbout}
	<Modal title="About" on:close={() => about.set(false)}>
		<About />
	</Modal>
{/if}

{#if showRoms}
	<Modal title="Load a ROM" on:close={() => roms.set(false)}>
		<Roms on:loadrom={loadRom} />
	</Modal>
{/if}

<style>
	:global(body) {
		background-color: #008080;
	}
	.window {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
	:global(.inset) {
		box-shadow: inset -1px -1px #fff, inset 1px 1px grey, inset -2px -2px #dfdfdf,
			inset 2px 2px #0a0a0a;
		display: block;
		margin: 0;
		padding: 5px;
	}
</style>
