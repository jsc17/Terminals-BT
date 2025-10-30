<script lang="ts">
	import type { PlayFormation, PlayUnit } from "$lib/playmode/types";
	import { calculateBonusAmount } from "$lib/utilities/formationUtilities";
	import { onMount } from "svelte";
	import { SvelteMap } from "svelte/reactivity";
	import PlayFormationBonusAssignment from "./PlayFormationBonusAssignment.svelte";
	import type { MulUnit } from "$lib/types/listTypes";

	type Props = {
		formation: PlayFormation;
		units: PlayUnit[];
		assignedBonuses: SvelteMap<number, SvelteMap<string, number>>;
		unitReferences: SvelteMap<string, MulUnit>;
	};

	let { formation, units, assignedBonuses = $bindable(), unitReferences }: Props = $props();

	let formationWideBonuses = $state<SvelteMap<number, string>>(new SvelteMap());
	let usedAbilites = $state<SvelteMap<number, { totalUses: number; remainingUses: number }>>(new SvelteMap());

	let destroyedUnits = $derived(
		formation.units.filter((unitId) => {
			const unit = units.find((unit) => unit.id == unitId);
			const unitReference = unitReferences.get(unitId);
			if (unit && unitReference) {
				return unit.current.damage >= (unitReference.health ?? 0) || unit.current.crits.find((crit) => crit.type == "destroyed");
			}
			return false;
		})
	);
	let remainingUnitCount = $derived(formation.units.length - destroyedUnits.length);

	onMount(() => {
		for (const [index, value] of (formation.bonuses ?? []).entries()) {
			if (value.type == "Assigned") {
				assignedBonuses.set(index, new SvelteMap());
			}
			if (value.type == "FormationWide" && value.uses) {
				const totalUses = calculateBonusAmount(formation.units.length, value.uses);
				usedAbilites.set(index, { totalUses, remainingUses: totalUses });
			}
		}
	});
</script>

<div class="flex-4">
	<div class="formation-bonus-container">
		{#each formation.bonuses ?? [] as bonus, index}
			<div class="formation-bonus-row">
				{#if bonus.type == "Unique"}
					<p class="muted">{bonus.description}</p>
				{:else if bonus.type == "FormationWide"}
					<p class="muted">
						{#each bonus.grantedAbility as ability, abilityIndex}
							<span class={{ muted: true, select: formationWideBonuses.get(index) == ability }}>{ability}</span>{abilityIndex != bonus.grantedAbility.length - 1 ? "/" : ""}
						{/each}
					</p>
					{#if usedAbilites.has(index)}
						<p>{`${usedAbilites.get(index)?.remainingUses}/${usedAbilites.get(index)?.totalUses}`}</p>
						<button
							class="fw-ability-uses-button"
							onclick={() => {
								let { totalUses, remainingUses } = usedAbilites.get(index)!;
								if (remainingUses > 0) {
									usedAbilites.set(index, { totalUses, remainingUses: remainingUses - 1 });
								}
							}}
						>
							{#each { length: usedAbilites.get(index)?.totalUses ?? 0 }, pipIndex}
								<div class={{ pip: true, "used-pip": pipIndex < (usedAbilites.get(index)?.remainingUses ?? 0) }}></div>
							{/each}
						</button>
						<button
							class="transparent-button"
							onclick={() => {
								let { totalUses, remainingUses } = usedAbilites.get(index)!;
								if (remainingUses < totalUses) {
									usedAbilites.set(index, { totalUses, remainingUses: remainingUses + 1 });
								}
							}}><img class="primary-filter" src="/icons/undo.svg" alt="Undo Button" /></button
						>
					{/if}
				{:else if bonus.type == "Assigned"}
					<p class="muted">{bonus.grantedAbility?.join("/")}</p>
					<p class="muted">
						<span class={{ muted: true, error: (assignedBonuses.get(index)?.size ?? 0) > calculateBonusAmount(remainingUnitCount, bonus.assignedNumber) }}
							>{`${assignedBonuses.get(index)?.size ?? "0"}`}</span
						>{`/${calculateBonusAmount(remainingUnitCount, bonus.assignedNumber)}`}
					</p>
				{/if}
			</div>
		{/each}
	</div>
	<div class="assign-button-wrapper">
		{#if formation.bonuses?.filter((bonus) => {
			return bonus.type == "Assigned" || (bonus.type == "FormationWide" && bonus.grantedAbility.length > 1);
		}).length ?? 0 != 0}
			<PlayFormationBonusAssignment {formation} {assignedBonuses} bind:formationWideBonuses {unitReferences} {destroyedUnits} />
		{/if}
	</div>
</div>

<style>
	.formation-bonus-container {
		display: grid;
		grid-template-columns: max-content max-content max-content 1fr;
		margin: 0px 8px;
	}
	.formation-bonus-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 4;
		column-gap: 14px;

		& p {
			text-align: end;
			align-self: center;
		}
	}
	.assign-button-wrapper {
		width: max-content;
	}
	.select {
		color: var(--primary);
	}
	.fw-ability-uses-button {
		display: flex;
		gap: 2px;
		background-color: transparent;
	}
	.fw-ability-uses-button:hover {
		cursor: pointer;
	}
	.pip {
		width: 20px;
		height: 20px;
		background-color: var(--surface-color-extra-light);
		border: 1px solid var(--border);
		border-radius: 50%;
	}
	.used-pip {
		background-color: var(--primary);
	}
</style>
