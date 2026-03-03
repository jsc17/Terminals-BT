<script lang="ts">
	import { PlayFormations, EndRoundModal, MatchJoinModal, MatchManagementModal } from "./components";
	import { PersistedState } from "runed";
	import { type PlayList, type PlayUnit } from "../types/types";
	import { PlaymodeOptionsSchema, type PlaymodeOptionsOutput } from "../schema/playmode";
	import * as v from "valibot";
	import { safeParseJSON } from "$lib/utilities/utilities";
	import { onMount, setContext } from "svelte";
	import { getAllPlayerData, getTeamData, getMyData, getMatchDetails, getLogs } from "./remote/matchData.remote";
	import { SvelteMap } from "svelte/reactivity";
	import { initializePlayerList, processMessage } from "./utilities/handleMatchEvents";
	import type { MatchLog } from "$lib/generated/prisma/browser";
	import LoadListModal from "./components/ui/LoadListModal.svelte";
	import type { Attachment } from "svelte/attachments";
	import { appWindow } from "$lib/stores";
	import MatchResults from "./components/ui/MatchResults.svelte";
	import Dialog from "$lib/generic/components/Dialog.svelte";
	import MenuPlayer from "./components/ui/MenuPlayer.svelte";
	import MenuHost from "./components/ui/MenuHost.svelte";
	import type { PageProps } from "./$types";
	import RoundTimer from "./components/ui/RoundTimer.svelte";

	let { params, data }: PageProps = $props();

	const matchId = $derived(params.matchId);

	// svelte-ignore state_referenced_locally
	setContext("matchId", matchId);

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

	const matchData = $derived(await getMatchDetails(matchId));
	const myData = $derived(await getMyData(matchId));
	const teamData = $derived(await getTeamData(matchId));

	// svelte-ignore state_referenced_locally
	getAllPlayerData(matchId).then((results) => {
		results.forEach(async (r) => {
			matchPlayers.push({ id: r.id, team: r.teamId ?? undefined, nickname: r.playerNickname, role: r.playerRole });
			for (const list of r.lists) matchLists.push(await initializePlayerList(list, matchUnits));
		});
	});
	// svelte-ignore state_referenced_locally
	getLogs({ matchId, lastLogId: 0 }).then((results) => (matchLogs = matchLogs.concat(results)));

	const componentsOpen = $state({ join: false, addList: false, management: false, matchLog: false, matchResults: false, matchOverAlert: false, endRound: false });

	let listContainer = $state<HTMLDivElement>();
	let activeList = $state<string>();
	let observer = $state<IntersectionObserver>();

	onMount(() => {
		const es = new EventSource(`/play/${matchId}/stream`);
		es.onmessage = ({ data }) => processMessage(data, matchPlayers, matchUnits, matchLogs, matchLists);

		observer = new IntersectionObserver(
			(entries) => {
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
			<div class="team-name-red">
				<div class="toolbar-item">{teamData?.[0]?.name}</div>
				<div class="toolbar-item">{teamData?.[0]?.objectivePoints}</div>
			</div>
			<div class="match-details">
				<p>Round: {matchData?.currentRound}</p>
				<RoundTimer {matchData} />
			</div>
			<div class="team-name-blue">
				<div class="toolbar-item">{teamData?.[1]?.name}</div>
				<div class="toolbar-item">{teamData?.[1]?.objectivePoints}</div>
			</div>
		</div>
		<div class="match-list-bar">
			<div class="toolbar-section" style="justify-self: start;">
				<MenuPlayer bind:options={options.current} username={data.username} {myData} {componentsOpen} />
			</div>
			{#if !appWindow.isMobile}
				<div class="team-lists">
					{#each matchLists.filter((l) => l.team == teamData?.[0].id) as list (list.id)}
						<a class={{ "jump-link-button": true, "active-list": list.id == activeList }} data-team={teamData.findIndex((t) => t.id == list.team)} href={`#list-${list.id}`}>
							{list.name}
						</a>
					{/each}
					{#each matchLists.filter((l) => l.team == teamData?.[1].id) as list}
						<a class={{ "jump-link-button": true, "active-list": list.id == activeList }} data-team={teamData.findIndex((t) => t.id == list.team)} href={`#list-${list.id}`}>
							{list.name}
						</a>
					{/each}
				</div>
			{:else}
				{@const list = matchLists.find((l) => l.id == activeList)}
				<button class="jump-link-button" data-team={teamData.findIndex((t) => t.id == (list?.team ?? 0))}>{list?.name}</button>
			{/if}
			<div class="toolbar-section" style="justify-self: end;">
				{#if myData?.playerRole == "HOST"}
					<MenuHost {matchData} {componentsOpen} />
				{/if}
			</div>
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
<EndRoundModal matchData={matchData!} teams={teamData} bind:open={componentsOpen.endRound} />
<MatchResults bind:open={componentsOpen.matchResults} {teamData} {matchData} {matchLists} {matchUnits} />
<Dialog bind:open={componentsOpen.matchOverAlert} title="Match Timer Expired" contentProps={{ interactOutsideBehavior: "ignore" }}>
	<p>The match has run out of time. You may still continue playing.</p>
</Dialog>

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
		grid-template-columns: 1fr max-content 1fr;
		column-gap: 24px;
		/* border-bottom: 2px solid var(--border); */
		flex-shrink: 0;
	}
	.match-list-bar {
		display: grid;
		flex-shrink: 0;
		padding: var(--responsive-padding);
		gap: 32px;
		margin-top: 8px;
	}

	.team-lists {
		display: flex;
		gap: 48px;
		justify-content: center;
	}
	.match-details {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;

		p {
			font-size: 20px;
		}
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

	@media (max-width: 600px) {
		.team-name-red,
		.team-name-blue {
			display: grid;
			grid-template-columns: subgrid;
			grid-column: span 2;
			gap: 8px;
		}
		.team-name-red {
			border-bottom: 1px solid red;
		}
		.team-name-blue {
			border-bottom: 1px solid blue;
		}
		.match-list-bar {
			grid-template-columns: 1fr auto 1fr;
		}
		.match-details {
			grid-row: span 2;
		}
	}
	@media (min-width: 600px) {
		.team-name-red,
		.team-name-blue {
			display: flex;
			gap: 24px;
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
			grid-template-columns: 1fr auto 1fr;
		}
	}
</style>
