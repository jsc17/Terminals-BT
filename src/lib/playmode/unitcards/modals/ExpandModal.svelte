<script lang="ts">
	import { Dialog } from "$lib/global/components";
	import type { MulUnit, PlayUnit } from "$lib/types/unit";
	import { setContext } from "svelte";
	import PlayUnitCard from "../PlayUnitCard.svelte";
	import type { LogRound, Options } from "../../playtypes";

	type Props = {
		unit: PlayUnit;
		open: boolean;
		reference: MulUnit;
		options: Options;
		currentRoundLog: LogRound;
	};
	let { unit, open = $bindable(false), reference, options, currentRoundLog }: Props = $props();

	setContext("expanded", true);
</script>

<Dialog title={reference.name} bind:open>
	<div class="expanded-container">
		<PlayUnitCard {unit} {options} {currentRoundLog}></PlayUnitCard>
	</div>
</Dialog>

<style>
	.expanded-container {
		container: expanded / size;
		aspect-ratio: 7/5;
		aspect-ratio: 7 / 5;
		margin: 16px 0px;
		overflow: auto;
	}
	@media (orientation: landscape) {
		.expanded-container {
			height: 80dvh;
		}
	}
	@media (orientation: portrait) {
		.expanded-container {
			width: max(400px, 90dvw);
		}
	}
</style>
