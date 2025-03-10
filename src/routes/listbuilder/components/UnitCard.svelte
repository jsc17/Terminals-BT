<script lang="ts">
	import { toastController } from "$lib/stores/toastController.svelte";
	import { getNewSkillCost } from "$lib/utilities/bt-utils";
	import { getContext } from "svelte";
	import type { List } from "../types/list.svelte";
	import type { UnitV2 } from "$lib/types/unit";
	import { dragHandle } from "svelte-dnd-action";
	import { appWindow } from "$lib/stores/appWindow.svelte";

	const { unitId }: { unitId: string } = $props();

	let list: List = getContext("list");
	let unit = list.getUnit(unitId);
</script>

<div class="unit-card">
	{#if appWindow.isMobile}
		<div class="drag-handles" use:dragHandle>
			<img class="combobox-img" src="/icons/chevron-updown.svg" alt="expand list chevrons" />
		</div>
	{/if}
	<div class="unit-row-container-mobile">
		<div class="unit-name-row">
			<p class="name" class:invalid-unit={list.issues.issueUnits.has(unit?.id ?? "0")}>{unit?.baseUnit.name}</p>
			<button
				class="remove-button center"
				onclick={() => {
					list.removeUnit(unitId);
					toastController.addToast(`${unit?.baseUnit.name} removed from list`);
				}}>-</button
			>
		</div>
		<div class="unit-header-row">
			<div class="unit-header">Type</div>
			<div class="unit-header">Skill</div>
			<div class="unit-header">PV</div>
			{#if unit?.baseUnit.type != "BS"}
				<div class="unit-header">Speed</div>
				<div class="unit-header">Damage</div>
				<div class="unit-header">Health</div>
				<div class="unit-header">Size</div>
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
			<div class="unit-stat">{unit?.cost}</div>
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
			{/if}
		</div>
		<div class="unit-ability-row">
			<div class="unit-abilities">{unit?.baseUnit.abilities}</div>
		</div>
	</div>
</div>

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
	.unit-row-container-mobile {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.center {
		justify-self: center;
	}
	.unit-name-row {
		display: grid;
		grid-template-columns: 1fr max-content;
		gap: 4px;
		margin-top: 2px;
	}
	.unit-header-row,
	.unit-stat-row {
		display: grid;
		grid-template-columns: 11% 11% 11% 20% 20% 20% 5%;
	}
	.unit-header {
		font-size: 0.75em;
		color: var(--muted-foreground);
		align-self: center;
		justify-self: center;
	}
	.unit-stat {
		font-size: 0.75em;
		align-self: center;
		justify-self: center;
	}
	.unit-ability-row {
		margin: 2px 0px;
		justify-content: space-between;
		display: flex;
	}
	.invalid-unit {
		color: var(--error);
	}
	.remove-button {
		height: 20px;
		width: 20px;
	}
	.name {
		font-size: 0.95em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: 0s white-space;
		transition-behavior: allow-discrete;
	}
	.name:hover {
		white-space: wrap;
		transition-delay: 0.25s;
	}
	.unit-abilities {
		font-size: 0.75em;
		color: var(--muted-foreground);
	}
</style>
