<script lang="ts">
	import { PlayFormations, DisplayOptionsPopover, EndRoundModal, MatchJoinModal, MatchManagementModal } from "./components";
	import { PersistedState, watch } from "runed";
	import { type PlayList, type PlayUnit } from "../types/types";
	import { PlaymodeOptionsSchema, type PlaymodeOptionsOutput } from "../schema/playmode";
	import DropdownMenu from "$lib/generic/components/DropdownMenu.svelte";
	import * as v from "valibot";
	import { safeParseJSON } from "$lib/utilities/utilities";
	import { onMount, setContext } from "svelte";
	import { getAllPlayerData, getTeamData, getMyData, getMatchDetails, deleteMatch, getPlayerData, getLogs } from "./remote/matchData.remote";
	import { startGame } from "./remote/matchManagement.remote";
	import { SvelteMap } from "svelte/reactivity";
	import { initializePlayerList, processMessage } from "./utilities/handleMatchEvents";
	import type { MenuItem } from "$lib/generic/types";
	import type { MatchLog } from "$lib/generated/prisma/browser";
	import MatchLogWindow from "./components/ui/MatchLogWindow.svelte";
	import { goto } from "$app/navigation";
	import LoadListModal from "./components/ui/LoadListModal.svelte";
	import type { Attachment } from "svelte/attachments";
	import { appWindow } from "$lib/stores";
	import MatchResults from "./components/ui/MatchResults.svelte";

	let { data } = $props();

	setContext("matchId", data.matchId);

	const options = new PersistedState<PlaymodeOptionsOutput>("playOptions", v.parse(PlaymodeOptionsSchema, {}), {
		serializer: {
			serialize: JSON.stringify,
			deserialize: (savedData) => v.parse(PlaymodeOptionsSchema, safeParseJSON(savedData) ?? {})
		}
	});

	let matchPlayers = $state<{ id: number; team?: number; nickname: string; role: string }[]>([]);
	let matchLists = $state<PlayList[]>([]);
	let matchUnits = new SvelteMap<number, PlayUnit>();
	let matchLogs = $state<MatchLog[]>([]);

	const matchData = $derived(await getMatchDetails(data.matchId));
	const myData = $derived(await getMyData(data.matchId));
	const teamData = $derived(await getTeamData(data.matchId));

	getAllPlayerData(data.matchId).then((results) => {
		results.forEach(async (r) => {
			matchPlayers.push({ id: r.id, team: r.teamId ?? undefined, nickname: r.playerNickname, role: r.playerRole });
			for (const list of r.lists) matchLists.push(await initializePlayerList(list, matchUnits));
		});
	});
	getLogs({ matchId: data.matchId, lastLogId: 0 }).then((results) => (matchLogs = matchLogs.concat(results)));

	const componentsOpen = $state({ join: false, addList: false, management: false, matchLog: false, matchResults: false });
	$effect(() => {
		if (matchData?.gameCompleted) componentsOpen.matchResults = true;
	});

	const menuOptions: MenuItem[] = $derived.by(() => {
		let options: MenuItem[] = [];

		if (!data.username)
			return [{ type: "info", label: `Please login to join match` }, { type: "separator" }, { type: "item", label: "Return to match selection", onSelect: () => goto("/play") }];

		if (!myData)
			return [
				{ type: "item", label: "Join Match", onSelect: () => (componentsOpen.join = true) },
				{ type: "separator" },
				{ type: "item", label: "Return to match selection", onSelect: () => goto("/play") }
			];

		options.push({ type: "item", label: matchLists.find((l) => l.owner == myData.id) ? "Load Additional List" : "Load List", onSelect: () => (componentsOpen.addList = true) });
		if (myData.playerRole == "HOST" || myData.playerRole == "MODERATOR")
			options = options.concat([
				{ type: "separator" },
				{ type: "item", label: "Manage Match", onSelect: () => (componentsOpen.management = true) },
				{
					type: "item",
					label: "Delete Match",
					onSelect: () => {
						if (confirm("Delete match immediately and end without showing summary screen?")) deleteMatch(data.matchId);
					}
				},
				{ type: "separator" },
				{ type: "info", label: `Match Id: ${data.matchId}` },
				{ type: "hiddenInfo", label: `Join Code`, hidden: `${matchData?.joinCode}` }
			]);

		return options.concat([{ type: "separator" }, { type: "item", label: "Return to match selection", onSelect: () => goto("/play") }]);
	});

	let listContainer = $state<HTMLDivElement>();
	let activeList = $state<string>();
	let observer = $state<IntersectionObserver>();

	onMount(() => {
		console.log("mounting component");
		const es = new EventSource(`/play/${data.matchId}/stream`);
		es.onmessage = ({ data }) => processMessage(data, matchPlayers, matchUnits, matchLogs, matchLists);

		observer = new IntersectionObserver(
			(entries) => {
				console.log(entries);
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeList = entry.target.id.split("-")[1];
					}
				}
			},
			{ rootMargin: "0px", threshold: 0.5 }
		);

		return () => {
			es.close();
		};
	});

	const observeList: Attachment = (node) => {
		if (observer && node) observer.observe(node);
		return () => observer?.unobserve(node);
	};
