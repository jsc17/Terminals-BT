<script lang="ts">
	import { Dialog } from "$lib/components/Generic";
	import type { MulUnit, PlayUnit } from "$lib/types/unit";
	import { setContext } from "svelte";
	import PlayUnitCard from "../PlayUnitCard.svelte";
	import type { Options } from "../../types";

	type Props = {
		unit: PlayUnit;
		open: boolean;
		reference: MulUnit;
		options: Options;
	};
	let { unit, open = $bindable(false), reference, options }: Props = $props();

	setContext("expanded", true);
</script>

<Dialog title={reference.name} bind:open>
	<div class="expanded-container">
		<PlayUnitCard {unit} {options}></PlayUnitCard>
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
