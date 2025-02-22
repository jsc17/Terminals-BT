<script lang="ts">
	import eraLists from "$lib/data/erasFactionsList.json";
	import { eras, factions } from "$lib/data/erasFactionLookup.js";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { getContext } from "svelte";
	import type { List } from "../../routes/listbuilder/types/list.svelte";
	import Combobox, { type ComboboxItem } from "./Generic/Combobox.svelte";

	const resultList: ResultList = getContext("resultList");
	const list: List = getContext("list");

	let showParameters = $state(false);

	let allowedEras: ComboboxItem[] = eraLists
		.filter((era) => {
			return era.id != 0;
		})
		.map((era) => {
			return { value: era.id.toString(), label: eras.get(era.id) ?? "Not Found" };
		});

	let allowedFactions = $derived.by(() => {
		let allowed: number[] = [];
		if (!resultList.eras.length) {
			allowed = eraLists[0].lists[0].factions;
		} else {
			eraLists
				.filter((era) => {
					return resultList.eras.includes(era.id.toString());
				})
				.forEach((era) => {
					era.lists.forEach((list) => {
						allowed = allowed.concat(list.factions);
					});
				});
		}
		allowed = [...new Set(allowed)];
		allowed.sort((a, b) => {
			return (factions.get(a)?.toString() ?? "Not found") < (factions.get(b)?.toString() ?? "Not Found") ? -1 : 1;
		});
		return allowed.map((faction) => {
			return { value: faction.toString(), label: factions.get(faction)?.toString() ?? "Not found" };
		});
	});
</script>

<div class="parameter-container">
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
		<div class={appWindow.isMobile ? "parameters-mobile" : "parameters"}>
			<div class="parameter">
				<p>Era:</p>
				<Combobox items={allowedEras} bind:value={resultList.eras} inputProps={{ clearOnDeselect: true, placeholder: "Any" }} type="multiple"></Combobox>
			</div>
			<div class="selected-container">
				{#each resultList.eras.slice(0, 4) as selected}
					<button
						class="selected-block"
						onclick={() => {
							resultList.eras = resultList.eras.filter((text) => {
								return text != selected;
							});
						}}
						><img src="/icons/close.svg" alt="close" />
						{eras.get(Number(selected)) ?? `${selected} not found`}</button
					>
				{/each}
				{#if resultList.eras.length > 4}
					<div class="selected-block">
						+{resultList.eras.length - 4} more selections
					</div>
				{/if}
			</div>
			<div class="parameter">
				<p>Faction:</p>
				<Combobox items={allowedFactions} bind:value={resultList.factions} inputProps={{ clearOnDeselect: true, placeholder: "Any" }} type="multiple"></Combobox>
			</div>
			<div class="selected-container">
				{#each resultList.factions.slice(0, 4) as selected}
					<button
						class="selected-block"
						onclick={() => {
							resultList.factions = resultList.factions.filter((text) => {
								return text != selected;
							});
						}}
						><img src="/icons/close.svg" alt="close" />
						{allowedFactions.find((era) => {
							return era.value == selected;
						})?.label}</button
					>
				{/each}
				{#if resultList.factions.length > 4}
					<div class="selected-block">
						+{resultList.factions.length - 4} more selections
					</div>
				{/if}
			</div>
			<div class="inline">
				<input
					type="checkbox"
					name="include-general-list"
					id="include-general-list"
					bind:checked={resultList.includeGeneral}
					disabled={resultList.eras.length != 1 || resultList.factions.length != 1}
				/>
				<label for="include-general-list">Include Official General:</label>
				<a href={`http://masterunitlist.info/Era/FactionEraDetails?FactionId=${resultList.factions[0]}&EraId=${resultList.eras[0]}`}>{factions.get(resultList.general)}</a>
			</div>
			<div class="general-notice">You can selected additional general lists from the faction dropdown</div>
			<button
				id="getData"
				onclick={() => {
					resultList.loadNewResults();
					if (list) {
						// list.details.era = resultList.eras;
						// list.details.faction = resultList.factions;
						// list.details.general = resultList.general;
					}
				}}>Search</button
			>
		</div>
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
		grid-template-columns: 3fr 3fr 2fr max-content;
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
</style>
