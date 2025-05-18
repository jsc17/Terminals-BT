<script lang="ts">
	import { Collapsible } from "$lib/components/Generic";
	import type { PlayUnit } from "$lib/types/unit";
	import type { FormationV2 } from "../listbuilder/types/formation";
	import PlayMechCard from "./unitcards/PlayMechCard.svelte";

	type Props = {
		formation: FormationV2;
		units: PlayUnit[];
	};

	let { formation, units }: Props = $props();
	let openPrimary = $state(true),
		openSecondary = $state(true);
</script>

{#snippet drawFormationUnits(formationUnits: { id: string }[])}
	<div class="play-formation-unit-list">
		{#each formationUnits as unitId}
			{@const unit = units.find((unit) => {
				return unit.id == unitId.id;
			})}
			{#if unit}
				{#if ["BM", "IM"].includes(unit.baseUnit.subtype)}
					<PlayMechCard {unit}></PlayMechCard>
				{/if}
			{/if}
		{/each}
	</div>
{/snippet}

<div class="play-formation-container">
	<div class="play-formation-header">
		<p>{formation.name} - {formation.type} Formation</p>
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
	{#if formation.secondary && formation.secondary.units.length}
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
		margin-top: 8px;
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
		border-top-left-radius: var(--radius);
		border-top-right-radius: var(--radius);
	}
	.secondary-header {
		padding: 2px 16px;
	}
	.play-formation-unit-list {
		padding: 16px;
		display: grid;
		grid-template-columns: repeat(auto-fill, 400px);
		gap: 8px;
		width: 100%;
	}
	.expand-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 30px;
		img {
			filter: var(--primary-filter);
		}
	}
</style>
