<script lang="ts">
	import type { Unit } from "$lib/types/unit";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { list } from "../list.svelte";
	import { getNewSkillCost } from "$lib/utilities/bt-utils";

	const { unit }: { unit: Unit } = $props();

	function modifySkill(event: Event, unit: Unit) {
		const target = event.target as HTMLInputElement;
		if (target) {
			let skill = parseInt(target.value);
			unit.cost = getNewSkillCost(skill, unit.pv);
		}
	}
</script>

<main class="unit-card">
	<div class="unit-row">
		<p class="name">{unit.name}</p>
		<p>{unit.subtype}</p>
		<p>
			{#if unit.skill == undefined}
				-
			{:else}
				Skill - <input onchange={(e) => modifySkill(e, unit)} type="number" min={list.options?.minSkill ?? 0} max={list.options?.maxSkill ?? 7} value={unit.skill} />
			{/if}
		</p>
		<p>PV - {unit.cost}</p>
		<button onclick={() => {
				list.remove(unit.id!);
				toastController.addToast(`${unit.name} removed from list`);
			}}>-</button>
	</div>
	<div class="stat-row">
		<p>{unit.abilities}</p>
		{#if unit.type != "BS"}
			<p>
				{#each unit.move! as movement, index}
					{#if index != 0}
						{"/ "}
					{/if}
					{`${movement.speed}"${movement.type ?? ""}`}
				{/each}
				- TMM {unit.tmm}
			</p>
			<p>{unit.damageS}{unit.damageSMin ? "*" : ""}{"/" + unit.damageM}{unit.damageMMin ? "*" : ""}{"/" + unit.damageL}{unit.damageLMin ? "*" : ""}{" - " + unit.overheat}</p>
			<p>{unit.health + " (" + unit.armor + "+" + unit.structure + ")"}</p>
			<p>Size - {unit.size}</p>
		{/if}
	</div>
</main>

<style>
	main {
		width: 100%;
		border-bottom: 1px solid var(--border);
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
	button {
		height: 20px;
		width: 20px;
	}
	.name {
		margin-right: 8px;
	}
</style>
