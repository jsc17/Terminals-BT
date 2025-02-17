<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { getContext } from "svelte";
	import type { List } from "../../types/list.svelte";
	import type { UnitV2 } from "$lib/types/unit";
	import type { SublistV2 } from "../../types/sublist";

	type AutoSublist = {
		id: string;
		sublist: SublistV2;
		unitString: string;
		count: number;
		pv: number;
	};

	let list: List = getContext("list");

	let autosublists = $state<AutoSublist[]>([]);
	let showFilters = $state<boolean>(false);
	let autoGenerationDialog: HTMLDialogElement;

	let autoMinPV = $state<number>(),
		autoMaxPV = $state<number>(),
		autoMinUnitCost = $state<number>(10);

	export function show() {
		autoGenerationDialog.showModal();
		autoMaxPV = list.options?.sublistMaxPv ?? list.pv;
		autoMinPV = autoMaxPV - 15;
	}

	function generatesublists() {
		autosublists = [];
		let existingCombinations = new Set();
		const possibleUnits = $state
			.snapshot(list.units)
			.filter((unit: UnitV2) => {
				return unit.cost >= autoMinUnitCost;
			})
			.map((unit) => {
				return { id: unit.id, name: unit.baseUnit.name, cost: unit.cost, skill: unit.skill };
			});
		const combinations: any[] = [[]];
		for (const unit of possibleUnits) {
			const last = combinations.length - 1;
			for (let i = 0; i <= last; i++) {
				combinations.push([...combinations[i], unit]);
			}
		}

		for (const subset of combinations) {
			if (subset.length && subset.length <= 10) {
				let checked: string[] = [];
				let unitNameArray = [];
				let pv = 0;
				for (const unit of subset) {
					unitNameArray.push(`${unit.name} (${unit.skill})`);
					checked.push(unit.id);
					pv += unit.cost;
				}
				let subsetString = unitNameArray.join(", ");
				if (!existingCombinations.has(subsetString)) {
					existingCombinations.add(subsetString);

					if (pv <= autoMaxPV! && pv >= autoMinPV!) {
						let newId = crypto.randomUUID();
						let newList = $state<AutoSublist>({
							id: newId,
							unitString: subsetString,
							sublist: { id: newId, scenario: "-", checked },
							count: subset.length,
							pv
						});

						autosublists.push(newList);
					}
				}
			}
		}
	}
</script>

<dialog bind:this={autoGenerationDialog} class="auto-modal" class:dialog-wide={appWindow.isNarrow}>
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
					<div class="center"><button style:padding="8px 16px" onclick={() => list.addSublist($state.snapshot(sublist.sublist))}>+</button></div>
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
