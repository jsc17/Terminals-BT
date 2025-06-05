<script lang="ts">
	import type { UnitV2, List, SublistV2 } from "$lib/types/";
	import { Dialog, Collapsible, Separator, RadioGroup, Popover } from "$lib/components/Generic";
	import { nanoid } from "nanoid";
	import { appWindow } from "$lib/stores";
	import { watch } from "runed";

	type AutoSublist = {
		id: string;
		sublist: SublistV2;
		unitString: string;
		count: number;
		pv: number;
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
		autoMaxPV: list.options?.sublistMaxPv ?? 0,
		autoMinPV: list.options?.sublistMaxPv ? list.options.sublistMaxPv - 10 : 0,
		autoMaxUnits: list.options?.sublistMaxUnits ?? 0,
		autoMinUnits: 0,
		autoMinUnitCost: list.options?.unitMinPV ?? 0
	});

	watch(
		() => list.options,
		() => {
			options.autoMaxPV = list.options?.sublistMaxPv ?? 0;
			options.autoMinPV = list.options?.sublistMaxPv ? list.options.sublistMaxPv - 10 : 0;
			options.autoMaxUnits = list.options?.sublistMaxUnits ?? 0;
			options.autoMinUnits = 0;
			options.autoMinUnitCost = list.options?.unitMinPV ?? 0;
		}
	);

	let filteredUnits = $state<{ id: string; name: string; included: string }[]>([]);

	let excludedUnits = $derived(filteredUnits.filter(({ included }) => included == "excluded").map(({ id }) => id));
	let requiredUnits = $derived(filteredUnits.filter(({ included }) => included == "required").map(({ id }) => id));

	function generatesublists() {
		autosublists = [];
		let existingCombinations = new Set();
		const possibleUnits = $state
			.snapshot(list.units)
			.filter((unit: UnitV2) => {
				return unit.cost >= options.autoMinUnitCost && !excludedUnits.includes(unit.id);
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
			if (subset.length && (!options.autoMinUnits || subset.length >= options.autoMinUnits) && (!options.autoMaxUnits || subset.length <= options.autoMaxUnits)) {
				let checked: string[] = [];
				let unitNameArray = [];
				let pv = 0;
				for (const unit of subset) {
					unitNameArray.push(`${unit.name} (${unit.skill})`);
					checked.push(unit.id);
					pv += unit.cost;
				}
				if (!requiredUnits.length || requiredUnits.every((v) => checked.includes(v))) {
					let subsetString = unitNameArray.join(", ");
					if (!existingCombinations.has(subsetString)) {
						existingCombinations.add(subsetString);

						if ((!options.autoMaxPV || pv <= options.autoMaxPV) && (!options.autoMinPV || pv >= options.autoMinPV)) {
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
		showFilters = false;
	}

	$effect(() => {
		filteredUnits = list.units
			.toSorted((a, b) => a.baseUnit.subtype.localeCompare(b.baseUnit.subtype))
			.map((unit) => {
				return { id: unit.id, name: unit.baseUnit.name, included: "allowed" };
			});
	});
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
	</div>
	<Separator classes="separator-card" />
	<button class="auto-sublist-generate-button" onclick={generatesublists}>Generate sublists</button>
	<Separator classes="separator-card" />

	<div class="auto-sublist-unit-filter-container">
		<Collapsible bind:open={showUnitFilters}>
			{#snippet trigger()}
				<p class="primary">Unit Filters {showUnitFilters ? "-" : "+"}</p>
			{/snippet}

			<div class="auto-sublist-unit-filters">
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
				{#each filteredUnits as unit}
					<p>{unit.name}</p>
					<RadioGroup
						items={[{ value: "excluded", selectedColor: "error" }, { value: "allowed", selectedColor: "muted-foreground" }, { value: "required" }]}
						bind:value={unit.included}
						orientation={"horizontal"}
					/>
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
				<div class="center">Unit Count</div>
				<div class="center">PV</div>
				<div></div>
				{#each autosublists as sublist}
					<div class="auto-sublist-row">
						<p>{sublist.unitString}</p>
						<p class="center">{sublist.count}</p>
						<p class="center">{sublist.pv}</p>
						<button
							class="auto-sublist-add-button center"
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
							<p><span class="muted">Unit Count:</span> {sublist.count}</p>
							<p><span class="muted">PV:</span> {sublist.pv}</p>
							<button
								class="auto-sublist-add-button center"
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
		background-color: var(--card);
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
		background-color: var(--card);
		color: var(--card-foreground);
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
		margin: 8px 0px;
		width: fit-content;
		padding: 4px 16px;
		justify-self: center;
		align-self: center;
	}
	.auto-sublist-unit-filters {
		display: grid;
		grid-template-columns: 1fr max-content;
		gap: 4px;
		& p {
			padding: 4px 4px;
			font-size: 0.9em;
			text-wrap: wrap;
			border-bottom: 1px solid var(--border);
		}
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
		background-color: var(--muted-foreground);
	}
	.auto-sublist-filter-legend.legend-required {
		background-color: var(--primary);
	}
	.auto-list-container {
		padding: 8px;
		display: grid;
		width: 100%;
		height: fit-content;
		max-height: 100%;
		overflow: auto;
		grid-template-columns: 1fr max-content max-content max-content;
		gap: 4px 16px;
	}
	.auto-list-container-mobile {
		height: 100%;
		overflow: auto;
	}
	.auto-sublist-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 4;
		padding: 4px;
		border-bottom: 1px solid var(--border);
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
	.auto-sublist-add-button {
		height: max-content;
		width: max-content;
		padding: 4px 16px;
	}
	input {
		max-width: 150px;
	}
</style>
