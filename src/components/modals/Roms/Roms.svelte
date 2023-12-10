<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Rom from './Rom.svelte';
	import minesweper from '../../../roms/minesweeper.cim';
	import puc from '../../../roms/puc.cim';
	import snake from '../../../roms/snake.cim';
	import image from '../../../roms/image.cim';
	import banner from '../../../roms/banner.cim';
	import connect4 from '../../../roms/connect4.cim';
	import life from '../../../roms/life.cim';

	const dispatch = createEventDispatcher();

	function loadRom(uri: string) {
		dispatch('loadrom', { start: 0x9000,  uri });
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
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div on:click={() => loadRom(banner)}>
			<Rom name="Banner" image="/img/games/banner.png" />
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div on:click={() => loadRom(connect4)}>
			<Rom name="Connect 4" image="/img/games/connect4.png" />
		</div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div on:click={() => loadRom(life)}>
			<Rom name="Life" image="/img/games/life.png" />
		</div>
	</div>
</div>
