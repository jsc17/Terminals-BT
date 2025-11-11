<script lang="ts">
	import { PlayFormations, DisplayOptionsPopover, Log, PlayFullList } from "./components";
	import { PersistedState } from "runed";
	import { type PlayList, type LogRound } from "$lib/playmode/types";
	import { PlaymodeOptionsSchema, type PlaymodeOptionsOutput } from "../schema/playmode";
	import { loadMULUnit } from "$lib/utilities/loadUtilities";
	import { SvelteMap } from "svelte/reactivity";
	import type { MulUnit } from "$lib/types/listTypes";
	import { db } from "$lib/offline/db";
	import DropdownMenu from "$lib/generic/components/DropdownMenu.svelte";
	import * as v from "valibot";
	import { safeParseJSON } from "$lib/utilities/utilities";
	import { type Source } from "sveltekit-sse";
	import { getContext } from "svelte";
	import { Popover, Separator } from "$lib/generic";
	import { getPlayerList, getTeamList, getRole } from "../remote/match.remote";

	let { data } = $props();

	let messages = $state<string[]>([]);
	let connection: Source = getContext("connection");

	const matchChannel = connection.select(`${data.matchId}`);
	matchChannel.subscribe((message: string) => {
		messages.push(message);
	});

	const options = new PersistedState<PlaymodeOptionsOutput>("playOptions", v.parse(PlaymodeOptionsSchema, {}), {
		serializer: {
			serialize: JSON.stringify,
			deserialize: (savedData) => v.parse(PlaymodeOptionsSchema, safeParseJSON(savedData) ?? {})
		}
	});
	const role = $derived(getRole(data.matchId).current);
	const teamList = $derived(getTeamList(data.matchId).current);
	const playerList = $derived(getPlayerList(data.matchId).current);
</script>

<svelte:head>
	<title>Terminal's Play Mode</title>
</svelte:head>

<div class="play-body">
	<div class="match-bars">
		<div class="match-header">
			<div class="toolbar-item">Red</div>
			<div class="toolbar-item">1</div>
			<div class="toolbar-item">Round: 0</div>
			<div class="toolbar-item">3</div>
			<div class="toolbar-item">Blue</div>

			<!-- <div class="toolbar-section">
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
			</div> -->
		</div>
		<div class="toolbar">
			<div class="toolbar-section">
				<div class="toolbar-item">
					<Popover>
						{#snippet trigger()}
							Player List
						{/snippet}
						<div class="player-list">
							<p class="team-name">Neutral</p>
							<Separator />
							{#each playerList?.filter((p) => p.teamId == null) as player}
								<p class="player-name">{player.playerNickname} - {player.playerRole}</p>
							{/each}
							{#each teamList as team}
								<p class="team-name">{team.name}</p>
								<Separator />
								{#each playerList?.filter((p) => p.teamId == team.id) as player}
									<p class="player-name">{player.playerNickname} - {player.playerRole}</p>
								{:else}
									<p class="player-name">No Players</p>
								{/each}
							{/each}
						</div>
					</Popover>
				</div>
				<DisplayOptionsPopover bind:options={options.current} />
			</div>
			<div class="toolbar-section">
				<button class="toolbar-button">End Round</button>
			</div>
		</div>
	</div>

	<p>{role ?? "observer"}</p>
	<!-- <div class="flex-between">
		<button class="play-log-button" onclick={openLog}>Match Log</button>
	</div> -->

	<!-- {#if playList}
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
	{/if} -->
</div>

<!-- <Log bind:open={logDrawerOpen} currentRoundLog={currentRoundLog.current} {fullLogs} {playList}></Log> -->

<style>
	.play-body {
		position: relative;
		overflow: auto;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.match-bars {
		position: sticky;
		top: 0;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.match-header {
		padding: 0px 5dvw;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 16px;
		border: 1px solid var(--border);
		background-image: linear-gradient(to right, red 30%, red 35%, var(--surface-color) 45%, var(--surface-color) 55%, blue 65%, blue 70%);
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
	.player-list {
		display: flex;
		flex-direction: column;
		padding: 4px 12px;
	}
	.player-name {
		font-size: 16px;
	}
	.team-name {
		color: var(--surface-color-light-text-color);
		font-size: 20px;
		margin-top: 8px;
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
