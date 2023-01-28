<script lang="ts">
	import { createEventDispatcher } from 'svelte';
    import {roms} from '../../store'

	const dispatch = createEventDispatcher();

	function reset() {
		dispatch('reset');
	}

    function loadIhex() {
		dispatch('ihex');
	}
</script>

<div class="menu-popup">
	<table class="menu-popup-table">
		<tr class="menu-row menu-item" on:click={loadIhex}>
			<td class="menu-item-checkbox-area" />
			<td class="menu-item-label">Load raw file</td>
			<td class="menu-item-shortcut" />
			<td class="menu-item-submenu-area" />
		</tr>
		<tr class="menu-row menu-item" on:click={()=>roms.set(true)}>
			<td class="menu-item-checkbox-area" />
			<td class="menu-item-label">Open ROM</td>
			<td class="menu-item-shortcut" />
			<td class="menu-item-submenu-area" />
		</tr>
		<tr class="menu-row"><td colspan="4"><hr class="menu-hr" /></td></tr>
		<tr class="menu-row menu-item" on:click={reset}>
			<td class="menu-item-checkbox-area" />
			<td class="menu-item-label">Reset</td>
			<td class="menu-item-shortcut">Ctrl+R</td>
			<td class="menu-item-submenu-area" />
		</tr>
	</table>
</div>
