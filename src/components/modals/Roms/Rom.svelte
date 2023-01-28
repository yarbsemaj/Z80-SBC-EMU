<script lang="ts">
    export let name: string
    export let image: string
</script>

<div style="margin: 10px;">
	<img src={image} alt={name} width="60" height="60" style="image-rendering: pixelated">
	<div style="text-align: center;">{name}</div>
</div>