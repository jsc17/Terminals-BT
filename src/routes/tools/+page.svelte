<script lang="ts">
	import eraLists from "$lib/data/erasFactionsList.json";
	import { eras, factions } from "$lib/data/erasFactionLookup.js";
	import { getGeneralList } from "$lib/utilities/bt-utils";

	let searchButton: HTMLButtonElement;
	let selectedEra = $state(-1);
	let selectedFaction = $state(-1);

	let allowedFactions = $derived.by(() => {
		let allowed: number[] = [];
		eraLists.forEach((era) => {
			if (era.id == selectedEra) {
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
	let general = $derived(getGeneralList(selectedEra, selectedFaction));
	let link = $state("press search");
	function createLink() {
		link = `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=1&MaxPV=100`;
		if (general != undefined && general != -1) {
			link += `&Factions=${general}`;
		}
		if (selectedFaction != undefined) {
			link += `&Factions=${selectedFaction}`;
		}
		if (selectedEra != undefined) {
			link += `&AvailableEras=${selectedEra}`;
		}
	}

	// function downloadCSV() {
	// 	if (resultList.results.length == 0) {
	// 		alert("Please choose and Era and Faction and click the search button");
	// 		return;
	// 	}
	// 	const headers = Object.keys(resultList.results[0]);
	// 	const body = resultList.results.map((item) => {
	// 		let values = Object.values(item);
	// 		values[0] = '"' + values[0] + '"';
	// 		values[values.length - 1] = '"' + values[values.length - 1] + '"';
	// 		return values.toString();
	// 	});
	// 	const csv = [headers, ...body].join("\n");

	// 	const blob = new Blob([csv], { type: "application/csv" });
	// 	const downloadUrl = URL.createObjectURL(blob);
	// 	const downloadElement = document.createElement("a");
	// 	let name = eras.get(resultList.details.era) + " era " + factions.get(resultList.details.faction) + ".csv";
	// 	downloadElement.download = name;
	// 	downloadElement.href = downloadUrl;

	// 	downloadElement.click();
	// }
</script>

<main>
	<div class="card">
		<form class="parameters">
			<label for="eraParameter">Era:</label>
			<select bind:value={selectedEra} id="eraParameter">
				{#each eraLists as era}
					<option value={era.id}>{eras.get(era.id)}</option>
				{/each}
			</select>
			<label for="factionParameter">Faction:</label>
			{#if selectedEra == -1}
				<select id="factionParameter" disabled> </select>
			{:else}
				<select id="factionParameter" bind:value={selectedFaction}>
					{#each allowedFactions as faction}
						<option value={faction}>{factions.get(faction)}</option>
					{/each}
				</select>
			{/if}
			<div class="parameter">
				<p>General:</p>
				<a href={`http://masterunitlist.info/Era/FactionEraDetails?FactionId=${selectedFaction}&EraId=${selectedEra}`}>{factions.get(general)}</a>
			</div>
			<button id="getData" bind:this={searchButton} onclick={createLink}>Search</button>
		</form>
		<a href={link} target="_blank">{link}</a>
	</div>
</main>

<style>
	.parameter {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.parameters {
		display: flex;
		align-items: center;
		gap: 16px;
		width: 100%;
	}
	select {
		width: min(100%, 240px);
	}
	select:not([disabled]) {
		border-color: var(--ring);
	}
	a {
		width: 240px;
	}
</style>
