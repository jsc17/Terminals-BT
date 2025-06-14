<svelte:options css="injected" />

<script lang="ts">
	import { type UnitV2 } from "$lib/types";
	import PrintUnitCard from "./PrintUnitCard.svelte";

	let { unit, image }: { unit: UnitV2; image: string } = $props();
</script>

<body>
	<PrintUnitCard {unit} {image}></PrintUnitCard>
</body>

<style>
	body {
		height: 480px;
		width: 672px;
		container: unit-card / size;
		font-family: Arial, Helvetica, sans-serif;
		padding: 0;
		margin: 0;
	}
</style>
