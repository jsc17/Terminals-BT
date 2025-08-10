<script lang="ts">
	import type { PlayList } from "$lib/types/playmode";
	import { PlayFormations, DisplayOptionsPopover, LoadModal, Log, PlayFullList } from "$lib/components/playmode/";
	import { PersistedState } from "runed";
	import type { LogRound, Options } from "../../lib/types/playmode";
	import { deserialize } from "$app/forms";
	import { Popover } from "$lib/components/global/";
	import { PlaymodeOptionsSchema } from "$lib/schemas/playmode";
	import { isJson } from "$lib/utilities/utilities";
	import { loadMULUnit } from "$lib/utilities/loadUtilities";
	import { SvelteMap } from "svelte/reactivity";
	import type { MulUnit } from "$lib/types/listTypes";
	import { toastController } from "$lib/stores";

	let logDrawerOpen = $state(false);
	let loadModalOpen = $state(false);
	let lists: { name: string; units: string; formations: string }[] = $state([]);

	const playList = new PersistedState<PlayList>("playList", { formations: [], units: [] });

	const options = new PersistedState<Options>(
		"playOptions",
		{
			renderOriginal: true,
			cardsPerRow: 3,
			uiScale: 50,
			showPhysical: false,
			showCrippled: true,
			showJumpTMM: true,
			confirmEnd: true,
			groupByFormation: true
		},
		{
			serializer: {
				serialize: JSON.stringify,
				deserialize: (savedData) => {
					if (isJson(savedData)) {
						return PlaymodeOptionsSchema.parse(JSON.parse(savedData));
					} else {
						return {
							renderOriginal: true,
							cardsPerRow: 3,
							uiScale: 50,
							showPhysical: false,
							showCrippled: true,
							showJumpTMM: true,
							confirmEnd: true,
							groupByFormation: true
						};
					}
				}
			}
		}
	);

	let unitReferences = $derived.by(() => {
		let references: SvelteMap<string, MulUnit> = new SvelteMap();
		for (const unit of playList.current.units) {
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
				for (const unit of playList.current.units) {
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
		toastController.addToast("test");
		const response: any = deserialize(await (await fetch("?/loadLists", { method: "POST", body: "" })).text());
		lists = JSON.parse(response.data.lists);
		loadModalOpen = true;
	}
</script>

<svelte:head>
	<title>Terminal's Play Mode</title>
</svelte:head>

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
					<DisplayOptionsPopover bind:options={options.current}></DisplayOptionsPopover>
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
				<PlayFormations {formation} units={playList.current.units} options={options.current} currentRoundLog={currentRoundLog.current} {unitReferences}></PlayFormations>
			{/each}
		{:else}
			<PlayFullList units={playList.current.units} options={options.current} currentRoundLog={currentRoundLog.current}></PlayFullList>
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
