<script lang="ts">
	import type { PlayList } from "$lib/types/playList";
	import PlayFormationCard from "./PlayFormationCard.svelte";
	import { PersistedState } from "runed";
	import UiScalePopover from "./components/UIScalePopover.svelte";

	function resetUnits() {
		if (playList) {
			const reset = confirm("Are you sure you wish to reset all units to default? This cannot be undone.");
			if (reset) {
				for (const unit of playList.current.units) {
					unit.current = { damage: 0, heat: 0, crits: { engine: 0, fireControl: 0, mp: 0, weapon: 0, destroyed: false, motiveHit: 0, motiveHalf: 0, motiveIm: false } };
					unit.pending = { damage: 0, heat: 0, crits: { engine: 0, fireControl: 0, mp: 0, weapon: 0, destroyed: false, motiveHit: 0, motiveHalf: 0, motiveIm: false } };
				}
			}
		}
	}
	const uiScale = new PersistedState("uiScale", 50);
	const playList = new PersistedState<PlayList>("playList", { formations: [], units: [] });
</script>

{#if !playList}
	<div class="list-load-error-body">
		<h2>No list loaded. Please try loading a list from the <a href="/listbuilder">list builder</a></h2>
	</div>
{:else}
	<div class="play-body">
		<div class="toolbar">
			<div class="toolbar-section"></div>
			<div class="toolbar-section">
				<UiScalePopover bind:uiScale={uiScale.current}></UiScalePopover>
				<button class="toolbar-button" onclick={resetUnits}>Reset List</button>
			</div>
		</div>
		<p class="announcement">Still Beta, but getting better. Some UI improvements done, but still missing automation. Click on a units name to expand its card.</p>
		{#each playList.current.formations as formation}
			<PlayFormationCard {formation} units={playList.current.units} uiScale={uiScale.current}></PlayFormationCard>
		{/each}
	</div>
{/if}

<style>
	.list-load-error-body {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.play-body {
		padding: 0px 16px 0px 12px;
		overflow: auto;
	}
	.toolbar {
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		justify-content: space-between;
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