</script>

<svelte:head>
	<title>Terminal's Play Mode</title>
</svelte:head>

<div class="play-body">
	<div class="match-bars">
		<div class="match-header">
			<div class="toolbar-section">
				<DropdownMenu items={menuOptions} triggerClasses="transparent-button">
					{#snippet trigger()}
						<div class="toolbar-button">Menu</div>
					{/snippet}
				</DropdownMenu>
			</div>
			<div class="team-names">
				<div class="team-name-red">
					<div class="toolbar-item">{teamData?.[0]?.name}</div>
					<div class="toolbar-item">{teamData?.[0]?.objectivePoints}</div>
				</div>
				<div class="team-name-blue">
					<div class="toolbar-item">{teamData?.[1]?.name}</div>
					<div class="toolbar-item">{teamData?.[1]?.objectivePoints}</div>
				</div>
			</div>

			<div class="toolbar-section">
				<div>
					<DisplayOptionsPopover bind:options={options.current} />
				</div>
			</div>
		</div>
		<div class="match-list-bar">
			{#if !appWindow.isMobile}
				<div class="team-lists team-lists-red">
					{#each matchLists.filter((l) => l.team == teamData?.[0].id) as list, index (list.id)}
						<a class={{ "jump-link-button": true, "active-list": list.id == activeList }} data-team={teamData.findIndex((t) => t.id == list.team)} href={`#list-${list.id}`}>
							{list.name}
						</a>
					{/each}
				</div>
			{:else}
				{@const list = matchLists.find((l) => l.id == activeList)}
				<button class="jump-link-button" data-team={teamData.findIndex((t) => t.id == (list?.team ?? 0))}>{list?.name}</button>
			{/if}
			<div class="round-counter">
				<p>{appWindow.isMobile ? "" : "Current"} Round: {matchData?.currentRound ? matchData.currentRound : "Pregame"}</p>
				{#if myData?.playerRole == "HOST"}
					<div class="toolbar-section">
						{#if matchData?.currentRound == 0}
							<button
								class="toolbar-button"
								onclick={() => {
									startGame(data.matchId);
								}}>Start Game</button
							>
						{:else}
							<EndRoundModal matchData={matchData!} teams={teamData}>
								{#snippet trigger()}
									<div class="toolbar-button">End Round</div>
								{/snippet}
							</EndRoundModal>
						{/if}
					</div>
				{/if}
			</div>
			{#if !appWindow.isMobile}
				<div class="team-lists team-lists-blue">
					{#each matchLists.filter((l) => l.team == teamData?.[1].id) as list}
						<a class={{ "jump-link-button": true, "active-list": list.id == activeList }} data-team={teamData.findIndex((t) => t.id == list.team)} href={`#list-${list.id}`}>
							{list.name}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="list-scroll-container" bind:this={listContainer}>
		{#each matchLists.toSorted((a, b) => (a.team ?? 0) - (b.team ?? 0)) as list, index}
			<div id={`slide-${list.id}`} class={{ "list-scroll-slide": true, "list-scroll-slide-active": list.id == activeList }} {@attach observeList}>
				<div class="list" id={`list-${list.id}`}>
					{#each list!.formations as formation}
						<PlayFormations {formation} {matchUnits} options={options.current} />
					{/each}
				</div>
				{#if activeList?.length && list.id != activeList}
					<a href={`#list-${list.id}`} class="list-scroll-overlay" aria-label="scroll list"></a>
				{/if}
			</div>
		{:else}
			<p class="center">No Lists have been loaded yet</p>
		{/each}
	</div>

	<!-- <MatchLogWindow {matchLogs} {matchUnits} playerList={matchPlayers} bind:open={componentsOpen.matchLog} /> -->
</div>

<MatchJoinModal
	bind:open={componentsOpen.join}
	joinCode={matchData?.joinCode ?? ""}
	matchId={matchData?.id.toString() ?? ""}
	teams={teamData.map((t) => ({ id: t.id, name: t.name }))}
	host={myData?.playerRole == "HOST"}
/>

<LoadListModal bind:open={componentsOpen.addList} matchId={matchData?.id.toString() ?? ""} teams={teamData.map((t) => ({ id: t.id, name: t.name }))} />

<MatchManagementModal bind:open={componentsOpen.management} {matchData} {teamData} {matchPlayers} {matchLists} />

<MatchResults bind:open={componentsOpen.matchResults} {teamData} {matchData} {matchLists} {matchUnits} />

<style>
	.play-body {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 4px;
		height: 100%;
	}
	.match-bars {
		display: flex;
		flex-direction: column;
		background-color: var(--background);
		z-index: 1;
		flex-shrink: 0;
	}
	.match-header {
		display: grid;
		grid-template-columns: max-content 1fr max-content;
		column-gap: 24px;
		border-bottom: 2px solid var(--border);
		flex-shrink: 0;
	}
	.team-names {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}

	.match-list-bar {
		display: grid;
		flex-shrink: 0;
		padding: var(--responsive-padding);
		gap: 36px;
	}

	.team-lists {
		display: flex;
		gap: 8px;
	}
	.team-lists-red {
		justify-content: end;
	}
	.round-counter {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-items: center;
		gap: 24px;
	}
	.toolbar-section {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.toolbar-item {
		align-self: center;
		justify-self: center;
		padding: 0px 16px;
		font-size: 24px;
		text-align: center;
		width: max-content;
	}
	.toolbar-button {
		padding: var(--responsive-padding);
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
	.jump-link-button {
		padding: 4px 6px;
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		align-content: center;
	}
	.jump-link-button:hover {
		transform: translateY(-2px);
	}
	.jump-link-button[data-team="0"] {
		color: lightgray;
		background-color: rgb(228, 0, 0);
		box-shadow:
			0px -3px 0px rgb(122, 0, 0) inset,
			0px 4px 5px -3px rgb(122, 0, 0);
	}
	.jump-link-button[data-team="0"]:active {
		box-shadow:
			3px 6px 12px rgb(122, 0, 0) inset,
			-3px -6px 12px rgb(122, 0, 0) inset;
		transform: translateY(-2px);
	}
	.jump-link-button[data-team="1"] {
		color: lightgray;
		background-color: blue;
		box-shadow:
			0px -3px 0px rgb(0, 29, 92) inset,
			0px 4px 5px -3px rgb(0, 29, 92);
	}
	.jump-link-button[data-team="1"]:active {
		box-shadow:
			3px 6px 12px rgb(0, 29, 92) inset,
			-3px -6px 12px rgb(0, 29, 92) inset;
		transform: translateY(-2px);
	}
	.active-list[data-team="0"] {
		box-shadow: 0px 0px 5px 5px rgb(255, 108, 108);
	}
	.active-list[data-team="1"] {
		box-shadow: 0px 0px 5px 5px rgb(21, 95, 255);
	}
	.list-scroll-container {
		display: flex;
		overflow-y: auto;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		flex: 1;
		gap: 8px;
	}
	.list-scroll-slide {
		width: 90%;
		height: 100%;
		scroll-snap-align: center;
		flex-shrink: 0;
		opacity: 0.5;
		position: relative;
	}
	.list-scroll-slide:first-of-type {
		margin-left: 5%;
	}

	.list-scroll-slide:last-of-type {
		margin-right: 5%;
	}
	.list-scroll-slide-active {
		opacity: 1;
	}
	.list-scroll-overlay {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0px;
	}
	.list {
		overflow-x: auto;
	}

	@media (max-width: 600px) {
		.team-name-red,
		.team-name-blue {
			display: grid;
			grid-template-columns: subgrid;
			grid-column: span 2;
			gap: 8px;
		}
		.match-list-bar {
			grid-template-columns: 1fr 2fr;
		}
		.round-counter {
			gap: 4px;
		}
	}
	@media (min-width: 600px) {
		.team-name-red,
		.team-name-blue {
			display: flex;
			gap: 8px;
		}
		.team-name-red {
			border-bottom: 2px solid red;
			justify-content: end;
			margin-right: 16px;
		}
		.team-name-blue {
			border-bottom: 2px solid blue;
			margin-left: 16px;
			justify-content: start;
			flex-direction: row-reverse;
		}
		.match-list-bar {
			grid-template-columns: 1fr max-content 1fr;
		}
	}
</style>
