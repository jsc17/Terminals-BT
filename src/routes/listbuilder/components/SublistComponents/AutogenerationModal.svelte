<script lang="ts">
	import type { ListUnit, List, Sublist } from "$lib/types/list.svelte";
	import { Dialog, Collapsible, Separator, RadioGroup, Popover } from "$lib/generic";
	import { nanoid } from "nanoid";
	import { appWindow } from "$lib/stores";
	import AutoGenerationStatsDialog from "./AutoGenerationStatsDialog.svelte";
	import { getBSCbyId } from "$lib/data/battlefieldSupport";
	import { watch } from "runed";

	type AutoSublist = {
		id: string;
		sublist: Sublist;
		unitString: string;
		bsString: string;
		unitCount: number;
		bsCount: number;
		pv: number;
		bsp: number;
	};

	type Props = {
		open: boolean;
		list: List;
	};

	let { open = $bindable(), list }: Props = $props();

	let autosublists = $state<AutoSublist[]>([]);
	let showFilters = $state<boolean>(true);
	let showUnitFilters = $state<boolean>(!appWindow.isMobile);

	let options = $state({
		autoMaxPV: 0,
		autoMinPV: 0,
		autoMaxUnits: 0,
		autoMinUnits: 1,
		autoMinUnitCost: 0,
		autoMinBSP: 0,
		autoMaxBSP: 0
	});

	let filteredUnits = $state<{ id: string; name: string; included: string; pvcost: number }[]>([]);
	let excludedUnits = $derived(filteredUnits.filter(({ included }) => included == "excluded").map(({ id }) => id));
	let requiredUnits = $derived(filteredUnits.filter(({ included }) => included == "required").map(({ id }) => id));
	let filteredBS = $state<{ id: number; name: string; pvcost?: number; bspcost?: number; listTotal: number; min: number; max: number }[]>([]);
	let requiredBS = $derived(filteredBS.filter(({ min }) => min > 0));

	function generatesublists() {
		autosublists = [];
		let existingCombinations = new Set();
		const possibleUnits = $state
			.snapshot(list.units)
			.filter((unit: ListUnit) => {
				return unit.cost >= options.autoMinUnitCost && !excludedUnits.includes(unit.id);
			})
			.map((unit) => {
				return { id: unit.id, name: unit.baseUnit.name, type: "unit", skill: unit.skill, cost: unit.cost };
			})
			.concat(
				filteredBS.flatMap((bs) => {
					return Array.from({ length: bs.max }, (_, i) => {
						return { id: bs.id.toString(), name: bs.name, type: "bs", skill: 0, cost: bs.pvcost ?? 0 };
					});
				})
			);
		const combinations: { id: string; name: string; type: string; skill: number | undefined; cost: number }[][] = [[]];
		for (const unit of possibleUnits) {
			const last = combinations.length - 1;
			for (let i = 0; i <= last; i++) {
				combinations.push([...combinations[i], unit]);
			}
		}

		for (const subset of combinations) {
			if (
				subset.length &&
				(!options.autoMinUnits || subset.filter((u: any) => u.type == "unit").length >= options.autoMinUnits) &&
				(!options.autoMaxUnits || subset.filter((u: any) => u.type == "unit").length <= options.autoMaxUnits)
			) {
				let checked: string[] = [];
				let unitNameArray = [];
				let bsNameArray = [];
				let pv = 0;
				let bsp = 0;
				for (const unit of subset) {
					if (unit.type == "unit") {
						unitNameArray.push(`${unit.name} (${unit.skill})`);
					} else {
						bsNameArray.push(unit.name);
						const bs = filteredBS.find((bs) => bs.id.toString() == unit.id);
						bsp += bs?.bspcost ?? 0;
					}
					checked.push(unit.id);
					pv += unit.cost;
				}
				if (
					(!options.autoMinBSP || bsp >= options.autoMinBSP) &&
					(!options.autoMaxBSP || bsp <= options.autoMaxBSP) &&
					(!options.autoMaxPV || pv <= options.autoMaxPV) &&
					(!options.autoMinPV || pv >= options.autoMinPV) &&
					(!requiredUnits.length || requiredUnits.every((v) => checked.includes(v))) &&
					(!requiredBS.length || requiredBS.every((v) => checked.filter((c) => c == v.id.toString()).length >= v.min))
				) {
					let subsetString = unitNameArray.join(", ") + (unitNameArray.length && bsNameArray.length ? ", " : "") + bsNameArray.join(", ");
					if (!existingCombinations.has(subsetString)) {
						existingCombinations.add(subsetString);

						let newId = crypto.randomUUID();

						let countedBS = new Map<number, number>();
						for (const bsOption of bsNameArray) {
							const bsData = filteredBS.find((bs) => bs.name == bsOption);
							countedBS.set(bsData?.id ?? -1, (countedBS.get(bsData?.id ?? -1) ?? 0) + 1);
						}
						let newList = $state<AutoSublist>({
							id: newId,
							unitString: unitNameArray.length ? unitNameArray.join(", ") : "No Units selected",
							bsString: bsNameArray.join(", "),
							sublist: { id: newId, scenario: "-", checked, checkedBS: countedBS },
							unitCount: subset.filter((unit: any) => unit.type == "unit").length,
							bsCount: subset.filter((unit: any) => unit.type == "bs").length,
							pv,
							bsp
						});

						autosublists.push(newList);
					}
				}
			}
		}
		showFilters = false;
	}

	watch(
		() => open,
		() => {
			if (open) {
				options.autoMaxPV = list.options?.sublistMaxPv ?? 0;
				options.autoMinPV = list.options?.sublistMaxPv ? list.options.sublistMaxPv - 25 : 0;
				options.autoMaxUnits = list.options?.sublistMaxUnits ?? 0;
				filteredUnits = list.units
					.toSorted((a, b) => a.baseUnit.subtype.localeCompare(b.baseUnit.subtype))
					.map((unit) => {
						return { id: unit.id, name: unit.baseUnit.name, included: "allowed", skill: unit.skill, pvcost: unit.cost };
					});
				filteredBS = [...list.bsList.entries()].map(([id, count]) => {
					const bsData = getBSCbyId(id);
					return { id, name: bsData?.name ?? "Not Found", bspcost: bsData?.bspCost, pvcost: bsData?.pvCost, listTotal: count, min: 0, max: count };
				});
			}
		}
	);
