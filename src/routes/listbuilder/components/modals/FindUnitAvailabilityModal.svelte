<script lang="ts">
	import { deserialize } from "$app/forms";
	import { Dialog, Separator } from "$lib/components/global/";
	import { eraLookup, factionLookup } from "$lib/data/erasFactionLookup";
	import type { ListFormation, List } from "$lib/types/list.svelte";

	type Props = {
		formation?: ListFormation;
		list: List;
	};

	let { formation, list = $bindable() }: Props = $props();

	let open = $state(false);

	let unitList = $derived.by(() => {
		if (formation) {
			return formation.units.map(({ id }) => list.getUnit(id)?.baseUnit.id);
		} else {
			return list.units.map((unit) => unit.baseUnit.id);
		}
	});

	let availabilityResults = $state<{ era: string; factions: string[] }[]>();

	export async function show() {
		open = true;
		availabilityResults = undefined;
		const result = deserialize(await fetch("?/getFormationAvailability", { method: "POST", body: JSON.stringify(unitList) }).then((response) => response.text()));
		if (result.type == "success") {
			availabilityResults = [];
			for (const [era] of eraLookup) {
				let factionList = (result.data!.results as { era: number; faction: number }[])
					.filter((result) => {
						return result.era == era;
					})
					.map((result) => result.faction);
				if (factionList.length) {
					availabilityResults.push({ era: eraLookup.get(era) ?? "not found", factions: factionList.map((faction) => factionLookup.get(faction) ?? "Not found") });
				}
			}
		}
	}
</script>

<Dialog title={"Formation Faction Availability"} bind:open>
	{#snippet description()}
		<div class="description-body">
			<p class="muted-text italic">Shows all eras and factions the selected formation is legal in</p>
			<p class="selected-name">Selected Formation: {formation?.name ?? "All list units"}</p>
		</div>
	{/snippet}

	{#if availabilityResults === undefined}
		<p>Loading...</p>
	{:else if availabilityResults.length}
		<div class="availability-result-container">
			{#each availabilityResults as result}
				<p class="availability-result-era">{result.era}:</p>
				<p>{result.factions.join(", ")}</p>
				<Separator classes={"separator-border availability-separator"} />
			{/each}
		</div>
	{:else}
		<p class="error">No valid era/faction combination found for these units</p>
	{/if}
</Dialog>

<style>
	.muted-text {
		color: var(--muted-foreground);
	}
	.description-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
	}
	.selected-name {
		font-size: 18px;
	}
	.error {
		align-self: center;
		justify-self: center;
		color: var(--error);
	}
	.availability-result-container {
		padding: 16px;
		row-gap: 8px;
		column-gap: 24px;
		display: grid;
		grid-template-columns: max-content 1fr;
		max-height: 90dvh;
		overflow: auto;
	}
	:global(.availability-separator) {
		grid-column: span 2;
	}
	.availability-result-era {
		display: flex;
		justify-content: end;
		color: var(--primary);
	}
</style>
