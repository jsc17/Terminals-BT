<script lang="ts">
	import type { PlayList } from "$lib/types/playList";
	import PlayFormation from "./PlayFormation.svelte";
	import { PersistedState } from "runed";
	import OptionsPopover from "./components/OptionsPopover.svelte";
	import type { LogRound, Options } from "./types";
	import LoadModal from "./LoadModal.svelte";
	import { deserialize } from "$app/forms";
	import Log from "./Log.svelte";
	import { Popover } from "$lib/components/Generic/";
	import PlayUnitList from "./PlayUnitList.svelte";

	let logDrawerOpen = $state(false);
	let loadModalOpen = $state(false);
	let lists: { name: string; units: string; formations: string }[] = $state([]);

	const playList = new PersistedState<PlayList>("playList", { formations: [], units: [] });
	const options = new PersistedState<Options>("playOptions", {
		renderOriginal: true,
		uiScale: 50,
		showPhysical: false,
		showCrippled: true,
		showJumpTMM: true,
		confirmEnd: true,
		groupByFormation: true
	});
	const currentRoundLog = new PersistedState<LogRound>("playCurrentRound", { round: 1, logs: [] });
	let fullLogs: LogRound[] = $state([]);

	function resetList() {
		if (playList) {
			const reset = confirm("Are you sure you wish to reset all units to default? This cannot be undone.");
			if (reset) {
				for (const unit of playList.current.units) {
					unit.current = { damage: 0, heat: 0, crits: [] };
					unit.pending = { damage: 0, heat: 0, crits: [] };
				}
				fullLogs = [];
				currentRoundLog.current = { round: 1, logs: [] };
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
				for (const log of currentRoundLog.current.logs) {
					log.applied = true;
				}
				fullLogs.push({ round: currentRoundLog.current.round, logs: currentRoundLog.current.logs });
				currentRoundLog.current = { round: currentRoundLog.current.round + 1, logs: [] };
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
		<div class="toolbar-section">
			<button class="toolbar-button" onclick={endRound}>End Round</button>
		</div>
		<div class="toolbar-item">Round: {currentRoundLog.current.round}</div>
		<div class="toolbar-section">
			<Popover>
				{#snippet trigger()}
					<div class="toolbar-button">Menu</div>
				{/snippet}
				<div class="play-menu-dropdown">
					<OptionsPopover bind:options={options.current}></OptionsPopover>
					<button class="toolbar-button" onclick={resetList}>Reset List</button>
					<button class="toolbar-button" onclick={openLoadModal}>Load List</button>
				</div>
			</Popover>
			<button class="toolbar-button play-log-button" onclick={openLog}>Log</button>
		</div>
	</div>
	<p class="announcement">Some minor tweaks still to go, but pretty close to being done. Click on a units name to expand its card.</p>
	{#if playList.current.units.length}
		{#if options.current.groupByFormation}
			{#each playList.current.formations as formation}
				<PlayFormation {formation} units={playList.current.units} options={options.current} currentRoundLog={currentRoundLog.current}></PlayFormation>
			{/each}
		{:else}
			<PlayUnitList units={playList.current.units} options={options.current} currentRoundLog={currentRoundLog.current}></PlayUnitList>
		{/if}
	{:else}
		<div class="list-load-error-body">
			<h2>No list loaded. Please try loading a list from the <a href="/listbuilder">list builder</a></h2>
		</div>
	{/if}
</div>

<Log bind:open={logDrawerOpen} currentRoundLog={currentRoundLog.current} {fullLogs} playList={playList.current}></Log>
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
		z-index: 5;
	}
	.toolbar-section {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 0px 16px;
		justify-content: flex-end;
	}
	.toolbar-item {
		display: flex;
		align-items: center;
		padding: 0px 16px;
		font-size: 24px;
		text-align: center;
	}
	.toolbar-button {
		padding: 12px;
		font-size: 16px;
		background-color: transparent;
		border-radius: 0;
		color: var(--card-foreground);
		min-width: min(25dvw, 100px);
	}
	.toolbar-button:hover {
		background-color: var(--muted);
		color: var(--muted-foreground);
	}
	.play-menu-dropdown {
		display: flex;
		flex-direction: column;
		margin: 12px 0px;
	}
	.announcement {
		width: calc(100%);
		padding: 4px 16px;
		align-self: center;
		color: var(--muted-foreground);
		box-sizing: border-box;
		margin: 4px 0px;
	}
</style>
