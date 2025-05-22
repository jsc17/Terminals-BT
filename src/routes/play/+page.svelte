<script lang="ts">
	import type { PlayList } from "$lib/types/playList";
	import PlayFormationCard from "./PlayFormationCard.svelte";
	import { PersistedState } from "runed";
	import OptionsPopover from "./components/OptionsPopover.svelte";
	import type { Options } from "./types";

	function resetUnits() {
		if (playList) {
			const reset = confirm("Are you sure you wish to reset all units to default? This cannot be undone.");
			if (reset) {
				for (const unit of playList.current.units) {
					unit.current = { damage: 0, heat: 0, crits: [] };
					unit.pending = { damage: 0, heat: 0, crits: [] };
				}
			}
		}
	}
	const playList = new PersistedState<PlayList>("playList", { formations: [], units: [] });
	const options = new PersistedState<Options>("playOptions", { renderOriginal: true, uiScale: 50, showPhysical: false });
</script>

<div class="play-body">
	<div class="toolbar">
		<div class="toolbar-section"></div>
		<div class="toolbar-section">
			<OptionsPopover bind:options={options.current}></OptionsPopover>
			<button class="toolbar-button" onclick={resetUnits}>Reset List</button>
		</div>
	</div>
	<p class="announcement">
		Still Beta, but getting better. Basic automation done, but doesn't apply abilities or SPAs. Everything subject to change at my whim. Click on a units name to expand its card.
	</p>
	{#if playList.current.formations.length}
		{#each playList.current.formations as formation}
			<PlayFormationCard {formation} units={playList.current.units} options={options.current}></PlayFormationCard>
		{/each}
	{:else}
		<div class="list-load-error-body">
			<h2>No list loaded. Please try loading a list from the <a href="/listbuilder">list builder</a></h2>
		</div>
	{/if}
</div>

<style>
	.list-load-error-body {
		margin-top: 20dvh;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.play-body {
		position: relative;
		padding: 0px 16px 0px 12px;
		overflow: auto;
	}
	.toolbar {
		position: sticky;
		top: 0;
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		justify-content: space-between;
		z-index: 2;
	}
	.toolbar-section {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.toolbar-button {
		padding: 12px;
		font-size: 16px;
		background-color: transparent;
		border-radius: 0;
		color: var(--card-foreground);
	}
	.toolbar-button:hover {
		background-color: var(--muted);
		color: var(--muted-foreground);
	}
	.announcement {
		margin: 16px;
		width: 100%;
		align-self: center;
		color: var(--muted-foreground);
	}
</style>
