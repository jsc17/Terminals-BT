<script lang="ts">
	import { toastController } from "$lib/stores/toastController.svelte";
	import { getNewSkillCost } from "$lib/utilities/bt-utils";
	import { getContext } from "svelte";
	import type { List } from "../types/list.svelte";
	import type { UnitV2 } from "$lib/types/unit";

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

<main class="unit-card">
	<div class="unit-row">
		<p class="name" class:invalid-unit={list.issues.issueUnits.has(unit?.id ?? "0")}>{unit?.baseUnit.name}</p>
		<p class="center">{unit?.baseUnit.subtype}</p>
		<p class="center">
			{#if unit?.skill}
				Skill - <input
					class="skill-input"
					onchange={(e) => {
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
	<div class="stat-row">
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
			<!-- <Menu img={"/icons/dots-horizontal.svg"}>
				<button
					class="menu-button"
					onclick={() => {
						list.addUnit(unit);
					}}
				>
					Duplicate Unit
				</button>
				<button
				class="menu-button"
				onclick={() => {
					unit.spa ? unit.spa.push("Jumping Jack") : (unit.spa = ["Jumping Jack"]);
				}}
			>
				Customize unit
			</button> 
			</Menu>-->
		{/if}
	</div>
	<!-- {#if unit.ammo?.length || unit.spa?.length}
		<div class="custom-row">
			{#if unit.spa}
				<p>SPA: {unit.spa.toString()}</p>
			{/if}
			{#if unit.ammo}
				<p>Ammo {unit.ammo.toString()}</p>
			{/if}
		</div>
	{/if} -->
</main>

<style>
	main {
		width: 100%;
		border-bottom: 1px solid var(--border);
		flex: 1;
		min-height: fit-content;
		background-color: var(--card);
	}
	main:hover {
		box-shadow: 3px 0px 3px var(--primary) inset;
		cursor: row-resize;
	}
	.unit-row,
	.stat-row {
		display: grid;
		grid-template-columns: 40% 15% 20% 15% 10%;
		padding-bottom: 8px;
		align-items: center;
	}
	.center {
		justify-self: center;
	}
	.unit-row {
		padding-left: 5px;
		font-size: 0.95em;
	}
	.stat-row {
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
	.menu-button {
		background-color: transparent;
		color: var(--primary);
	}
	.name {
		margin-right: 8px;
	}
</style>
