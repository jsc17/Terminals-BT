<script lang="ts">
	import eraLists from "$lib/data/erasFactionsList.json";
	import { eras, factions } from "$lib/data/erasFactionLookup.js";
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { getContext } from "svelte";
	import { resultList } from "$lib/utilities/resultList.svelte";

	let list: any = getContext("list");

	let searchButton: HTMLButtonElement;
	let { status = $bindable() } = $props();
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
			return factions.get(a)! > factions.get(b)! ? 1 : -1;
		});
		return allowed;
	});
	$effect(() => {
		if (status == "loading") {
			searchButton.setAttribute("disabled", "");
		} else {
			searchButton.removeAttribute("disabled");
		}
	});

	async function getUnits() {
		if (resultList.details.era == -1 || resultList.details.faction == -1) {
			alert("Please check era and faction selections and try again");
			return;
		}

		resultList.clear();
		status = "loading";

		await resultList.loadUnits();

		list.details.era = eras.get(resultList.details.era)!;
		list.details.faction = factions.get(resultList.details.faction)!;
		if (resultList.general == -1) {
			list.details.general = "Blank";
		} else {
			list.details.general = factions.get(resultList.general)!;
		}
		if (list.details.name == "") {
			list.details.name = list.details.era + " " + list.details.faction;
		}
		status = "loaded";
		if (resultList.results.length == 0) {
			status = "error";
		}
	}
</script>

<main>
	<button
		class="accordian"
		class:hidden={!appWindow.isMobile}
		on:click={() => {
			showParameters = !showParameters;
		}}>
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
		<form class:parameters={!appWindow.isMobile} class:parameters-mobile={appWindow.isMobile}>
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
				{#if resultList.details.era == -1}
					<select id="factionParameter" disabled> </select>
				{:else}
					<select id="factionParameter" bind:value={resultList.details.faction}>
						{#each allowedFactions as faction}
							<option value={faction}>{factions.get(faction)}</option>
						{/each}
					</select>
				{/if}
			</div>
			<div class="parameter">
				<p>General:</p>
				<a href={`http://masterunitlist.info/Era/FactionEraDetails?FactionId=${resultList.details.faction}&EraId=${resultList.details.era}`}>{factions.get(resultList.general)}</a>
			</div>
			<div><button id="getData" bind:this={searchButton} onclick={getUnits}>Search</button></div>
		</form>
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
