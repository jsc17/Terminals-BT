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

	function modifySkill(event: Event, unit: UnitV2) {
		const target = event.target as HTMLInputElement;
		if (target) {
			let skill = parseInt(target.value);
			unit.skill = skill;
			unit.cost = getNewSkillCost(skill, unit?.baseUnit.pv);
		}
	}
</script>

<div class="unit-card">
	{#if appWindow.isMobile}
		<div class="drag-handles" use:dragHandle>
			<img class="combobox-img" src="/icons/chevron-updown.svg" alt="expand list chevrons" />
		</div>
	{/if}

	<div class="unit-row-container">
		<div class="unit-detail-row">
			<p class="name" class:invalid-unit={list.issues.issueUnits.has(unit?.id ?? "0")}>{unit?.baseUnit.name}</p>
			<p class="center">{unit?.baseUnit.subtype}</p>
			<p class="center">
				{#if unit?.skill}
					Skill - <input
						class="skill-input"
						onchange={(e) => {
							console.log("changing skill");
							modifySkill(e, unit);
						}}
						type="number"
						value={unit.skill}
						min={list.options?.minSkill ?? 0}
						max={list.options?.maxSkill ?? 7}
					/>
				{:else}
					-
				{/if}
			</p>
			<p class="center">PV - {unit?.cost}</p>
			<button
				class="remove-button center"
				onclick={() => {
					list.removeUnit(unitId);
					toastController.addToast(`${unit?.baseUnit.name} removed from list`);
				}}>-</button
			>
		</div>
		<div class="unit-stat-row">
			<p>{unit?.baseUnit.abilities}</p>
			{#if unit?.baseUnit.type != "BS"}
				<p class="center">
					{#each unit?.baseUnit.move! as movement, index}
						{#if index != 0}
							{"/ "}
						{/if}
						{`${movement.speed}"${movement.type ?? ""}`}
					{/each}
					- TMM {unit?.baseUnit.tmm}
				</p>
				<p class="center">
					{unit?.baseUnit.damageS}{unit?.baseUnit.damageSMin ? "*" : ""}{"/" + unit?.baseUnit.damageM}{unit?.baseUnit.damageMMin ? "*" : ""}{"/" + unit?.baseUnit.damageL}{unit
						?.baseUnit.damageLMin
						? "*"
						: ""}{" - " + unit?.baseUnit.overheat}
				</p>
				<p class="center">{unit?.baseUnit.health + " (" + unit?.baseUnit.armor + "+" + unit?.baseUnit.structure + ")"}</p>
				<p class="center">Size - {unit?.baseUnit.size}</p>
			{/if}
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
	.unit-row-container {
		flex: 1;
	}
	.unit-detail-row,
	.unit-stat-row {
		display: grid;
		grid-template-columns: 40% 15% 20% 15% 10%;
		padding-bottom: 8px;
		align-items: center;
	}
	.center {
		justify-self: center;
	}
	.unit-detail-row {
		padding-left: 5px;
		font-size: 0.95em;
	}
	.unit-stat-row {
		padding-left: 15px;
		font-size: 0.7em;
	}
	input[type="number"] {
		width: 40px;
	}
	.invalid-unit {
		color: var(--error);
	}
	.remove-button {
		height: 20px;
		width: 20px;
	}
	.name {
		margin-right: 8px;
	}
</style>
