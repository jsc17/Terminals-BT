<script lang="ts">
	import eraLists from "$lib/data/erasFactionsList.json";
	import { eraLookup, factionLookup } from "$lib/data/erasFactionLookup.js";
	import { appWindow } from "$lib/global/stores/appWindow.svelte";
	import { ResultList, List } from "$lib/types/";
	import { getContext, onMount } from "svelte";
	import { Combobox } from "$lib/global/components/";
	import type { Item } from "$lib/global/types/types";
	import { EraFactionInfoPopover } from "$lib/UnitSearch";

	type Props = {
		list?: List;
		resultList: ResultList;
	};

	let { list = $bindable(), resultList = $bindable() }: Props = $props();

	let showParameters = $state(false);

	let allowedEras: Item[] = eraLists
		.filter((era) => {
			return era.id != 0;
		})
		.map((era) => {
			return {
				value: era.id.toString(),
				label: eraLookup.get(era.id) ?? "Not Found"
			};
		});

	let allowedFactions = $derived.by(() => {
		let allowed: number[] = [];
		if (!resultList.selectedEras.length) {
			allowed = eraLists[0].lists[0].factions;
		} else {
			eraLists
				.filter((era) => {
					return resultList.selectedEras.includes(era.id.toString());
				})
				.forEach((era) => {
					era.lists.forEach((eraList) => {
						allowed = allowed.concat(eraList.factions);
					});
				});
		}
		allowed = [...new Set(allowed)];
		allowed.sort((a, b) => {
			return (factionLookup.get(a)?.toString() ?? "Not found") < (factionLookup.get(b)?.toString() ?? "Not Found") ? -1 : 1;
		});
		return allowed.map((faction) => {
			return {
				value: faction.toString(),
				label: factionLookup.get(faction)?.toString() ?? "Not found"
			};
		});
	});

	onMount(() => {
		if (!list || localStorage.getItem("last-list") === null) {
			resultList.loadResults();
		}
	});
</script>

<div class="parameter-container">
	<button
		class="accordian"
		class:hidden={!appWindow.isNarrow}
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
	<div class="card" class:hidden={appWindow.isNarrow && !showParameters}>
		<div class={appWindow.isMobile ? "parameters-mobile" : "parameters"}>
			<div class="parameter">
				<p>Era:</p>
				<Combobox items={allowedEras} bind:value={resultList.selectedEras} inputProps={{ clearOnDeselect: true, placeholder: "Any" }} type="multiple"></Combobox>
			</div>
			<div class="selected-container">
				{#if resultList.selectedEras.length == 0}
					<div class="selected-block">Any - choose an era to narrow down options</div>
				{/if}
				{#if resultList.selectedEras.length >= 2}
					<select bind:value={resultList.eraSearchType}>
						<option value="any">Any</option>
						<option value="every">Every</option>
					</select>
					<EraFactionInfoPopover></EraFactionInfoPopover>:
				{/if}
				{#each resultList.selectedEras.slice(0, 4) as selected}
					<button
						class="selected-block"
						onclick={() => {
							resultList.selectedEras = resultList.selectedEras.filter((text) => {
								return text != selected;
							});
						}}
						><img src="/icons/close.svg" alt="close" />
						{eraLookup.get(Number(selected)) ?? `${selected} not found`}</button
					>
				{/each}
				{#if resultList.selectedEras.length > 4}
					<div class="selected-block">
						+{resultList.selectedEras.length - 4} more selections
					</div>
				{/if}
			</div>
			<div class="parameter">
				<p>Faction:</p>
				<Combobox items={allowedFactions} bind:value={resultList.selectedFactions} inputProps={{ clearOnDeselect: true, placeholder: "Any" }} type="multiple"></Combobox>
			</div>
			<div class="selected-container">
				{#if resultList.selectedFactions.length == 0}
					<div class="selected-block">Any - choose a faction to narrow down options</div>
				{/if}
				{#if resultList.selectedFactions.length >= 2}
					<select bind:value={resultList.factionSearchType}>
						<option value="any">Any</option>
						<option value="every">Every</option>
					</select>
					<EraFactionInfoPopover></EraFactionInfoPopover>:
				{/if}
				{#each resultList.selectedFactions.slice(0, 4) as selected}
					<button
						class="selected-block"
						onclick={() => {
							resultList.selectedFactions = resultList.selectedFactions.filter((text) => {
								return text != selected;
							});
						}}
						><img src="/icons/close.svg" alt="close" />
						{allowedFactions.find((faction) => {
							return faction.value == selected;
						})?.label}</button
					>
				{/each}
				{#if resultList.selectedFactions.length > 4}
					<div class="selected-block">
						+{resultList.selectedFactions.length - 4} more selections
					</div>
				{/if}
			</div>
			<div class="inline">
				<input
					type="checkbox"
					name="include-general-list"
					id="include-general-list"
					bind:checked={resultList.includeGeneral}
					disabled={resultList.selectedEras.length != 1 || resultList.selectedFactions.length != 1}
				/>
				<label for="include-general-list">Official General:</label>
				{#if resultList.selectedEras.length == 1 && resultList.selectedFactions.length == 1}
					<a href={`http://masterunitlist.info/Era/FactionEraDetails?FactionId=${resultList.factions[0]}&EraId=${resultList.eras[0]}`}>{factionLookup.get(resultList.general)}</a>
				{:else}
					<p class="general-notice">Select a single Era and Faction</p>
				{/if}
			</div>
			<div class="general-notice">You can select additional general lists from the faction dropdown</div>
			<button
				id="getData"
				onclick={() => {
					resultList.loadResults();
					if (list) {
						list.details.eras = resultList.eras;
						list.details.factions = resultList.factions;
						list.details.general = resultList.general;
					}
				}}>Search</button
			>
		</div>

		{#if resultList.selectedEras.length != resultList.eras.length || !resultList.eras.every( (era) => resultList.selectedEras.includes(era.toString()) ) || resultList.selectedFactions.length != resultList.factions.length || !resultList.factions.every( (faction) => resultList.selectedFactions.includes(faction.toString()) )}
			<div class="center">
				<img class="warning-icon" src="/icons/alert-outline.svg" alt="close" />
				<p class="general-notice">Faction or Era selection changed. Press search to get updated results</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.parameter-container {
		width: 100%;
	}
	.parameter {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.parameters {
		position: relative;
		display: grid;
		grid-auto-flow: column;
		grid-template-columns: 1fr 1fr 1fr max-content;
		grid-template-rows: min-content min-content;
		column-gap: 16px;
		row-gap: 2px;
		width: 100%;
		align-items: start;
	}
	.parameters-mobile {
		display: flex;
		flex-direction: column;
		gap: 8px;
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
	.selected-container {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
	}
	.selected-block {
		background-color: var(--muted);
		color: var(--muted-foreground);
		border-radius: 0;
		display: flex;
		gap: 4px;
		align-items: center;
		width: fit-content;
		padding: 2px;
		margin: 2px;
		font-size: 0.75em;
		height: 1.25em;

		img {
			height: 1em;
			width: 1em;
		}
	}
	.general-notice {
		font-size: 0.75em;
		color: var(--muted-foreground);
	}

	.warning-icon {
		height: 1em;
		width: 1em;
		filter: var(--warning-filter);
	}
</style>
