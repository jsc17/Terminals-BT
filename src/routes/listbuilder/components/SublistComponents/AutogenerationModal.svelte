<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { type Unit } from "$lib/types/unit";
	import { Sublist } from "$lib/types/Sublist.svelte";
	import type { UnitList } from "$lib/types/list.svelte";
	import { getContext } from "svelte";

	let list: UnitList = getContext("list");

	type AutoSublist = {
		id: number;
		units: number[];
		unitString: string;
		count: number;
		pv: number;
	};

	let { showAutoModal = $bindable(), sublistId = $bindable(), sublists = $bindable() }: { showAutoModal: boolean; sublistId: number; sublists: Sublist[] } = $props();

	let autosublists = $state<any[]>([]);
	let autoSublistId = 0;
	let showMinUnitInfoDropdown = $state<boolean>(false);
	let showFilters = $state<boolean>(false);
	let autoGenerationDialog: HTMLDialogElement;

	let autoMinPV = $state(240),
		autoMaxPV = $state(250),
		autoMinUnitCost = $state(10);

	$effect(() => {
		if (showAutoModal) {
			autoGenerationDialog.showModal();
		} else {
			autoGenerationDialog.close();
		}
	});

	function generatesublists() {
		autosublists = [];
		let existingCombinations = new Set();
		const possibleUnits = $state
			.snapshot(list.units)
			.filter((unit: Unit) => {
				return unit.cost >= autoMinUnitCost;
			})
			.map((unit) => {
				return { id: unit.id, name: unit.name, cost: unit.cost, skill: unit.skill };
			});
		const combinations: any[] = [[]];
		for (const el of possibleUnits) {
			const last = combinations.length - 1;
			for (let i = 0; i <= last; i++) {
				combinations.push([...combinations[i], el]);
			}
		}

		for (const subset of combinations) {
			if (subset.length && subset.length <= 10) {
				let unitArray = [];
				let unitNameArray = [];
				let pv = 0;
				for (const unit of subset) {
					unitNameArray.push(`${unit.name} (${unit.skill})`);
					unitArray.push(unit.id);
					pv += unit.cost;
				}
				let subsetString = unitNameArray.join(", ");
				if (!existingCombinations.has(subsetString)) {
					existingCombinations.add(subsetString);

					if (pv <= autoMaxPV && pv >= autoMinPV) {
						let newList = $state<AutoSublist>({
							id: autoSublistId,
							units: unitArray,
							unitString: subsetString,
							count: subset.length,
							pv
						});
						autoSublistId++;

						autosublists.push(newList);
					}
				}
			}
		}
	}
	function addAutoSublist(id: number) {
		let newList = new Sublist(sublistId, list);
		sublistId++;
		let sublist = $state.snapshot(
			autosublists.find((e) => {
				return e.id == id;
			})
		);
		newList.checked = structuredClone(sublist.units);
		sublists.push(newList);
	}
</script>

<dialog
	bind:this={autoGenerationDialog}
	class="auto-modal"
	class:dialog-wide={appWindow.isNarrow}
	onclose={() => {
		showAutoModal = false;
	}}
>
	<div class="dialog-body">
		<div class="space-between">
			{#if !appWindow.isNarrow}
				<h1>Auto-generated sublists</h1>
			{/if}
			<p>Total Lists - {autosublists.length}</p>
			<button
				onclick={() => {
					autoGenerationDialog.close();
				}}>Close</button
			>
		</div>
		<div class:auto-main={!appWindow.isMobile} class:auto-main-mobile={appWindow.isMobile}>
			<button
				class="accordian"
				class:hidden={!appWindow.isMobile}
				onclick={() => {
					showFilters = !showFilters;
				}}
			>
				<div class="space-between">
					<div></div>
					<div>Filters</div>
					<div>
						{#if showFilters}
							-
						{:else}
							+
						{/if}
					</div>
				</div>
			</button>
			<div class:hidden={appWindow.isNarrow && !showFilters}>
				<div class="options">
					<label for="autoMinPv">Min PV:</label>
					<input id="autoMinPv" type="number" bind:value={autoMinPV} />
					<label for="autoMaxPv">Max PV:</label>
					<input id="autoMaxPv" type="number" bind:value={autoMaxPV} />
					<label for="autoMinUnitCost">Min unit PV:</label>
					<input id="autoMinUnitCost" type="number" bind:value={autoMinUnitCost} />
					<button onclick={generatesublists}>Generate sublists</button>
					<p>Additional filters coming soon...</p>
				</div>
			</div>
			<div class="auto-list-container">
				<div>Units</div>
				<div class="center">Unit Count</div>
				<div class="center">PV</div>
				<div></div>
				{#each autosublists as sublist}
					<div>{sublist.unitString}</div>
					<div class="center">{sublist.count}</div>
					<div class="center">{sublist.pv}</div>
					<div class="center"><button style:padding="8px 16px" onclick={() => addAutoSublist(sublist.id)}>+</button></div>
				{/each}
			</div>
		</div>
	</div>
</dialog>

<style>
	.auto-modal {
		width: 80%;
		height: 80%;
	}
	.auto-main {
		display: grid;
		grid-template-columns: 1fr 4fr;
		width: 100%;
		height: 100%;
	}
	.auto-main-mobile {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
	.options {
		padding: 8px;
		height: 100%;
		width: 100%;
		background-color: var(--card);
		color: var(--card-foreground);
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.auto-list-container {
		div {
			padding: 8px 16px;
			border-bottom: 1px solid var(--border);
		}
		padding: 8px;
		display: grid;
		width: 100%;
		height: fit-content;
		max-height: 100%;
		overflow: auto;
		grid-template-columns: auto max-content max-content 25px;
	}
	.accordian {
		width: 100%;
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--card-foreground);
		padding: 8px;
	}
	.center {
		display: flex;
		justify-content: center;
	}
</style>
