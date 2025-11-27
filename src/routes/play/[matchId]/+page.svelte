<script lang="ts">
	import { PlayFormations, DisplayOptionsPopover } from "./components";
	import { PersistedState, watch } from "runed";
	import { type PlayList, type LogRound, type PlayFormation, type PlayUnit } from "../types/types";
	import { PlaymodeOptionsSchema, type PlaymodeOptionsOutput } from "../schema/playmode";
	import DropdownMenu from "$lib/generic/components/DropdownMenu.svelte";
	import * as v from "valibot";
	import { safeParseJSON } from "$lib/utilities/utilities";
	import { type Source } from "sveltekit-sse";
	import { getContext, setContext } from "svelte";
	import { getAllPlayerData, getTeamData, getMyData, getMatchDetails, deleteMatch, getPlayerData } from "./remote/matchData.remote";
	import MatchJoinModal from "./components/ui/MatchJoinModal.svelte";
	import { CaretLeft, CaretRight } from "phosphor-svelte";
	import EndRoundModal from "./components/ui/EndRoundModal.svelte";
	import { SvelteMap } from "svelte/reactivity";
	import type { MulUnit } from "$lib/types/listTypes";
	import { handleUnitUpdate, initializePlayerList } from "./utilities/handleMatchEvents";
	import { toastController } from "$lib/stores";
	import { goto } from "$app/navigation";
	import type { MenuItem } from "$lib/generic/types";
	import MatchManagementModal from "./components/ui/MatchManagementModal.svelte";
	import { startGame } from "./remote/matchUpdates.remote";

	let { data } = $props();

	setContext("matchId", data.matchId);

	let connection: Source = getContext("connection");
	const matchChannel = connection.select(`${data.matchId}`);
	matchChannel.subscribe((message: string) => {
		if (message == "") return;
		const event: { type: string; data: string } = safeParseJSON(message);
		if (event) {
			switch (event.type) {
				case "playerJoined":
					const newPlayerData: { nickname: string; teamId: number; playerId: string } = safeParseJSON(event.data);
					toastController.addToast(`${newPlayerData.nickname} has joined the match on team ${newPlayerData.teamId}`);
					getPlayerData({ playerId: newPlayerData.playerId, matchId: data.matchId }).then(async (r) => {
						if (r) playerList.push({ id: r.playerId, team: r.teamId ?? undefined, nickname: r.playerNickname, list: await initializePlayerList(r, matchUnits) });
					});
					break;
				case "matchStart":
					getMatchDetails(data.matchId).refresh();
					break;
				case "updateUnit": {
					const unitId = Number(event.data);
					if (isNaN(unitId)) console.log("Received update with invalid unit id");
					if (!matchUnits.has(unitId)) console.log("Id not found in existing units");
					handleUnitUpdate(unitId, matchUnits);
					break;
				}
				case "roundEnd":
					getMatchDetails(data.matchId).refresh();
					getTeamData(data.matchId).refresh();
					matchUnits.forEach((u) => {
						handleUnitUpdate(u.data.id, matchUnits);
					});
					break;
				case "matchUpdate":
					getMatchDetails(data.matchId).refresh();
					getTeamData(data.matchId).refresh();
					break;
				case "matchDelete":
					toastController.addToast("Host deleted the match. Redirecting you to match selection.");
					goto("/play");
					break;
				case "removePlayer":
					playerList = playerList.filter((p) => p.id != event.data);
					getMyData(data.matchId).refresh();
					break;
				default:
					console.log("Unhandled Event");
			}
		} else {
			console.log("Invalid json message");
		}
	});

	const options = new PersistedState<PlaymodeOptionsOutput>("playOptions", v.parse(PlaymodeOptionsSchema, {}), {
		serializer: {
			serialize: JSON.stringify,
			deserialize: (savedData) => v.parse(PlaymodeOptionsSchema, safeParseJSON(savedData) ?? {})
		}
	});
	const matchData = $derived(await getMatchDetails(data.matchId));
	const myData = $derived(await getMyData(data.matchId));
	const teamData = $derived(await getTeamData(data.matchId));
	getAllPlayerData(data.matchId).then((results) => {
		console.log("initializing lists");
		results.forEach(async (r) => {
			playerList.push({ id: r.playerId, team: r.teamId ?? undefined, nickname: r.playerNickname, list: await initializePlayerList(r, matchUnits) });
		});
		console.log("lists set");
	});

	let playerList = $state<{ id: string; team?: number; nickname: string; list?: PlayList }[]>([]);
	let matchUnits = new SvelteMap<number, { data: PlayUnit; reference?: MulUnit; image?: string }>();

	const modalsOpen = $state({ join: false, management: false });

	const hostMenuOptions: MenuItem[] = $derived([
		{ type: "item", label: "Join Match as Player", onSelect: () => (modalsOpen.join = true) },
		{ type: "item", label: "Manage Match", onSelect: () => (modalsOpen.management = true) },
		{ type: "item", label: "End Match", onSelect: () => {} },
		{
			type: "item",
			label: "Delete Match",
			onSelect: () => {
				if (confirm("Delete match immediately and end without showing summary screen?")) deleteMatch(data.matchId);
			}
		},
		{ type: "separator" },
		{ type: "info", label: `Join Code: ${matchData?.joinCode}` }
	]);
</script>

