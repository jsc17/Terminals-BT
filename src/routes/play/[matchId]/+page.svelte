<script lang="ts">
	import { PlayFormations, DisplayOptionsPopover, EndRoundModal, MatchJoinModal, MatchManagementModal } from "./components";
	import { PersistedState } from "runed";
	import { type PlayList, type PlayUnit } from "../types/types";
	import { PlaymodeOptionsSchema, type PlaymodeOptionsOutput } from "../schema/playmode";
	import DropdownMenu from "$lib/generic/components/DropdownMenu.svelte";
	import * as v from "valibot";
	import { safeParseJSON } from "$lib/utilities/utilities";
	import { onMount, setContext } from "svelte";
	import { getAllPlayerData, getTeamData, getMyData, getMatchDetails, deleteMatch, getPlayerData, getLogs } from "./remote/matchData.remote";
	import { startGame } from "./remote/matchManagement.remote";
	import { CaretLeft, CaretRight } from "phosphor-svelte";
	import { SvelteMap } from "svelte/reactivity";
	import { initializePlayerList, processMessage } from "./utilities/handleMatchEvents";
	import type { MenuItem } from "$lib/generic/types";
	import type { MatchLog } from "$lib/generated/prisma/browser";
	import MatchLogWindow from "./components/ui/MatchLogWindow.svelte";
	import { goto } from "$app/navigation";
	import LoadListModal from "./components/ui/LoadListModal.svelte";

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

	const componentsOpen = $state({ join: false, addList: false, management: false, matchLog: false });

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
				{ type: "item", label: "End Match", onSelect: () => {} },
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

	onMount(() => {
		const es = new EventSource(`/play/${data.matchId}/stream`);
		es.onmessage = ({ data }) => processMessage(data, matchPlayers, matchUnits, matchLogs, matchLists);
		return () => {
			es.close();
		};
	});
</script>

<svelte:head>
	<title>Terminal's Play Mode</title>
</svelte:head>

<div class="play-body">
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
				<DropdownMenu items={menuOptions} triggerClasses="transparent-button">
					{#snippet trigger()}
						<div class="toolbar-button">Menu</div>
					{/snippet}
				</DropdownMenu>
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
				<button class={{ "toolbar-button": true, "toolbar-button-selected": componentsOpen.matchLog }} onclick={() => (componentsOpen.matchLog = !componentsOpen.matchLog)}
					>Match Log</button
				>
			</div>
		</div>
	</div>
	{#if matchLists.length > 1}
		<div class="list-selector">
			{#each matchLists.toSorted((a, b) => {
				return (a.team ?? 0) - (b.team ?? 0);
			}) as list, index (list.id)}
				<a class="jump-link-button" data-team={teamData.findIndex((t) => t.id == list.team)} href={`#list-${index}`}>
					{list.name}
				</a>
			{/each}
		</div>
	{/if}
	<div class="list-scroll-container">
		{#each matchLists.toSorted((a, b) => {
			return (a.team ?? 0) - (b.team ?? 0);
		}) as list, index (list.id)}
			<div class="list-scroll-slide">
				<a class={{ "list-scroll-button": true, "list-scroll-button-disabled": index == 0 }} href={index != 0 ? `#list-${index - 1}` : ""}>
					<CaretLeft style="fill: var(--button-text);" />
				</a>
				<div class="list" id={`list-${index}`}>
					{#each list!.formations as formation}
						<PlayFormations {formation} {matchUnits} options={options.current} />
					{/each}
				</div>
				<a class={{ "list-scroll-button": true, "list-scroll-button-disabled": index == matchLists.length - 1 }} href={index != matchLists.length - 1 ? `#list-${index + 1}` : ""}>
					<CaretRight style="fill: var(--button-text);" />
				</a>
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
		gap: 4px;
		background-color: var(--background);
		z-index: 1;
		flex-shrink: 0;
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
	.toolbar-button-selected {
		background-color: var(--surface-color-extra-light);
		color: var(--surface-color-light-text-color);
	}
	.list-selector {
		padding: var(--responsive-padding);
		display: flex;
		justify-content: center;
		gap: 16px;
		flex-shrink: 0;
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
		flex: 1;
	}
	.list-scroll-slide {
		width: 100%;
		height: 100%;
		scroll-snap-align: start;
		display: grid;
		grid-template-columns: 3% 1fr 3%;
		flex-shrink: 0;
	}
	.list {
		overflow-x: auto;
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
