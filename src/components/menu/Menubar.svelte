<script lang="ts">
	import FileMenu from './FileMenu.svelte';
	import { help, about } from '../../store';
	import './menu.css';
	let showFileMenu = false;

	function toggleFileMenue(event: MouseEvent) {
		event.stopPropagation();
		showFileMenu = !showFileMenu;
	}
</script>

<div class="menus" role="menubar" style="touch-action: none;">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class={`menu-button ${showFileMenu ? 'active highlight' : ''}`} on:click={toggleFileMenue}>
		<span class="menu-hotkey">F</span>ile
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="menu-button" on:click={() => help.set(true)}>
		<span class="menu-hotkey">H</span>elp
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="menu-button" on:click={() => about.set(true)}>
		<span class="menu-hotkey">A</span>bout
	</div>
</div>

{#if showFileMenu}
	<FileMenu on:reset  on:ihex />
{/if}

<svelte:window on:click={() => (showFileMenu = false)} />
