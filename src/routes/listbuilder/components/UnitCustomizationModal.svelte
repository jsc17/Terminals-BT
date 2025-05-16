<script lang="ts">
	import type { UnitV2 } from "$lib/types/unit";
	import spaList from "$lib/data/spas.json";
	import ammoList from "../../../lib/data/ammoTypes.json";
	import type { List } from "../types/list.svelte";
	import { getContext } from "svelte";

	let list: List = getContext("list");
	let unit = $state<UnitV2 | undefined>();

	let unitCustomizationDialog = $state<HTMLDialogElement>();

	let selectAmmoValue = $state<string>(ammoList[0].ammoTypes[0].name);
	let selectSPAValue = $state<string>(spaList[0].name);
	let filterWeapons = $state<boolean>(true);

	let filteredAmmoList = $derived.by(() => {
		if (filterWeapons && unit) {
			let filteredList = [];
			for (const weapon of ammoList) {
				let allowedAmmo: { name: string; requiredSpecial: string[]; page: number }[] = [];
				ammoTypeLoop: for (const ammoType of weapon.ammoTypes) {
					for (const requiredSpecial of ammoType.requiredSpecial) {
						if (unit.baseUnit.abilities.includes(requiredSpecial)) {
							allowedAmmo.push(ammoType);
							continue ammoTypeLoop;
						}
					}
				}
				if (allowedAmmo.length) {
					filteredList.push({ weaponType: weapon.weaponType, ammoTypes: allowedAmmo });
				}
			}
			return filteredList;
		} else {
			return ammoList;
		}
	});

	$effect(() => {
		selectAmmoValue = filteredAmmoList[0].ammoTypes[0].name;
	});

	export function show(unitId: string) {
		unitCustomizationDialog?.showModal();
		unit = list.getUnit(unitId);
	}
</script>

<dialog bind:this={unitCustomizationDialog}>
	<div class="dialog-header">
		<h2>{unit?.baseUnit?.name} customization</h2>
		<button class="close-button" onclick={() => unitCustomizationDialog?.close()}>Close</button>
	</div>
	<div class="customization-body">
		<div class="customization-column">
			<h3 class="customization-column-title">Alternate Ammo</h3>
			<ul class="customization-column-list">
				{#each unit?.customization.ammo ?? [] as ammo, index}
					<li class="customization-column-list-item">
						{ammo}
						<button
							onclick={() => {
								unit?.customization.ammo?.splice(index, 1);
							}}>-</button
						>
					</li>
				{/each}
			</ul>
			<div class="customization-column-add-row">
				{#if filteredAmmoList.length == 0}
					<p>No valid weapons that can use alternate ammo</p>
				{:else}
					<select class="customization-column-add-select" bind:value={selectAmmoValue} disabled={filteredAmmoList.length == 0} placeholder="">
						{#each filteredAmmoList as ammoType}
							<optgroup label={ammoType.weaponType}>
								{#each ammoType.ammoTypes as ammo}
									<option value={ammo.name}>{ammo.name} ({ammo.requiredSpecial.join(", ")})</option>
								{/each}
							</optgroup>
						{/each}
					</select>
					<button
						disabled={filteredAmmoList.length == 0}
						onclick={() => {
							if (unit && !unit?.customization.ammo) {
								unit.customization.ammo = [selectAmmoValue];
							} else {
								unit?.customization.ammo?.push(selectAmmoValue);
							}
						}}>Add</button
					>
				{/if}
			</div>
			<div class="alternate-ammo-option-row">
				<input type="checkbox" name="filterWeapons" id="filterWeapons" bind:checked={filterWeapons} /><label class="filterWeapons" for="filterWeapons"
					>Only allow valid ammo types</label
				>
			</div>
		</div>
		<div class="customization-column">
			<h3 class="customization-column-title">SPA's</h3>
			<ul class="customization-column-list">
				{#each unit?.customization.spa ?? [] as spa, index}
					<li class="customization-column-list-item">
						{spa}
						<button
							onclick={() => {
								unit?.customization.spa?.splice(index, 1);
							}}>-</button
						>
					</li>
				{/each}
			</ul>
			<div class="customization-column-add-row">
				<select class="customization-column-add-select" bind:value={selectSPAValue}>
					{#each spaList as spa}
						<option value={spa.name}>{spa.name} ({spa.cost})</option>
					{/each}
				</select>
				<button
					onclick={() => {
						if (unit && !unit.customization.spa) {
							unit.customization.spa = [selectSPAValue];
						} else {
							unit?.customization.spa?.push(selectSPAValue);
						}
					}}>Add</button
				>
			</div>
		</div>
	</div>
</dialog>

<style>
	dialog {
		padding: 16px;
		width: max-content;
		max-height: 90%;
	}
	.close-button {
		height: max-content;
	}
	.customization-body {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	.customization-column {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background-color: var(--card);
		min-height: 250px;
		padding: 4px 8px;
		gap: 4px;
	}
	.customization-column-title {
		border-bottom: 1px solid var(--border);
		margin: 0;
		padding: 4px;
	}
	.customization-column-list {
		list-style-type: none;
		flex: 1;
		padding-left: 6px;
		margin: 0;
		overflow: auto;
	}
	.customization-column-list-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 2px;
	}
	.customization-column-add-row {
		border-top: 1px solid var(--border);
		padding-top: 4px;
		width: 100%;
		display: flex;
		gap: 8px;
	}
	.customization-column-add-select {
		flex: 1;
	}
	.alternate-ammo-option-row {
		display: flex;
		gap: 2px;
		align-items: center;
	}
	.filterWeapons {
		color: var(--muted-foreground);
		font-size: 0.85em;
	}
</style>
