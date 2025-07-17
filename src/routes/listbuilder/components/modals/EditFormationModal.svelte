<script lang="ts">
	import { List, type ListFormation } from "$lib/types/list.svelte";
	import { Select, Dialog } from "$lib/components/global/";
	import { formationDataList } from "$lib/data/FormationData";
	import type { FormationData } from "$lib/types/formationData";
	import { getFormationDataFromName } from "$lib/utilities/formationUtilities";

	type Props = {
		formation: ListFormation;
		open: boolean;
		list: List;
		validationResults: {
			primary: { valid: boolean; requirements: { requirement: string; met: number }[] };
			secondary: { valid: boolean; requirements: { requirement: string; met: number }[] };
		};
	};

	let { formation, open = $bindable(false), validationResults }: Props = $props();

	let formationTypeList: { groupLabel: string; items: { value: string; label: string }[] }[] = formationDataList.map((group) => {
		return {
			groupLabel: group.type,
			items: group.formations.map((formation: FormationData) => {
				return {
					value: formation.name,
					label: formation.name,
					subitems: formation.variations?.map((variation) => {
						return { value: variation.name, label: variation.name };
					})
				};
			})
		};
	});

	let secondaryFormationList: { value: string; label: string }[] = [{ value: "None", label: "None" }].concat(
		formationDataList.flatMap((group) => {
			return group.formations
				.filter((formation: FormationData) => {
					return formation.secondary;
				})
				.map((secondary: FormationData) => {
					return { value: secondary.name, label: secondary.name };
				});
		})
	);

	let formationDetails = $derived(getFormationDataFromName(formation.type));
	let secondaryDetails = $derived.by(() => {
		if (secondaryValue == "None") {
			return undefined;
		} else {
			return getFormationDataFromName(secondaryValue);
		}
	});

	let secondaryValue = $state(formation.secondary?.type ?? "None");
	function getSecondaryValue() {
		return secondaryValue;
	}
	function setSecondaryValue(newValue: string) {
		if (newValue == "None") {
			for (const unit of formation.secondary?.units ?? []) {
				formation.units.push(unit);
			}
			delete formation.secondary;
		} else {
			formation.secondary = { type: newValue, units: formation.secondary?.units ?? [] };
		}
		secondaryValue = newValue;
	}
</script>

{#snippet description()}
	<span class="edit-formation-description">
		Vehicle formations should have matched pairs of combat vehicles, but that is not currently validated. All requirements appear to be validating correctly, but there are possibly
		still bugs.
	</span>
{/snippet}

<Dialog bind:open title={`Edit ${formation?.name}`} {description}>
	<div class="edit-formation-body">
		<label>Formation Name: <input class="edit-formation-name-input" type="text" name="formation-name" id="formation-id" bind:value={formation.name} /></label>
		<div class="formation">
			<div class="formation-selection-row">
				<div class="edit-formation-option-select-row">
					<p>Formation Type:</p>
					<div class="select-formation-type-wrapper"><Select bind:value={formation.type} type="single" groupedItems={formationTypeList}></Select></div>
				</div>
			</div>
			<p class="formation-status-row">
				Formation Status: {#if validationResults.primary.valid}
					<span class="valid">Valid</span>
				{:else}
					<span class="invalid">Invalid</span>
				{/if}
			</p>
			<div class="edit-formation-requirement-container">
				<div class="requirement-row">
					<div></div>
					<p class="muted">Source: {formationDetails?.page}</p>
				</div>
				{#each validationResults.primary.requirements as requirement}
					<div class="requirement-row">
						<p class:valid={requirement.met == 1} class:invalid={requirement.met == -1}>{requirement.met == 1 ? "✔" : "X"}</p>
						<p class="muted">{requirement.requirement}</p>
					</div>
				{/each}
			</div>
			<p class="formation-status-row">Bonus(es):</p>
			<div class="formation-bonus-container">
				{#each formationDetails?.bonus ?? [] as bonus}
					<div class="formation-bonus-row">
						<p class="muted">{bonus.description}</p>
					</div>
				{/each}
			</div>
		</div>
		<div class="formation">
			<div class="formation-selection-row">
				<div class="edit-formation-option-select-row">
					<p>Secondary Type:</p>
					<div class="select-formation-type-wrapper"><Select bind:value={getSecondaryValue, setSecondaryValue} type="single" items={secondaryFormationList}></Select></div>
				</div>
			</div>
			<p class="formation-status-row">
				Secondary Status: {#if formation.secondary}{#if validationResults.secondary.valid}
						<span class="valid">Valid</span>
					{:else}
						<span class="invalid">Invalid</span>
					{/if}
				{:else}
					None
				{/if}
			</p>
			<div class="edit-formation-requirement-container">
				{#if secondaryDetails}
					<div class="requirement-row">
						<div></div>
						<p class="muted">Source: {secondaryDetails?.page}</p>
					</div>
				{/if}
				{#each validationResults.secondary.requirements as requirement}
					<div class="requirement-row">
						<p class:valid={requirement.met == 1} class:invalid={requirement.met == -1}>{requirement.met == 1 ? "✔" : "X"}</p>
						<p>{requirement.requirement}</p>
					</div>
				{/each}
			</div>
			{#if secondaryValue != "None"}
				<p class="formation-status-row">Bonus(es):</p>
				<div class="formation-bonus-container">
					{#each secondaryDetails?.bonus ?? [] as bonus}
						<div class="formation-bonus-row">
							<p class="muted">{bonus.description}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</Dialog>

<style>
	.edit-formation-description {
		font-size: 0.85em;
		color: var(--muted-foreground);
	}
	.edit-formation-body {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}
	.formation {
		display: flex;
		flex-direction: column;
		gap: 4px;
		border: 1px solid var(--border);
		padding-bottom: 8px;
	}
	.select-formation-type-wrapper {
		width: clamp(5em, 100%, 12em);
	}
	.formation-selection-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 4px 6px;
	}
	.edit-formation-option-select-row {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 4px;

		& p {
			font-size: 0.95em;
		}
	}

	.edit-formation-requirement-container {
		border: 1px solid var(--border);
		display: grid;
		grid-template-columns: max-content 1fr;
		column-gap: 16px;
		margin: 0px 8px;
	}
	.formation-status-row {
		padding: 4px 10px;
		font-size: 0.95em;
	}
	.requirement-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 2;
		padding: 4px 8px;
		border-bottom: 1px solid var(--border);
		& p {
			align-self: center;
		}
	}
	.formation-bonus-container {
		padding: 4px 16px;
		display: grid;
		grid-template-columns: 1fr;
		gap: 4px;
		border: 1px solid var(--border);
		margin: 0px 8px;
	}
	.formation-bonus-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 3;
	}
	input {
		background-color: var(--muted);
	}
	input:hover {
		border: 1px solid var(--primary);
	}
	.edit-formation-name-input {
		max-width: 30ch;
	}
	.valid {
		color: forestgreen;
		font-weight: bold;
	}
	.invalid {
		color: red;
		font-weight: bold;
	}
</style>
