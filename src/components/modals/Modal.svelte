<script lang="ts">
	import { createEventDispatcher } from "svelte";


	export let title: string;

	const dispatch = createEventDispatcher();

	function close() {
		dispatch('close');
	}
</script>

<div class="backdrop">

</div>

<div class="window modal">
	<div class="title-bar">
		<div class="title-bar-text">{title}</div>

		<div class="title-bar-controls">
			<button aria-label="Close" on:click={close} />
		</div>
	</div>
	<div class="window-body">
		<slot />
	</div>
</div>

<style>
	.backdrop{
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 500;

	}
	.modal {
		position: absolute;
		z-index: 1000;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}
</style>
