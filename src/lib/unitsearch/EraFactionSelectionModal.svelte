<script lang="ts">
	import { Dialog, Select, Switch } from "$lib/generic";
	import { getErasAndFactions } from "$lib/remote/era-faction.remote";
	import type { ResultList } from "$lib/types/resultList.svelte";
	import { X } from "phosphor-svelte";
	import { eraLookup, factionLookup } from "$lib/data/erasFactionLookup.js";
	import { getGeneralList } from "$lib/utilities/genericBattletechUtilities";
	import { SvelteSet } from "svelte/reactivity";
	import type { List } from "$lib/types/list.svelte";

	type Props = {
		list?: List;
		resultList: ResultList;
	};

	let { resultList, list }: Props = $props();

	let eraList = $derived(getErasAndFactions());

	let selectedEra = $state<string>();
	let selectedEras = new SvelteSet<number>();
	let selectedFaction = $state<string>();
	let selectedFactions = new SvelteSet<number>();
	let eraSelectMode = $state<"any" | "every">("any");
	let factionSelectMode = $state<"any" | "every">("any");

	let availableFactions = $derived.by(() => {
		let factions = new Set<number>();
		if (!eraList.current) return factions;

		if (selectedEras.size == 0) {
			for (const era of eraList.current) {
				for (const faction of era[1]) {
					factions.add(faction.id);
				}
			}
		} else {
			for (const era of selectedEras) {
				eraList.current.get(era)?.forEach((f) => {
					factions.add(f.id);
				});
			}
		}
		return factions;
	});

	let includeGeneral = $state(true);
	let general = $derived.by(() => {
		if (selectedEras.size == 1 && selectedFactions.size == 1) {
			return getGeneralList([...selectedEras][0], [...selectedFactions][0]);
		} else {
			return -1;
		}
	});

	let changed = $state(false);

	function handleApply() {
		resultList.eraSearchType = eraSelectMode;
		resultList.factionSearchType = factionSelectMode;
		if (list) {
			list.details.eras = [...selectedEras];
			list.details.factions = [...selectedFactions];
			list.details.general = includeGeneral ? general : -1;
		} else {
			resultList.loadResults([...selectedEras], [...selectedFactions], includeGeneral ? general : -1);
		}
		changed = false;
		open = false;
	}

	let open = $state(false);
	function onOpenChange(open: boolean) {
		if (open) {
			selectedEras.clear();
			for (const era of resultList.eras) {
				selectedEras.add(era);
			}
			selectedFactions.clear();
			for (const faction of resultList.factions) {
				selectedFactions.add(faction);
			}
		}
		changed = false;
	}

	function cancelClose() {
		if (!changed) return false;
		return !confirm("Unsaved Changes, are you sure you want to cancel?");
	}
</script>

