<script lang="ts">
	import { Dialog } from "$lib/generic";
	import type { AssignedBonus } from "$lib/types/formationData";
	import type { List } from "$lib/types/list.svelte";
	import type { ListFormation } from "$lib/types/listTypes";
	import { calculateBonusAmount } from "$lib/utilities/formationUtilities";
	import { getSPAfromId, getSPAfromName } from "$lib/utilities/listUtilities";
	import { SvelteMap } from "svelte/reactivity";

	type Props = {
		bonus: AssignedBonus;
		index: number;
		formation: ListFormation;
		list: List;
	};

	let { bonus, index, formation = $bindable(), list }: Props = $props();

	let assignedBonuses: SvelteMap<string, number> = new SvelteMap();
	let selectedAbility = $state(bonus.grantedAbility[0]);
	let maxAssignments = $derived(calculateBonusAmount(formation.units.length, bonus.assignedNumber!));

	let open = $state(false);

	function handleAssign(id: string) {
		const abilityToAssign = getSPAfromName(selectedAbility);
		if (abilityToAssign) {
			assignedBonuses.set(id, abilityToAssign.id);
		} else {
			console.error("Invalid ability selected");
		}
	}

	function handleUnassign(id: string) {
		assignedBonuses.delete(id);
	}

	function handleCancel() {
		assignedBonuses.clear();
		open = false;
	}

	function handleApply() {
		for (const unit of formation.units) {
			if (unit.bonus) {
				const existingBonusIndex = unit.bonus.findIndex((bonus) => bonus.ind == index);
				if (assignedBonuses.has(unit.id)) {
					if (existingBonusIndex != -1) {
						unit.bonus[existingBonusIndex] = { ind: index, abil: assignedBonuses.get(unit.id)! };
					} else {
						unit.bonus.push({ ind: index, abil: assignedBonuses.get(unit.id)! });
					}
				} else {
					if (existingBonusIndex != -1) {
						unit.bonus.splice(existingBonusIndex, 1);
					}
				}
			} else {
				if (assignedBonuses.has(unit.id)) {
					unit.bonus = [{ ind: index, abil: assignedBonuses.get(unit.id)! }];
				}
			}
		}
		open = false;
	}

	function onOpenChange() {
		if (open) {
			for (const unit of formation.units) {
				for (const bonus of unit.bonus ?? []) {
					if (bonus.ind == index) assignedBonuses.set(unit.id, bonus.abil);
				}
			}
		}
	}
</script>

<Dialog title="Assign Formation Bonuses" bind:open {onOpenChange}>
	{#snippet trigger()}
		Assign
	{/snippet}
	{#snippet description()}
		<p class="muted">Does not currently enforce ability limits and restrictions</p>
		{#if bonus.sameAbility}
			<p>Units should be assigned the same {bonus.abilityType == "SPA" ? "SPA" : "ability"}</p>
		{:else}
			<p>Units may be assigned different {bonus.abilityType == "SPA" ? "SPA" : "ability"}</p>
		{/if}
	{/snippet}
	<div class="assign-bonus-body">
		<label
			>Ability to Assign <select bind:value={selectedAbility}>
				{#each bonus.grantedAbility as ability}
					<option value={ability}>{ability}</option>
				{/each}
			</select>
			<span class:error={assignedBonuses.size > maxAssignments}>{assignedBonuses.size}</span>/{maxAssignments}</label
		>
		<div class="unit-container">
			{#each formation.units as unit}
				{@const unitDetails = list.getUnit(unit.id)}
				{#if unitDetails}
					<div class="unit-row">
						<p>{unitDetails.baseUnit.name}</p>
						<p class="muted center">{`${assignedBonuses.has(unit.id) ? getSPAfromId(assignedBonuses.get(unit.id)!)?.name : "-"}`}</p>
						{#if !assignedBonuses.has(unit.id)}
							<button onclick={() => handleAssign(unit.id)}>Assign</button>
						{:else}
							<button onclick={() => handleUnassign(unit.id)}>Unassign</button>
						{/if}
					</div>
				{/if}
			{/each}
		</div>
		<div class="button-row">
			<button onclick={handleCancel}>Cancel</button>
			<button onclick={handleApply}>Apply</button>
		</div>
	</div>
</Dialog>

<style>
	.assign-bonus-body {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.unit-container {
		display: grid;
		grid-template-columns: 1fr max(200px, max-content) max-content;
		border: 1px solid var(--border);
	}
	.button-row {
		display: flex;
		align-self: center;
		gap: 16px;

		& button {
			padding: 4px 12px;
		}
	}
	.unit-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 3;
		border-bottom: 1px solid var(--border);
		padding: 8px;
		gap: 16px;
	}
	.unit-row:hover {
		background-color: var(--surface-color-light);
	}
</style>
