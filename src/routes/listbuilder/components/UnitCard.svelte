<script lang="ts">
	import { toastController } from "$lib/stores/toastController.svelte";
	import { getNewSkillCost } from "$lib/utilities/bt-utils";
	import { getContext } from "svelte";
	import type { List } from "../types/list.svelte";
	import { dragHandle } from "svelte-dnd-action";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import Menu from "$lib/components/Generic/Menu.svelte";
	import UnitCustomizationModal from "./UnitCustomizationModal.svelte";

	const { unitId }: { unitId: string } = $props();

	let list: List = getContext("list");
	let unit = list.getUnit(unitId)!;

	let unitCustomizationDialog = $state<UnitCustomizationModal | undefined>();
</script>

<div class="unit-card">
	{#if appWindow.isMobile}
		<div class="drag-handles" use:dragHandle>
			<img class="combobox-img" src="/icons/chevron-updown.svg" alt="expand list chevrons" />
		</div>
	{/if}
	<div class="unit-row-container">
		<div class="unit-name-row">
			<p class="name-row-name" class:invalid-unit={list.issues.issueUnits.has(unit?.id ?? "0")}>{unit?.baseUnit.name}</p>
			<p class="name-row-pv"><span class="muted">PV:</span> {unit?.cost}</p>
			<Menu img={"/icons/menu.svg"}>
				<button
					class="transparent-button"
					onclick={() => {
						unitCustomizationDialog?.show(unit);
					}}
				>
					Add Ammo/SPA
				</button>
				<button
					class="transparent-button"
					onclick={() => {
						list.removeUnit(unitId);
						toastController.addToast(`${unit?.baseUnit.name} removed from list`);
					}}>Remove unit</button
				>
			</Menu>
		</div>
		<div class="unit-header-row">
			<div class="unit-header">Type</div>
			<div class="unit-header">Skill</div>
			{#if unit?.baseUnit.type != "BS"}
				<div class="unit-header">Speed</div>
				<div class="unit-header">Damage</div>
				<div class="unit-header">Health</div>
				<div class="unit-header">Size</div>
				<div class="unit-header">Role</div>
			{/if}
		</div>
		<div class="unit-stat-row">
			<div class="unit-stat">{unit?.baseUnit.subtype}</div>
			<div class="unit-stat">
				{#if unit?.skill != undefined}
					<select
						bind:value={unit.skill}
						onchange={() => {
							unit.cost = getNewSkillCost(unit.skill, unit.baseUnit.pv);
						}}
					>
						{#each [...Array(8).keys()] as skill}
							<option value={skill}>{skill}</option>
						{/each}
					</select>
				{:else}
					-
				{/if}
			</div>
			{#if unit?.baseUnit.type != "BS"}
				<div class="unit-stat">
					{#each unit?.baseUnit.move! as movement, index}
						{#if index != 0}
							{"/ "}
						{/if}
						{`${movement.speed}"${movement.type ?? ""}`}
					{/each}
					- TMM {unit?.baseUnit.tmm}
				</div>
				<div class="unit-stat">
					{unit?.baseUnit.damageS}{unit?.baseUnit.damageSMin ? "*" : ""}{"/" + unit?.baseUnit.damageM}{unit?.baseUnit.damageMMin ? "*" : ""}{"/" + unit?.baseUnit.damageL}{unit
						?.baseUnit.damageLMin
						? "*"
						: ""}{" - " + unit?.baseUnit.overheat}
				</div>
				<div class="unit-stat">{unit?.baseUnit.health + " (" + unit?.baseUnit.armor + "+" + unit?.baseUnit.structure + ")"}</div>
				<div class="unit-stat">{unit?.baseUnit.size}</div>
				<div class="unit-stat">{unit?.baseUnit.role}</div>
			{/if}
		</div>
		<div class="unit-ability-row">
			<div class="unit-abilities">{unit?.baseUnit.abilities}</div>
		</div>
		{#if unit?.customization.ammo || unit?.customization.spa}
			<div class="unit-custom-row">
				{#if unit.customization.ammo?.length}
					<p class="unit-abilities">Alt. Ammo: {unit.customization.ammo?.join(", ")}</p>
				{/if}
				{#if unit.customization.spa?.length}
					<p class="unit-abilities">SPA: {unit.customization.spa?.join(", ")}</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

<UnitCustomizationModal bind:this={unitCustomizationDialog}></UnitCustomizationModal>

<style>
	.unit-card {
		width: 100%;
		border-bottom: 1px solid var(--border);
		flex: 1;
		min-height: fit-content;
		background-color: var(--card);
		display: flex;
		flex-shrink: 0;
	}
	.unit-card:hover {
		box-shadow: 3px 0px 3px var(--primary) inset;
		cursor: row-resize;
	}
	.drag-handles {
		display: flex;
		align-items: center;
		justify-items: center;
	}
	.unit-row-container {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.unit-name-row {
		display: grid;
		grid-template-columns: 1fr max-content max-content;
		gap: 8px;
		margin: 2px 0px;
	}
	.unit-name-row p {
		align-self: center;
	}
	.unit-header-row,
	.unit-stat-row {
		display: grid;
		grid-template-columns: 10% 10% 22% 20% 15% 8% 15%;
	}
	.unit-header {
		font-size: 0.75em;
		color: var(--muted-foreground);
		align-self: center;
		justify-self: safe center;
	}
	.unit-stat {
		font-size: 0.75em;
		align-self: center;
		justify-self: safe center;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.unit-ability-row {
		margin: 2px 0px;
		justify-content: space-between;
		display: flex;
	}
	.unit-custom-row {
		margin: 2px 0px;
		display: flex;
		gap: 16px;
	}
	.invalid-unit {
		color: var(--error);
	}
	.name-row-name {
		font-size: 0.95em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: 0s white-space;
		transition-behavior: allow-discrete;
	}
	.name-row-name:hover {
		white-space: wrap;
		transition-delay: 0.25s;
	}
	.name-row-pv {
		font-size: 0.9em;
	}
	.unit-abilities {
		font-size: 0.75em;
		color: var(--muted-foreground);
	}
</style>
