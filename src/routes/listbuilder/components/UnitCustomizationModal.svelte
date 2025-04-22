<script lang="ts">
	import type { UnitV2 } from "$lib/types/unit";
	import spaList from "$lib/data/spas.json";
	import ammoList from "$lib/data/ammoTypes.json";

	let UnitCustomizationDialog: HTMLDialogElement;
	let unitToModify = $state<UnitV2>();

	let selectAmmoValue = $state<string>(ammoList[0].ammoTypes[0].name);
	let selectSPAValue = $state<string>(spaList[0].name);

	export function show(unit: UnitV2) {
		UnitCustomizationDialog.showModal();
		unitToModify = unit;
	}
</script>

<dialog bind:this={UnitCustomizationDialog}>
	<div class="dialog-header">
		<h2>{unitToModify?.baseUnit?.name} customization</h2>
		<button class="close-button" onclick={() => UnitCustomizationDialog.close()}>Close</button>
	</div>
	<div class="customization-body">
		<div class="customization-column">
			<h3 class="customization-column-title">Alternate Ammo</h3>
			<ul class="customization-column-list">
				{#each unitToModify?.customization.ammo ?? [] as ammo, index}
					<li class="customization-column-list-item">
						{ammo}
						<button
							onclick={() => {
								unitToModify?.customization.ammo?.splice(index, 1);
							}}>-</button
						>
					</li>
				{/each}
			</ul>
			<div class="customization-column-add-row">
				<select class="customization-column-add-select" bind:value={selectAmmoValue}>
					{#each ammoList as ammoType}
						<optgroup label={ammoType.weaponType}>
							{#each ammoType.ammoTypes as ammo}
								<option value={ammo.name}>{ammo.name} ({ammo.requiredSpecial.join(", ")})</option>
							{/each}
						</optgroup>
					{/each}
				</select>
				<button
					onclick={() => {
						unitToModify?.customization.ammo?.push(selectAmmoValue);
					}}>Add</button
				>
			</div>
		</div>
		<div class="customization-column">
			<h3 class="customization-column-title">SPA's</h3>
			<ul class="customization-column-list">
				{#each unitToModify?.customization.spa ?? [] as spa, index}
					<li class="customization-column-list-item">
						{spa}
						<button
							onclick={() => {
								unitToModify?.customization.spa?.splice(index, 1);
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
						unitToModify?.customization.spa?.push(selectSPAValue);
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
	}
	.dialog-header {
		display: flex;
		gap: 24px;
		align-items: center;
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
		height: 250px;
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
</style>
