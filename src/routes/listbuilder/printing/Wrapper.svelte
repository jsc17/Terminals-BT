<svelte:options css="injected" />

<script lang="ts">
	import { type ListUnit } from "$lib/types/list.svelte";
	import PrintUnitCard from "./PrintUnitCard.svelte";

	let { unit, image }: { unit: ListUnit; image: string } = $props();
</script>

<body>
	<PrintUnitCard {unit} {image}></PrintUnitCard>
</body>

<style>
	body {
		height: 187pt;
		width: 262pt;
		container: unit-card / size;
		font-family: Arial, Helvetica, sans-serif;
		padding: 0;
		margin: 0;
	}
</style>
