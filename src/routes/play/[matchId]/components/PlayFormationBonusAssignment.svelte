<!-- <script lang="ts">
	import type { PlayFormation } from "../../types/types";
	import { SvelteMap } from "svelte/reactivity";
	import { Dialog } from "$lib/generic/";
	import type { MulUnit } from "$lib/types/listTypes";
	import { getSPAfromName } from "$lib/utilities/listUtilities";
	import { calculateBonusAmount } from "$lib/utilities/formationUtilities";

	type Props = {
		formation: PlayFormation;
		assignedBonuses: SvelteMap<number, SvelteMap<string, number>>;
		formationWideBonuses: SvelteMap<number, string>;
		unitReferences: SvelteMap<string, MulUnit>;
		destroyedUnits: string[];
	};

	let { formation, assignedBonuses, formationWideBonuses = $bindable(), unitReferences, destroyedUnits }: Props = $props();

	let selectedOption = $state<SvelteMap<string, string>>(new SvelteMap());
	let remainingUnitCount = $derived(formation.units.length - destroyedUnits.length);

	function getSelectedValue(index: string) {
		return selectedOption.get(index);
	}
	function setSelectedValue(index: string, value?: string) {
		if (value) selectedOption.set(index, value);
	}
	function applyFWBonus(index: number) {
		if (selectedOption.has(index.toString())) formationWideBonuses.set(index, selectedOption.get(index.toString())!);
	}
	function applyAssignedBonus(index: number, id: string) {
		if (assignedBonuses.get(index)?.has(id)) {
			assignedBonuses.get(index)?.delete(id);
		} else {
			if (selectedOption.has(`${index}-${id}`))
				assignedBonuses.get(index)?.set(id, getSPAfromName(selectedOption.get(`${index}-${id}`)!)?.id ?? -1) ??
					assignedBonuses.set(index, new SvelteMap([[id, getSPAfromName(selectedOption.get(`${index}-${id}`)!)?.id ?? -1]]));
		}
	}
</script>

<Dialog title="Assign Bonuses">
	{#snippet trigger()}
		Assign Bonuses
	{/snippet}
	{#snippet description()}
		Assign bonuses to units in the formation. Does not enforce any restrictions at the moment.
	{/snippet}
	<div class="bonus-assignment-wrapper">
		{#each formation.bonuses ?? [] as bonus, index}
			<div class="bonus-details">
				{#if bonus.type != "Unique"}
					<p class="muted">{bonus.grantedAbility?.join("/")}</p>
				{/if}
				{#if bonus.type == "Assigned"}
					<p class="muted">
						<span class={{ muted: true, error: (assignedBonuses.get(index)?.size ?? 0) > calculateBonusAmount(remainingUnitCount, bonus.assignedNumber) }}
							>{`${assignedBonuses.get(index)?.size ?? "0"}`}</span
						>{`/${calculateBonusAmount(remainingUnitCount, bonus.assignedNumber)}`}
					</p>
				{/if}
			</div>
			<div class="bonus-container">
				{#if bonus.type == "FormationWide" && bonus.grantedAbility.length > 1}
					<div class="bonus-row">
						<p class="muted">Formation Wide:</p>
						<select bind:value={() => getSelectedValue(index.toString()), (value) => setSelectedValue(index.toString(), value)}>
							{#each bonus.grantedAbility as ability}
								<option value={ability}>{ability}</option>
							{/each}
						</select>
						<button class="assign-button" onclick={() => applyFWBonus(index)}>Assign</button>
					</div>
				{:else if bonus.type == "Assigned"}
					{#each formation.units as id}
						<div class={{ "bonus-row": true, "assigned-row": assignedBonuses.get(index)?.get(id) }}>
							<p class={{ error: destroyedUnits.includes(id) }}>{unitReferences.get(id)?.name}</p>
							<select bind:value={() => getSelectedValue(`${index}-${id}`), (value) => setSelectedValue(`${index}-${id}`, value)}>
								{#each bonus.grantedAbility as ability}
									<option value={ability}>{ability}</option>
								{/each}
							</select>
							<button class="assign-button" onclick={() => applyAssignedBonus(index, id)}>{assignedBonuses.get(index)?.get(id) ? "Unassign" : "Assign"}</button>
						</div>
					{/each}
				{/if}
			</div>
		{/each}
	</div>
</Dialog>

<style>
	.bonus-assignment-wrapper {
		max-width: 95dvw;
	}
	.bonus-details {
		display: flex;
		gap: 16px;
	}
	.bonus-container {
		display: grid;
		grid-template-columns: 1fr max-content max-content;
		gap: 0px 16px;
		border: 1px solid var(--border);
		margin-bottom: 16px;
	}
	.bonus-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 3;
		border-bottom: 1px solid var(--border);
		padding: 4px 16px;
	}
	.assigned-row {
		background-color: rgba(9, 255, 0, 0.603);

		& p {
			color: black;
		}
	}
	select {
		height: max-content;
		align-self: center;
	}
	.assign-button {
		width: max-content;
		height: max-content;
		align-self: center;
	}
</style> -->
