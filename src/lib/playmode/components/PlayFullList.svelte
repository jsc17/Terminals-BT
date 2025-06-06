<script lang="ts">
	import type { PlayUnit } from "$lib/types/unit";
	import type { LogRound, Options } from "../playtypes";
	import PlayUnitCard from "../unitcards/PlayUnitCard.svelte";

	type Props = {
		units: PlayUnit[];
		options: Options;
		currentRoundLog: LogRound;
	};

	let { units, options, currentRoundLog }: Props = $props();
</script>

<div class="play-list-units">
	{#each units as unit}
		<div class="unit-card-container" style="width: {252 * ((options.uiScale + 50) / 100)}pt; height:{180 * ((options.uiScale + 50) / 100)}pt">
			<PlayUnitCard {unit} {options} {currentRoundLog}></PlayUnitCard>
		</div>
	{/each}
</div>

<style>
	.play-list-units {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		width: 100%;
	}
	.unit-card-container {
		container: unit-card / size;
	}
</style>
