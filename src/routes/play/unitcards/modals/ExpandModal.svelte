<script lang="ts">
	import { Dialog } from "$lib/components/Generic";
	import type { PlayUnit } from "$lib/types/unit";
	import { setContext } from "svelte";
	import PlayUnitCard from "../PlayUnitCard.svelte";

	type Props = {
		unit: PlayUnit;
		open: boolean;
	};
	let { unit, open = $bindable(false) }: Props = $props();

	setContext("expanded", true);
</script>

<Dialog title={unit.baseUnit.name} bind:open>
	<div class="expanded-container">
		<PlayUnitCard {unit}></PlayUnitCard>
	</div>
</Dialog>

<style>
	.expanded-container {
		container: expanded / size;
		aspect-ratio: 7/5;
		width: 80dvw;
		aspect-ratio: 7 / 5;
		margin: 16px 0px;
	}
</style>
