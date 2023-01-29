<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { ROM } from '../../../emu/component/ZCore';
	import Rom from './Rom.svelte';
	import minesweper from '../../../roms/minesweeper.cim';
	import puc from '../../../roms/puc.cim';
	import snake from '../../../roms/snake.cim';
	import image from '../../../roms/image.cim';
	const dispatch = createEventDispatcher();

	function loadRom(uri: string) {
		dispatch('loadrom', { start: 0x9000, size: 0x3000, uri });
	}
</script>

<div class="inset" style="background-color: #FFF;">
	<div style="display:flex">
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div on:click={() => loadRom(minesweper)}>
			<Rom name="Mines" image="/img/games/mines.png" />
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div on:click={() => loadRom(puc)}>
			<Rom name="PUC" image="/img/games/puc.png" />
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div on:click={() => loadRom(snake)}>
			<Rom name="Snake" image="/img/games/snake.png" />
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div on:click={() => loadRom(image)}>
			<Rom name="Image" image="/img/games/image.png" />
		</div>
	</div>
</div>