</script>

{#snippet autoSublistOptions()}
	<p class="muted">Set filter to 0 to ignore that value</p>
	<div class="auto-sublist-options">
		<label for="autoMinPv">Min PV:</label>
		<input id="autoMinPv" type="number" bind:value={options.autoMinPV} />
		<label for="autoMaxPv">Max PV:</label>
		<input id="autoMaxPv" type="number" bind:value={options.autoMaxPV} />
		<label for="autoMinUnits">Min Units:</label>
		<input id="autoMinUnits" type="number" bind:value={options.autoMinUnits} />
		<label for="autoMaxUnits">Max Units:</label>
		<input id="autoMaxUnits" type="number" bind:value={options.autoMaxUnits} />
		<label for="autoMinUnitCost">Min unit PV:</label>
		<input id="autoMinUnitCost" type="number" bind:value={options.autoMinUnitCost} />
		<label for="autoMinBSP">Min BSP:</label>
		<input id="autoMinBSP" type="number" bind:value={options.autoMinBSP} />
		<label for="autoMaxBSP">Max BSP:</label>
		<input id="autoMaxBSP" type="number" bind:value={options.autoMaxBSP} />
	</div>
	<Separator classes="separator-card" />
	<button class="detailed-button auto-sublist-generate-button" onclick={generatesublists}>Generate sublists</button>
	<Separator classes="separator-card" />

	<div class="auto-sublist-unit-filter-container">
		<Collapsible bind:open={showUnitFilters}>
			{#snippet trigger()}
				<p class="primary">Unit Filters {showUnitFilters ? "-" : "+"}</p>
			{/snippet}

			<div class="auto-sublist-unit-filters">
				<div class="auto-sublist-unit-filter-row">
					<p class="muted">Unit Name</p>
					<Popover>
						{#snippet trigger()}
							<p style="color: var(--primary)">Legend</p>
						{/snippet}
						<div class="auto-sublist-legend-popover-body">
							<div class="auto-sublist-filter-legend legend-excluded"></div>
							<p>Unit won't be included in sublist</p>
							<div class="auto-sublist-filter-legend legend-allowed"></div>
							<p>Unit can be included in sublist</p>
							<div class="auto-sublist-filter-legend legend-required"></div>
							<p>Unit will be included in sublist</p>
						</div>
					</Popover>
				</div>
				{#each filteredUnits as unit}
					<div class="auto-sublist-unit-filter-row">
						<p>{unit.name}</p>
						<RadioGroup
							items={[{ value: "excluded", selectedColor: "error" }, { value: "allowed", selectedColor: "surface-color-light-text-color" }, { value: "required" }]}
							bind:value={unit.included}
							orientation={"horizontal"}
						/>
					</div>
				{/each}
			</div>
		</Collapsible>
	</div>
	<div class="auto-sublist-unit-filter-container">
		<Collapsible bind:open={showUnitFilters}>
			{#snippet trigger()}
				<p class="primary">Battlefield Support Filters {showUnitFilters ? "-" : "+"}</p>
			{/snippet}
			<div class="auto-sublist-bs-filter-row">
				<p class="muted">Battlefield Support</p>
			</div>
			<div class="auto-sublist-bs-filters">
				{#each filteredBS as bs}
					<div class="auto-sublist-bs-filter-row">
						<p>{bs.name}</p>

						<label for="min">Min:</label>
						<input id="min" type="number" min="0" max={bs.listTotal} bind:value={bs.min} />
						<label for="max">Max:</label>
						<input id="max" type="number" min="0" max={bs.listTotal} bind:value={bs.max} />
					</div>
				{/each}
			</div>
		</Collapsible>
	</div>
{/snippet}

<Dialog title="Generate Sublists" bind:open>
	<div class={{ "auto-sublist-modal-content": !appWindow.isMobile, "auto-sublist-modal-content-mobile": appWindow.isMobile }}>
		{#if !appWindow.isMobile}
			<div class="auto-sublist-options-container">
				{@render autoSublistOptions()}
			</div>
		{:else}
			<div>
				<Collapsible bind:open={showFilters}>
					{#snippet trigger()}
						<div class="sublist-filter-collapse-button"><p class="primary">Filters {showFilters ? "-" : "+"}</p></div>
					{/snippet}
					<div class="auto-sublist-options-container">
						{@render autoSublistOptions()}
					</div>
				</Collapsible>
			</div>
		{/if}
		{#if !appWindow.isMobile}
			<div class="auto-list-container">
				<div>Units</div>
				<div class="center">Count</div>
				<div class="center">Cost</div>
				<div></div>
				<div></div>
				{#each autosublists as sublist}
					<div class="auto-sublist-row">
						<div class="auto-detail-row">
							<p>{sublist.unitString}</p>
							<p class="center">{sublist.unitCount}</p>
							<p class="center">{sublist.pv} PV</p>
						</div>
						{#if sublist.bsString}
							<div class="auto-detail-row">
								<p>{sublist.bsString}</p>
								<p class="center">{sublist.bsCount}</p>
								<p class="center">{sublist.bsp} BSP</p>
							</div>
						{/if}
						<AutoGenerationStatsDialog {list} sublist={sublist.sublist} />
						<button
							class="detailed-button center"
							onclick={() => {
								sublist.sublist.id = nanoid(6);
								list.addSublist($state.snapshot(sublist.sublist));
							}}>+</button
						>
					</div>
				{/each}
			</div>
		{:else}
			<div class="auto-list-container-mobile">
				{#each autosublists as sublist}
					<div class="auto-sublist-row-mobile">
						<p class="auto-sublist-mobile-unit-string">{sublist.unitString}</p>
						<div class="auto-sublist-mobile-stat-line">
							<p><span class="muted">Unit Count:</span> {sublist.unitCount}</p>
							<p><span class="muted">PV:</span> {sublist.pv}</p>
							<AutoGenerationStatsDialog {list} sublist={sublist.sublist} />
							<button
								class="detailed-button center"
								onclick={() => {
									sublist.sublist.id = nanoid(6);
									list.addSublist($state.snapshot(sublist.sublist));
								}}>+</button
							>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</Dialog>

<style>
	.auto-sublist-modal-content {
		display: grid;
		grid-template-columns: 1fr 4fr;
		height: 85dvh;
		width: calc(99dvw - 36px);
	}
	.auto-sublist-modal-content-mobile {
		height: 85dvh;
		width: 100%;
		display: grid;
		grid-template-rows: max-content 1fr;
	}
	.sublist-filter-collapse-button {
		height: 30px;
		width: 100%;
		margin-bottom: 4px;
		background-color: var(--surface-color);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.auto-sublist-options-container {
		padding: 8px;
		height: 100%;
		width: 100%;
		background-color: var(--surface-color);
		color: var(--text-color);
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.auto-sublist-options {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 8px 4px;

		& label {
			justify-self: end;
		}
	}
	.auto-sublist-generate-button {
		width: fit-content;
		justify-self: center;
		align-self: center;
	}
	.auto-sublist-unit-filters {
		display: grid;
		grid-template-columns: 1fr max-content;
		gap: 4px;
		& p {
			font-size: 0.9em;
			text-wrap: wrap;
		}
	}
	.auto-sublist-unit-filter-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 2;
		border-bottom: 1px solid var(--border);
		padding: 2px 4px;
	}

	.auto-sublist-legend-popover-body {
		padding: 16px;
		display: grid;
		grid-template-columns: max-content 1fr;

		& * {
			align-self: center;
		}
	}
	.auto-sublist-filter-legend {
		width: 20px;
		height: 20px;
		border: 2px solid var(--border);
		border-radius: calc(infinity * 1px);
		box-sizing: border-box;
	}
	.auto-sublist-filter-legend.legend-excluded {
		background-color: var(--error);
	}
	.auto-sublist-filter-legend.legend-allowed {
		background-color: var(--surface-color-light-text-color);
	}
	.auto-sublist-filter-legend.legend-required {
		background-color: var(--primary);
	}
	.auto-sublist-bs-filters {
		display: grid;
		grid-template-columns: 1fr max-content 1fr max-content 1fr;
		gap: 4px;
	}
	.auto-sublist-bs-filter-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 5;
		border-bottom: 1px solid var(--border);
		padding: 2px 4px;
	}
	.auto-sublist-bs-filter-row * {
		font-size: 0.9em;
		text-wrap: wrap;
	}
	.auto-list-container {
		padding: 8px;
		display: grid;
		width: 100%;
		height: fit-content;
		max-height: 100%;
		overflow: auto;
		grid-template-columns: 1fr repeat(4, max-content);
		gap: 4px 16px;
	}
	.auto-list-container-mobile {
		height: 100%;
		overflow: auto;
	}
	.auto-sublist-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 5;
		padding: 4px;
		border-bottom: 1px solid var(--border);
	}
	.auto-detail-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 3;
		padding: 4px;
	}
	.auto-sublist-row-mobile {
		display: flex;
		flex-direction: column;
		border-bottom: 1px solid var(--border);
		margin-bottom: 4px;
		padding: 4px 8px;
		gap: 4px;
	}
	.auto-sublist-mobile-unit-string {
		font-size: 0.9em;
	}
	.auto-sublist-mobile-stat-line {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.detailed-button {
		background-color: var(--button);
		color: var(--button-text);
		border-radius: var(--radius);
		padding: 8px 12px;
		box-shadow:
			0px -3px 0px var(--button-dark) inset,
			0px 4px 5px -3px var(--button-dark);
	}
	.detailed-button:hover {
		transform: translateY(-2px);
	}
	.detailed-button:active {
		box-shadow:
			3px 6px 12px var(--button-dark) inset,
			-3px -6px 12px var(--button-dark) inset;
		transform: translateY(-2px);
	}
	input {
		max-width: 150px;
	}
</style>