<Dialog title="Select Era/Faction" {onOpenChange} bind:open {cancelClose}>
	{#snippet trigger()}
		Edit Era/Faction Selection
	{/snippet}
	<div class="selection-body">
		<div class="selection-row inline">
			{#if eraList.current}
				<label for="eraSelect">Era: </label>
				<div class="select-container">
					<Select
						name="eraSelect"
						bind:value={selectedEra}
						items={[...eraList.current.keys()].map((v) => ({ value: v.toString(), label: eraLookup.get(v) ?? "" }))}
						type="single"
						placeholder="Select era"
					/>
				</div>
				<button
					onclick={() => {
						if (selectedEra) {
							selectedEras.add(Number(selectedEra));
							changed = true;
						}
					}}>Add</button
				>

				<Switch
					checked={eraSelectMode == "every"}
					height={20}
					onCheckedChange={() => {
						if (eraSelectMode == "any") {
							eraSelectMode = "every";
						} else {
							eraSelectMode = "any";
						}
					}}
				>
					{#snippet leftValue()}
						<p>Any</p>
					{/snippet}
					{#snippet rightValue()}
						<p>Every</p>
					{/snippet}
				</Switch>
			{/if}
		</div>
		<div class="selection-box">
			{#each selectedEras as era}
				<div class="selection-box-row">
					<button
						class="transparent-button"
						onclick={() => {
							selectedEras.delete(era);
							changed = true;
						}}
					>
						<X size="15" />
					</button>
					<p>{eraLookup.get(era)}</p>
				</div>
			{:else}
				<div class="selection-box-row">
					<p style="margin-left: 16px">Any - Select an era above to restrict results</p>
				</div>
			{/each}
		</div>
		<div class="selection-row inline">
			<label for="factionSelect">Faction:</label>
			<div class="select-container">
				<Select
					name="factionSelect"
					bind:value={selectedFaction}
					items={[...availableFactions].map((f) => ({ value: f.toString(), label: factionLookup.get(f) ?? "" })).sort((a, b) => a.label.localeCompare(b.label))}
					type="single"
					placeholder="Select faction"
				/>
			</div>
			<button
				onclick={() => {
					if (selectedFaction) {
						selectedFactions.add(Number(selectedFaction));
						changed = true;
					}
				}}>Add</button
			>
			<Switch
				checked={factionSelectMode == "every"}
				height={20}
				onCheckedChange={() => {
					if (factionSelectMode == "any") {
						factionSelectMode = "every";
					} else {
						factionSelectMode = "any";
					}
				}}
			>
				{#snippet leftValue()}
					<p>Any</p>
				{/snippet}
				{#snippet rightValue()}
					<p>Every</p>
				{/snippet}
			</Switch>
		</div>
		<div class="selection-box">
			{#each selectedFactions as faction}
				<div class="selection-box-row">
					<button
						class="transparent-button"
						onclick={() => {
							selectedFactions.delete(faction);
							changed = true;
						}}
					>
						<X size="15" />
					</button>
					<p>{factionLookup.get(faction)}</p>
				</div>
			{:else}
				<div class="selection-box-row">
					<p style="margin-left: 16px">Any - Select a faction above to restrict results</p>
				</div>
			{/each}
		</div>

		<div class="inline">
			<input type="checkbox" id="include-general-list" bind:checked={includeGeneral} disabled={selectedEras.size != 1 || selectedFactions.size != 1} />
			<label for="include-general-list">Official General:</label>
			{#if selectedEras.size == 1 && selectedFactions.size == 1}
				<a href={`http://masterunitlist.info/Era/FactionEraDetails?FactionId=${[...selectedFactions][0]}&EraId=${[...selectedEras][0]}`}>{factionLookup.get(general)}</a>
			{:else}
				<p class="general-notice">Select a single Era and Faction</p>
			{/if}
		</div>
		<hr />
		<div class="selection-buttons">
			<button
				class="selection-button"
				onclick={() => {
					if (!cancelClose()) open = false;
				}}>Cancel</button
			>
			<button
				class="selection-button"
				onclick={() => {
					handleApply();
				}}>Apply</button
			>
		</div>
	</div>
</Dialog>

<style>
	.selection-body {
		display: grid;
		gap: 6px;
	}
	.selection-row {
		display: flex;
		gap: 8px;
	}
	.select-container {
		width: 200px;
	}
	.selection-box {
		display: grid;
		grid-auto-rows: min-content;
		border: 1px solid var(--border);
		background-color: var(--surface-color);
		height: 8em;
		overflow: auto;
	}
	.selection-box-row {
		padding: 4px 8px;
		display: flex;
		gap: 4px;
		height: min-content;
		border-bottom: 1px solid var(--border);
	}
	.selection-box-row:nth-child(even) {
		background-color: var(--table-secondary);
	}
	.selection-buttons {
		margin-top: 16px;
		display: flex;
		gap: 16px;
		justify-content: center;
	}
	.selection-button {
		padding: var(--responsive-padding);
		border-radius: 5px;
	}
</style>
