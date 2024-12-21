<script lang="ts">
	import type { Unit } from "$lib/types/unit";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { getNewSkillCost } from "$lib/utilities/bt-utils";
	import type { UnitList } from "$lib/types/list.svelte";
	import { getContext } from "svelte";
	import Menu from "$lib/components/Menu.svelte";

	let list: UnitList = getContext("list");

	const { unit }: { unit: Unit } = $props();

	function modifySkill(event: Event, unit: Unit) {
		const target = event.target as HTMLInputElement;
		if (target) {
			let skill = parseInt(target.value);
			unit.skill = skill;
			unit.cost = getNewSkillCost(skill, unit.pv);
		}
	}
</script>

<main class="unit-card">
	<div class="unit-row">
		<p class="name" class:invalid-unit={list.issues.issueUnits.has(unit.id ?? 0)}>{unit.name}</p>
		<p class="center">{unit.subtype}</p>
		<p class="center">
			{#if unit.skill == undefined}
				-
			{:else}
				Skill - <input onchange={(e) => modifySkill(e, unit)} type="number" min={list.options?.minSkill ?? 0} max={list.options?.maxSkill ?? 7} value={unit.skill} />
			{/if}
		</p>
		<p class="center">PV - {unit.cost}</p>
		<button
			class="remove-button center"
			onclick={() => {
				list.remove(unit.id!);
				toastController.addToast(`${unit.name} removed from list`);
			}}>-</button
		>
	</div>
	<div class="stat-row">
		<p>{unit.abilities}</p>
		{#if unit.type != "BS"}
			<p class="center">
				{#each unit.move! as movement, index}
					{#if index != 0}
						{"/ "}
					{/if}
					{`${movement.speed}"${movement.type ?? ""}`}
				{/each}
				- TMM {unit.tmm}
			</p>
			<p class="center">
				{unit.damageS}{unit.damageSMin ? "*" : ""}{"/" + unit.damageM}{unit.damageMMin ? "*" : ""}{"/" + unit.damageL}{unit.damageLMin ? "*" : ""}{" - " + unit.overheat}
			</p>
			<p class="center">{unit.health + " (" + unit.armor + "+" + unit.structure + ")"}</p>
			<p class="center">Size - {unit.size}</p>
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
