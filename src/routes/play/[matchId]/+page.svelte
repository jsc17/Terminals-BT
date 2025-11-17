<script lang="ts">
	import { PlayFormations, DisplayOptionsPopover, Log, PlayFullList } from "./components";
	import { PersistedState, watch } from "runed";
	import { type PlayList, type LogRound, type PlayFormation, type PlayUnit } from "../types/types";
	import { PlaymodeOptionsSchema, type PlaymodeOptionsOutput } from "../schema/playmode";
	import DropdownMenu from "$lib/generic/components/DropdownMenu.svelte";
	import * as v from "valibot";
	import { safeParseJSON } from "$lib/utilities/utilities";
	import { type Source } from "sveltekit-sse";
	import { getContext, setContext } from "svelte";
	import { Dialog, Popover, Separator } from "$lib/generic";
	import { getAllPlayerData, getTeamData, getMyData, getMatchDetails, getPlayerData } from "../remote/matchData.remote";
	import { nanoid } from "nanoid";
	import MatchJoinModal from "./components/ui/MatchJoinModal.svelte";
	import { CaretLeft, CaretRight } from "phosphor-svelte";
	import { toastController } from "$lib/stores";

	let { data } = $props();

	let connection: Source = getContext("connection");
	const matchChannel = connection.select(`${data.matchId}`);
	matchChannel.subscribe((message: string) => {
		console.log("Message Received", message);
		if (message == "") return;
		const event: { type: string; data: string } = safeParseJSON(message);
		if (event) {
			switch (event.type) {
				case "playerJoined":
					const newPlayerData: { nickname: string; teamId: number; playerId: string } = safeParseJSON(event.data);
					toastController.addToast(`${newPlayerData.nickname} has joined the match on team ${newPlayerData.teamId}`);
					getPlayerData({ playerId: newPlayerData.playerId, matchId: data.matchId }).then((result) => {
						if (result && result.teamId) {
							const playerFormationList: PlayFormation[] = [];
							for (const formation of result.formations) {
								const units: PlayUnit[] = formation.units
									.filter((u) => !u.secondary)
									.map((u) => ({
										id: u.id,
										mulId: u.mulId,
										skill: u.skill,
										pending: { damage: u.pendingDamage, heat: u.pendingHeat, crits: [] },
										current: { damage: u.currentDamage, heat: u.currentHeat, crits: [], disabledAbilities: [] }
									}));
								const secondaryUnits: PlayUnit[] = formation.units
									.filter((u) => u.secondary)
									.map((u) => ({
										id: u.id,
										mulId: u.mulId,
										skill: u.skill,
										pending: { damage: u.pendingDamage, heat: u.pendingHeat, crits: [] },
										current: { damage: u.currentDamage, heat: u.currentHeat, crits: [], disabledAbilities: [] }
									}));
								playerFormationList.push({ id: nanoid(6), name: formation.name, type: formation.type, units });
							}
							playerLists.push({ id: nanoid(10), owner: result.playerNickname, team: result.teamId, formations: playerFormationList });
						}
					});
					break;
				case "damageTaken":
					const damageData: { unitId: number; pendingDamage: number; currentDamage: number } = safeParseJSON(event.data);
					for (const list of playerLists) {
						for (const formation of list.formations) {
							for (const unit of formation.units) {
								if (unit.id == damageData.unitId) {
									unit.current.damage = damageData.currentDamage;
									unit.pending.damage = damageData.pendingDamage;
									break;
								}
							}
						}
					}
					break;
				case "heatChanged":
					const heatData: { unitId: number; pendingHeat: number; currentHeat: number } = safeParseJSON(event.data);
					for (const list of playerLists) {
						for (const formation of list.formations) {
							for (const unit of formation.units) {
								if (unit.id == heatData.unitId) {
									unit.current.heat = heatData.currentHeat;
									unit.pending.heat = heatData.pendingHeat;
									break;
								}
							}
						}
					}
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
	const playerData = $derived(await getAllPlayerData(data.matchId));

	let playerLists = $state<PlayList[]>([]);

	watch(
		() => playerData,
		() => {
			playerLists = playerData
				?.filter((p) => p.teamId != null && p.formations.length != 0)
				.sort((a, b) => {
					return a.teamId! - b.teamId!;
				})
				.map((p) => {
					const playerFormationList: PlayFormation[] = [];
					for (const formation of p.formations) {
						const units: PlayUnit[] = formation.units
							.filter((u) => !u.secondary)
							.map((u) => ({
								id: u.id,
								mulId: u.mulId,
								skill: u.skill,
								pending: { damage: u.pendingDamage, heat: u.pendingHeat, crits: [] },
								current: { damage: u.currentDamage, heat: u.currentHeat, crits: [], disabledAbilities: [] }
							}));
						const secondaryUnits: PlayUnit[] = formation.units
							.filter((u) => u.secondary)
							.map((u) => ({
								id: u.id,
								mulId: u.mulId,
								skill: u.skill,
								pending: { damage: u.pendingDamage, heat: u.pendingHeat, crits: [] },
								current: { damage: u.currentDamage, heat: u.currentHeat, crits: [], disabledAbilities: [] }
							}));
						playerFormationList.push({ id: nanoid(6), name: formation.name, type: formation.type, units });
					}
					return { id: nanoid(10), owner: p.playerNickname, team: p.teamId, formations: playerFormationList } as PlayList;
				});
		}
	);

	let joinModalOpen = $state(false);
</script>

<svelte:head>
	<title>Terminal's Play Mode</title>
</svelte:head>

<div class="play-body">
	<div class="space-between">
		<p>{matchData?.name}</p>
		<p>
			Join Code: <Dialog title="Join Code">
				{#snippet trigger()}
					Reveal
				{/snippet}
				{#snippet description()}
					This code will allow players to join the game
				{/snippet}
				<div style="padding: 4px 10px">{matchData?.joinCode}</div>
			</Dialog>
		</p>
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
								joinModalOpen = true;
							}}>Join Match</button
						>
					{:else if myData.playerRole == "HOST"}
						<DropdownMenu
							items={[
								{
									type: "item",
									label: "Join Match as Player",
									onSelect: () => {
										joinModalOpen = true;
									}
								},
								{ type: "item", label: "Player List", onSelect: () => {} },
								{ type: "item", label: "Manage Teams", onSelect: () => {} },
								{ type: "item", label: "End Match", onSelect: () => {} }
							]}
							triggerClasses="transparent-button"
						>
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
					<button class="toolbar-button">End Round</button>
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
	{#if playerLists.length > 1}
		<div class="list-selector">
			{#each playerLists as list (list.id)}
				<a class="jump-link-button" data-team={teamData.findIndex((t) => t.id == list.team)} href={`#${list.id}`}>
					{list.owner}
				</a>
			{/each}
		</div>
	{:else}
		<div></div>
	{/if}
	<div>
		<div class="list-scroll-container">
			{#each playerLists as list, index (list.id)}
				<div class="list-scroll-slide">
					<a class={{ "list-scroll-button": true, "list-scroll-button-disabled": index == 0 }} href={index != 0 ? `#${playerLists[index - 1].id}` : ""}
						><CaretLeft style="fill: var(--button-text);" /></a
					>
					<div class="list" id={list.id}>
						{#each list.formations as formation}
							<PlayFormations {formation} options={options.current} />
						{/each}
					</div>
					<a
						class={{ "list-scroll-button": true, "list-scroll-button-disabled": index == playerLists.length - 1 }}
						href={index != playerLists.length - 1 ? `#${playerLists[index + 1].id}` : ""}><CaretRight style="fill: var(--button-text);" /></a
					>
				</div>
			{/each}
		</div>
	</div>
</div>

<MatchJoinModal
	bind:open={joinModalOpen}
	joinCode={matchData?.joinCode ?? ""}
	matchId={matchData?.id.toString() ?? ""}
	teams={teamData.map((t) => ({ id: t.id, name: t.name }))}
	host={myData?.playerRole == "HOST"}
/>

<style>
	.play-body {
		position: relative;
		display: grid;
		grid-template-rows: repeat(3, max-content) 1fr;
		gap: 4px;
		height: 100%;
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