<svelte:head>
	<title>Terminal's Play Mode</title>
</svelte:head>

<div class="play-body">
	<div class="match-name-bar">
		<p>{matchData?.name}</p>
		<a href="/play">Return to match selection</a>
	</div>
	<div class="match-bars">
		<div class="match-header">
			<div class="toolbar-item">{teamData?.[0].name}</div>
			<div class="toolbar-item">{teamData?.[0].objectivePoints}</div>
			<div class="toolbar-item">Round: {matchData?.currentRound}</div>
			<div class="toolbar-item">{teamData?.[1].objectivePoints}</div>
			<div class="toolbar-item">{teamData?.[1].name}</div>
		</div>
		<div class="toolbar">
			<div class="toolbar-section">
				{#if data.username}
					{#if !myData}
						<button
							class="toolbar-button"
							onclick={() => {
								modalsOpen.join = true;
							}}>Join Match</button
						>
					{:else if myData.playerRole == "HOST"}
						<DropdownMenu items={myData.teamId ? hostMenuOptions.slice(1) : hostMenuOptions} triggerClasses="transparent-button">
							{#snippet trigger()}
								<div class="toolbar-button">Host Menu</div>
							{/snippet}
						</DropdownMenu>
					{/if}
				{:else}
					<div class="toolbar-item">Login to Join</div>
				{/if}
			</div>
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
			<div class="toolbar-section">
				<div>
					<DisplayOptionsPopover bind:options={options.current} />
				</div>
				<button class="toolbar-button">Match Log</button>
			</div>
		</div>
	</div>
	{#if playerList.filter((p) => p.list).length > 1}
		<div class="list-selector">
			{#each playerList.filter((p) => p.list) as player, index (player.id)}
				<a class="jump-link-button" data-team={teamData.findIndex((t) => t.id == player.team)} href={`#list-${index}`}>
					{player.nickname}
				</a>
			{/each}
		</div>
	{:else}
		<div></div>
	{/if}
	<div>
		<div class="list-scroll-container">
			{#each playerList.filter((p) => p.list) as player, index (player.id)}
				<div class="list-scroll-slide">
					<a class={{ "list-scroll-button": true, "list-scroll-button-disabled": index == 0 }} href={index != 0 ? `#list-${index - 1}` : ""}>
						<CaretLeft style="fill: var(--button-text);" />
					</a>
					<div class="list" id={`list-${index}`}>
						{#each player.list!.formations as formation}
							<PlayFormations {formation} {matchUnits} options={options.current} />
						{/each}
					</div>
					<a
						class={{ "list-scroll-button": true, "list-scroll-button-disabled": index == playerList.length - 1 }}
						href={index != playerList.length - 1 ? `#list-${index + 1}` : ""}
					>
						<CaretRight style="fill: var(--button-text);" />
					</a>
				</div>
			{:else}
				<p>No Lists loaded</p>
				<p>{playerList.length}</p>
			{/each}
		</div>
	</div>
</div>

<MatchJoinModal
	bind:open={modalsOpen.join}
	joinCode={matchData?.joinCode ?? ""}
	matchId={matchData?.id.toString() ?? ""}
	teams={teamData.map((t) => ({ id: t.id, name: t.name }))}
	host={myData?.playerRole == "HOST"}
/>

<MatchManagementModal bind:open={modalsOpen.management} {matchData} {teamData} {playerList} />

<style>
	.play-body {
		position: relative;
		display: grid;
		grid-template-rows: repeat(3, max-content) 1fr;
		gap: 4px;
		height: 100%;
	}
	.match-name-bar {
		display: flex;
		justify-content: space-between;
		padding: 0px 24px;
	}
	.match-bars {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
		background-color: var(--background);
		z-index: 1;
	}
	.match-header {
		padding: 0px 5dvw;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 16px;
		border: 1px solid var(--border);
		background-image: linear-gradient(to right, rgb(180, 0, 0) 30%, rgb(180, 0, 0) 35%, var(--surface-color) 45%, var(--surface-color) 55%, blue 65%, blue 70%);
	}
	.toolbar {
		display: flex;
		justify-content: space-between;
		background-color: var(--surface-color);
		border: 1px solid var(--border);
	}
	.toolbar-section {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 0px 16px;
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
	.list-selector {
		padding: var(--responsive-padding);
		display: flex;
		justify-content: center;
		gap: 16px;
	}
	.jump-link-button {
		padding: 4px 6px;
		border: 1px solid var(--border);
	}
	.jump-link-button[data-team="0"] {
		background-color: rgb(180, 0, 0);
	}
	.jump-link-button[data-team="1"] {
		background-color: blue;
	}
	.list-scroll-container {
		display: flex;
		overflow-y: auto;
		overflow-x: hidden;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		height: 100%;
	}
	.list-scroll-slide {
		width: 100%;
		height: 100%;
		flex-shrink: 0;
		scroll-snap-align: start;
		display: grid;
		grid-template-columns: 3% 1fr 3%;
	}
	.list {
		overflow-x: auto;
		scroll-snap-type: y mandatory;
	}
	.list-scroll-button {
		background-color: var(--button);
		padding: 6px;
		border-radius: 50%;
		align-self: center;
		justify-self: center;
		aspect-ratio: 1/1;
	}
	.list-scroll-button-disabled {
		background-color: gray;
		cursor: default;
	}
</style>
