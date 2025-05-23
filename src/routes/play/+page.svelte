<script lang="ts">
	import type { PlayList } from "$lib/types/playList";
	import PlayFormationCard from "./PlayFormationCard.svelte";
	import { PersistedState } from "runed";
	import OptionsPopover from "./components/OptionsPopover.svelte";
	import type { Options } from "./types";
	import Drawer from "$lib/components/Generic/Drawer.svelte";
	import LoadModal from "./LoadModal.svelte";
	import { deserialize } from "$app/forms";

	const playList = new PersistedState<PlayList>("playList", { formations: [], units: [] });
	const options = new PersistedState<Options>("playOptions", { renderOriginal: true, uiScale: 50, showPhysical: false, showCrippled: true, showJumpTMM: true, confirmEnd: true });
	let logDrawerOpen = $state(false);
	let loadModalOpen = $state(false);
	let lists: { name: string; units: string; formations: string }[] = $state([]);

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

	function endRound() {
		if (playList) {
			const end = confirm("End round and apply all pending damage, heat, and critical effects?");
			if (end) {
				for (const unit of playList.current.units) {
					unit.current.damage = unit.current.damage + unit.pending.damage;
					unit.current.heat = unit.pending.heat;
					unit.current.crits = unit.current.crits.concat(unit.pending.crits);

					unit.pending.damage = 0;
					unit.pending.crits = [];
				}
			}
		}
	}
	function openLog() {
		logDrawerOpen = !logDrawerOpen;
	}

	async function openLoadModal() {
		const response: any = deserialize(await (await fetch("?/loadLists", { method: "POST", body: "" })).text());
		lists = JSON.parse(response.data.lists);
		loadModalOpen = true;
	}
</script>

<div class="play-body">
	<div class="toolbar">
		<button class="toolbar-button end-round-button" onclick={endRound}>End Round</button>
		<div class="toolbar-section">
			<OptionsPopover bind:options={options.current}></OptionsPopover>
			<button class="toolbar-button" onclick={resetUnits}>Reset List</button>
			<button class="toolbar-button" onclick={openLoadModal}>Load List</button>
		</div>
		<button class="toolbar-button log-button" onclick={openLog}>Log</button>
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

<Drawer bind:open={logDrawerOpen} side={"right"}>
	<p>Coming soon ...</p>
</Drawer>

<LoadModal bind:open={loadModalOpen} {lists} bind:playList={playList.current}></LoadModal>

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
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		position: sticky;
		top: 0;
		display: flex;
		justify-content: space-between;
		z-index: 2;
	}
	.toolbar-section {
		flex: 1;
		display: flex;
		gap: 8px;
		align-items: center;
		border-left: 3px solid var(--border);
		border-right: 3px solid var(--border);
		padding: 0px 16px;
		justify-content: flex-end;
	}
	.toolbar-button {
		padding: 12px;
		font-size: 16px;
		background-color: transparent;
		border-radius: 0;
		color: var(--card-foreground);
	}
	.log-button,
	.end-round-button {
		min-width: min(25dvw, 100px);
	}
	.end-round-button {
		border-top-left-radius: var(--radius);
		border-bottom-left-radius: var(--radius);
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
