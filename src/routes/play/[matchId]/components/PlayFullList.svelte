<script lang="ts">
	import type { PlayUnit, LogRound, Options } from "$lib/playmode/types";
	import { PlayUnitCard } from "./";

	type Props = {
		units: PlayUnit[];
		options: Options;
		currentRoundLog: LogRound;
	};

	let { units, options, currentRoundLog }: Props = $props();

	let listWidth = $state<number>();
	let cardWidth = $derived((listWidth! - 16 - 8 * (options.cardsPerRow ?? 3)) / (options.cardsPerRow ?? 3));
</script>

<div class="play-list-units" bind:clientWidth={listWidth}>
	{#each units as unit}
		<div class="unit-card-container" style="width: {cardWidth}px; height:{(cardWidth * 5) / 7}px">
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
