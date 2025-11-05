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
</script>

<div class="parameter-container">
	<div class="card">
		<div class={appWindow.isMobile ? "parameters-mobile" : "parameters"}>
			<p>Unit must be available in <span class="primary">{resultList.eraSearchType == "any" ? "ANY" : "EVERY"}</span> below Era:</p>
			<div class="selected-container">
				{#each resultList.eras.length ? resultList.eras : [0] as era}
					<div class="selected-block">
						{eraLookup.get(Number(era))}
					</div>
				{/each}
			</div>
			<p>Unit must be available in <span class="primary">{resultList.factionSearchType == "any" ? "ANY" : "EVERY"}</span> below Faction:</p>
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
			<div>
				<EraFactionSelectionModal {resultList} {list} />
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
		grid-template-rows: max-content 1fr;
		grid-auto-flow: column;
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
