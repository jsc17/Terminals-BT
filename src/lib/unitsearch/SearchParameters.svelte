<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { List } from "$lib/types/list.svelte";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { eraLookup, factionLookup } from "$lib/data/erasFactionLookup";
	import EraFactionSelectionModal from "./EraFactionSelectionModal.svelte";

	type Props = {
		list?: List;
		resultList: ResultList;
	};

	let { list = $bindable(), resultList = $bindable() }: Props = $props();

	let showParameters = $state(false);
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
			<div>Era/Faction Selection</div>
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
			<p>Unit must be available in <span class="primary">{resultList.eraSearchType == "any" ? "ANY" : "EVERY"}</span> below Era:</p>
			<p>Unit must be available in <span class="primary">{resultList.factionSearchType == "any" ? "ANY" : "EVERY"}</span> below Faction:</p>
			<EraFactionSelectionModal {resultList} {list} />
			<div class="selected-container">
				{#each resultList.eras.length ? resultList.eras : [0] as era}
					<div class="selected-block">
						{eraLookup.get(Number(era))}
					</div>
				{/each}
			</div>
			<div class="selected-container">
				{#each resultList.factions.length ? resultList.factions : [0] as faction}
					<div class="selected-block">
						{factionLookup.get(Number(faction))}
					</div>
				{/each}
				{#if resultList.general != -1}
					<div class="selected-block">
						{factionLookup.get(resultList.general)}
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.parameter-container {
		width: 100%;
	}

	.parameters {
		display: grid;
		grid-template-columns: 1fr 1fr max-content;
		width: 100%;
		column-gap: 10%;
	}
	.parameters-mobile {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	p {
		margin: 0;
	}
	.accordian {
		height: 35px;
		width: 100%;
		background-color: var(--surface-color);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--text-color);
		padding: 8px;
	}
	.selected-container {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		padding: 4px 0px;
	}
	.selected-block {
		background-color: var(--input);
		color: var(--surface-color-light-text-color);
		border-radius: 1px;
		padding: 4px 8px;
		font-size: 0.85em;
		height: max-content;
	}
</style>
