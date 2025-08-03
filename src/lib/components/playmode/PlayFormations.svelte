<script lang="ts">
	import { Collapsible } from "$lib/components/global/";
	import type { PlayUnit, PlayFormation, LogRound, Options } from "$lib/types/playmode";
	import { PlayUnitCard } from "$lib/components/playmode/";
	import { SvelteMap } from "svelte/reactivity";
	import type { MulUnit } from "$lib/types/listTypes";
	import PlayFormationBonuses from "./PlayFormationBonuses.svelte";
	import { innerWidth } from "svelte/reactivity/window";
	import Popover from "../global/generic/Popover.svelte";

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
	let bonusesOpen = $state(false);
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
		<p>{formation.name}{formation.type != "none" ? `- ${formation.type}` : ""}</p>
		<div class="play-formation-header-bonus">
			{#if formation.type != "none"}
				{#if innerWidth?.current && innerWidth.current > 500}
					<PlayFormationBonuses {formation} bind:assignedBonuses {units} {unitReferences} />
				{:else}
					<Popover bind:open={bonusesOpen}>
						{#snippet trigger()}
							<p class="primary">Bonuses</p>
						{/snippet}
						<div class="bonus-wrapper">
							<PlayFormationBonuses {formation} bind:assignedBonuses {units} {unitReferences} />
						</div>
					</Popover>
				{/if}
			{/if}
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
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
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
	.play-formation-header-bonus {
		display: flex;
		justify-content: center;
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
	.bonus-wrapper {
		padding: 16px;
	}
</style>
