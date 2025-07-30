<script lang="ts">
	import { Collapsible, Select } from "$lib/components/global/";
	import type { PlayUnit, PlayFormation, LogRound, Options } from "$lib/types/playmode";
	import { PlayUnitCard } from "$lib/components/playmode/";
	import { calculateBonusAmount } from "$lib/utilities/formationUtilities";
	import { SvelteMap } from "svelte/reactivity";
	import { onMount } from "svelte";
	import PlayFormationBonusAssignment from "./PlayFormationBonusAssignment.svelte";
	import type { MulUnit } from "$lib/types/listTypes";

	type Props = {
		formation: PlayFormation;
		units: PlayUnit[];
		options: Options;
		currentRoundLog: LogRound;
		unitReferences: SvelteMap<string, MulUnit>;
	};

	let { formation, units, options, currentRoundLog, unitReferences }: Props = $props();
	let openPrimary = $state(true),
		openSecondary = $state(true);
	let formationWidth = $state<number>();
	let cardWidth = $derived((formationWidth! - 16 - 8 * (options.cardsPerRow ?? 3)) / (options.cardsPerRow ?? 3));

	let assignedBonuses = $state<SvelteMap<number, SvelteMap<string, number>>>(new SvelteMap());
	let formationWideBonuses = $state<SvelteMap<number, string>>(new SvelteMap());

	onMount(() => {
		for (const [index, value] of (formation.bonuses ?? []).entries()) {
			if (value.type == "Assigned") {
				assignedBonuses.set(index, new SvelteMap());
			}
		}
	});
</script>

{#snippet drawFormationUnits(formationUnits: string[])}
	<div class="play-formation-unit-list" bind:clientWidth={formationWidth}>
		{#each formationUnits as unitId}
			{@const unit = units.find((unit) => {
				return unit.id == unitId;
			})}
			{#if unit}
				<div class="unit-card-container" style="width: {cardWidth}px; height:{(cardWidth * 5) / 7}px">
					<PlayUnitCard {unit} {options} {currentRoundLog} {assignedBonuses}></PlayUnitCard>
				</div>
			{/if}
		{/each}
	</div>
{/snippet}
<div class="play-formation-container">
	<div class="play-formation-header">
		<p>{formation.name}{formation.type != "none" ? `- ${formation.type} Formation` : ""}</p>
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
						{:else if bonus.type == "Assigned"}
							<p class="muted">{bonus.grantedAbility?.join("/")}</p>
							<p class="muted">
								<span class={{ muted: true, error: (assignedBonuses.get(index)?.size ?? 0) > calculateBonusAmount(formation.units.length, bonus.assignedNumber) }}
									>{`${assignedBonuses.get(index)?.size ?? "0"}`}</span
								>{`/${calculateBonusAmount(formation.units.length, bonus.assignedNumber)}`}
							</p>
						{/if}
					</div>
				{/each}
			</div>
			<div class="assign-button-wrapper">
				{#if formation.bonuses?.filter((bonus) => {
					return bonus.type == "Assigned" || (bonus.type == "FormationWide" && bonus.grantedAbility.length > 1);
				}).length != 0}
					<PlayFormationBonusAssignment {formation} {assignedBonuses} bind:formationWideBonuses {unitReferences} />
				{/if}
			</div>
		</div>
		<button
			onclick={() => {
				openPrimary = !openPrimary;
			}}
			class="transparent-button expand-collapse">{openPrimary ? "collapse" : "expand"}</button
		>
	</div>
	<Collapsible bind:open={openPrimary}>
		{@render drawFormationUnits(formation.units)}
	</Collapsible>
	{#if !openPrimary}
		<button
			class="transparent-button expand-button"
			onclick={() => {
				openPrimary = true;
			}}>Expand collapsed formation <img src="/icons/expand.svg" alt="Expand formation" /></button
		>
	{/if}
	{#if formation.secondary?.units?.length}
		<div class="secondary-header">
			<p>{formation.secondary.type}</p>
			<button
				onclick={() => {
					openSecondary = !openSecondary;
				}}
				class="transparent-button expand-collapse">{openSecondary ? "collapse" : "expand"}</button
			>
		</div>
		<Collapsible bind:open={openSecondary}>
			{@render drawFormationUnits(formation.secondary.units)}
		</Collapsible>
		{#if !openSecondary}
			<button
				class="transparent-button expand-button"
				onclick={() => {
					openSecondary = true;
				}}>Expand collapsed formation <img src="/icons/expand.svg" alt="Expand formation" /></button
			>
		{/if}
	{/if}
</div>

<style>
	.play-formation-container {
		width: 100%;
		border: 1px solid var(--primary-muted);
		border-radius: var(--radius);
	}
	.play-formation-header,
	.secondary-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--border);
		background-color: var(--card);
	}
	.play-formation-header {
		padding: 4px 16px;
		gap: 16px;
		border-top-left-radius: var(--radius);
		border-top-right-radius: var(--radius);
	}
	.secondary-header {
		padding: 2px 16px;
	}
	.play-formation-unit-list {
		padding: 8px;
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
		gap: 8px;
		width: 100%;
	}
	.expand-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 30px;
		& img {
			filter: var(--primary-filter);
		}
	}
	.unit-card-container {
		container: unit-card / size;
	}
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
		}
	}
	.assign-button-wrapper {
		width: max-content;
	}
	.select {
		color: var(--primary);
	}
</style>
