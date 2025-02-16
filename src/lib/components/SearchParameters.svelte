<script lang="ts">
	import eraLists from "$lib/data/erasFactionsList.json";
	import { eras, factions } from "$lib/data/erasFactionLookup.js";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { getContext } from "svelte";
	import type { List } from "../../routes/listbuilder/types/list.svelte";

	const resultList: ResultList = getContext("resultList");
	const list: List = getContext("list");

	let showParameters = $state(false);

	let allowedFactions = $derived.by(() => {
		let allowed: number[] = [];
		eraLists.forEach((era) => {
			if (era.id == resultList.details.era) {
				era.factions.forEach((faction) => {
					allowed = allowed.concat(faction[1]);
				});
			}
		});
		allowed.sort((a, b) => {
			return factions.get(a)! > factions.get(b)! ? 1 : 0;
		});
		return allowed;
	});
</script>

<main>
	<button
		class="accordian"
		class:hidden={!appWindow.isMobile}
		onclick={() => {
			showParameters = !showParameters;
		}}
	>
		<div class="space-between">
			<div></div>
			<div>Search Parameters</div>
			<div>
				{#if showParameters}
					-
				{:else}
					+
				{/if}
			</div>
		</div>
	</button>
	<div class="card" class:hidden={appWindow.isMobile && !showParameters}>
		<div class:parameters={!appWindow.isMobile} class:parameters-mobile={appWindow.isMobile}>
			<div class="parameter">
				<label for="eraParameter">Era:</label>
				<select bind:value={resultList.details.era} id="eraParameter">
					{#each eraLists as era}
						<option value={era.id}>{eras.get(era.id)}</option>
					{/each}
				</select>
			</div>
			<div class="parameter">
				<label for="factionParameter">Faction:</label>
				<select id="factionParameter" bind:value={resultList.details.faction}>
					<option value={0}>Any</option>
					{#each allowedFactions as faction}
						<option value={faction}>{factions.get(faction)}</option>
					{/each}
				</select>
			</div>
			<div class="parameter">
				<p>General:</p>
				{#if resultList.details.era != 0 && resultList.details.faction != 0}
					<a href={`http://masterunitlist.info/Era/FactionEraDetails?FactionId=${resultList.details.faction}&EraId=${resultList.details.era}`}>{factions.get(resultList.general)}</a
					>
				{:else}
					<p>Select an Era and Faction</p>
				{/if}
			</div>
			<div>
				<button
					id="getData"
					onclick={() => {
						resultList.loadNewResults();
						list.details.era = resultList.details.era;
						list.details.faction = resultList.details.faction;
						list.details.general = resultList.general;
					}}>Search</button
				>
			</div>
		</div>
	</div>
</main>

<style>
	main {
		width: 100%;
	}
	.parameter {
		display: flex;
		gap: 8px;
	}
	.parameters {
		display: grid;
		grid-template-columns: repeat(3, 3fr) 1fr;
		gap: 16px;
		width: 100%;
	}
	.parameters-mobile {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	select {
		width: min(100%, 240px);
	}
	select:not([disabled]) {
		border-color: var(--ring);
	}
	button[disabled] {
		background-color: gray;
	}
	a {
		overflow: hidden;
	}
	p {
		margin: 0;
	}
	.accordian {
		height: 35px;
		width: 100%;
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--card-foreground);
		padding: 8px;
	}
</style>
