<svelte:options css="injected" />

<script lang="ts">
	import { type ListUnit } from "$lib/types/list.svelte";
	import PrintUnitCard from "./PrintUnitCard.svelte";

	type Props = {
		unit: ListUnit;
		image: string;
		formationSPAs: number[];
		measurementUnits: "inches" | "hexes";
	};
	let { unit, image, formationSPAs, measurementUnits }: Props = $props();
</script>

<body>
	<PrintUnitCard {unit} {image} {formationSPAs} {measurementUnits}></PrintUnitCard>
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
