<script lang="ts">
	import { PlayFormations, DisplayOptionsPopover, Log, PlayFullList } from "./components/";
	import { PersistedState } from "runed";
	import { type PlayList, type LogRound } from "$lib/playmode/types";
	import { PlaymodeOptionsSchema, type PlaymodeOptionsOutput } from "./schema/playmode";
	import { loadMULUnit } from "$lib/utilities/loadUtilities";
	import { SvelteMap } from "svelte/reactivity";
	import type { MulUnit } from "$lib/types/listTypes";
	import { db } from "$lib/offline/db";
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import DropdownMenu from "$lib/generic/components/DropdownMenu.svelte";
	import * as v from "valibot";
	import { safeParseJSON } from "$lib/utilities/utilities";

	let logDrawerOpen = $state(false);

	let playList = $state<PlayList>();

	onMount(async () => {
		if (page.params.matchId) playList = await db.localMatches.get(page.params.matchId);
	});

	const options = new PersistedState<PlaymodeOptionsOutput>("playOptions", v.parse(PlaymodeOptionsSchema, {}), {
		serializer: {
			serialize: JSON.stringify,
			deserialize: (savedData) => v.parse(PlaymodeOptionsSchema, safeParseJSON(savedData) ?? {})
		}
	});

	let unitReferences = $derived.by(() => {
		let references: SvelteMap<string, MulUnit> = new SvelteMap();
		for (const unit of playList?.units ?? []) {
			loadMULUnit(unit.mulId).then((result) => {
				references.set(unit.id, result);
			});
		}
		return references;
	});

	const currentRoundLog = new PersistedState<LogRound>("playCurrentRound", { round: 1, logs: [] });
	let fullLogs: LogRound[] = $state([]);

	function resetList() {
		if (playList) {
			const reset = confirm("Are you sure you wish to reset all units to default? This cannot be undone.");
			if (reset) {
				for (const unit of playList?.units) {
					unit.current = { damage: 0, heat: 0, crits: [], disabledAbilities: [] };
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
				for (const unit of playList?.units) {
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

	function endMatch() {
		if (confirm("End match and remove it from active matches?")) {
			if (playList?.id) db.localMatches.delete(playList?.id);
			window.location.href = "/play";
		}
	}

	function openLog() {
		logDrawerOpen = !logDrawerOpen;
	}
</script>

<svelte:head>
	<title>Terminal's Play Mode</title>
</svelte:head>

{#if playList}
	<div class="play-body">
		<div class="toolbar">
			<div class="toolbar-section">
				<button class="toolbar-button" onclick={endRound}>End Round</button>
			</div>
			<div class="toolbar-item">Round: {currentRoundLog.current.round}</div>
			<div class="toolbar-section">
				<DropdownMenu
					items={[
						{ type: "item", label: "Reset List", onSelect: resetList },
						{ type: "item", label: "End Match", onSelect: endMatch },
						{ type: "item", label: "Exit Match", onSelect: () => (window.location.href = "/play") }
					]}
					triggerClasses="transparent-button"
				>
					{#snippet trigger()}
						Menu
					{/snippet}
				</DropdownMenu>
				<DisplayOptionsPopover bind:options={options.current}></DisplayOptionsPopover>
			</div>
		</div>
		<div class="flex-between">
			<p class="announcement">Some minor tweaks still to go, but pretty close to being done. Click on a units name to expand its card.</p>
			<button class="play-log-button" onclick={openLog}>Match Log</button>
		</div>
		{#if playList?.units.length}
			{#if options.current.groupByFormation}
				{#each playList?.formations as formation}
					<PlayFormations {formation} units={playList?.units} options={options.current} currentRoundLog={currentRoundLog.current} {unitReferences}></PlayFormations>
				{/each}
			{:else}
				<PlayFullList units={playList?.units} options={options.current} currentRoundLog={currentRoundLog.current}></PlayFullList>
			{/if}
		{:else}
			<div class="list-load-error-body">
				<h2>No list loaded. Please try loading a list from the <a href="/listbuilder">list builder</a></h2>
			</div>
		{/if}
	</div>
	<Log bind:open={logDrawerOpen} currentRoundLog={currentRoundLog.current} {fullLogs} {playList}></Log>
{/if}

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
		background-color: var(--surface-color);
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
		color: var(--text-color);
		min-width: min(25dvw, 100px);
	}
	.toolbar-button:hover {
		background-color: var(--surface-color-light);
		color: var(--surface-color-light-text-color);
	}
	.announcement {
		padding: 4px 16px;
		align-self: center;
		color: var(--surface-color-light-text-color);
		box-sizing: border-box;
		margin: 4px 0px;
	}
	.play-log-button {
		color: var(--primary);
		background-color: var(--surface-color);
		height: 100%;
		padding: 4px 16px;
		width: max-content;
	}
	.play-log-button:hover {
		cursor: pointer;
		background-color: var(--surface-color-light);
	}
</style>
