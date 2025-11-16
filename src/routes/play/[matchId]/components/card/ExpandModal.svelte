<script lang="ts">
	import { Dialog } from "$lib/generic";
	import type { MulUnit } from "$lib/types/listTypes";
	import { setContext } from "svelte";
	import { PlayUnitCard } from "..";
	import type { LogRound, PlayUnit } from "../../../types/types";
	import type { PlaymodeOptionsOutput } from "../../../schema/playmode";

	type Props = {
		unit: PlayUnit;
		open: boolean;
		reference: MulUnit;
		options: PlaymodeOptionsOutput;
	};
	let { unit, open = $bindable(false), reference, options }: Props = $props();

	setContext("expanded", true);
</script>

<Dialog title={reference.name} bind:open>
	<div class="expanded-container">
		<PlayUnitCard {unit} {options} />
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
