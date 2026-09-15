<svelte:options css="injected" />

<script lang="ts">
	import PrintUnitCard from "$lib/cardgeneration/templates/PrintUnitCard.svelte";
	import type { ListUnit } from "$lib/types/listTypes";

	let { unit, image }: { unit: ListUnit; image?: string } = $props();
</script>

<div class="unit-card-wrapper">
	<PrintUnitCard {unit} {image} formationSPAs={[]} measurementUnits={"inches"} numberingType={"none"} printDuplicateMarkings={false} />
</div>

<style>
	.unit-card-wrapper {
		aspect-ratio: 7 / 5;
		width: 716px;
		container: unit-card / size;
		font-family: Arial, Helvetica, sans-serif;
		padding: 0px;
		margin: 0px;
	}
</style>
