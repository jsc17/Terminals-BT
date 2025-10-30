<script lang="ts">
	import { List, type ListFormation } from "$lib/types/list.svelte";
	import { Select, Dialog } from "$lib/generic";
	import { formationDataList } from "$lib/data/formationData";
	import type { FormationData } from "$lib/types/formationData";
	import { calculateBonusAmount, getFormationDataFromName } from "$lib/utilities/formationUtilities";
	import AssignFormationBonusModal from "./AssignFormationBonusModal.svelte";

	type Props = {
		formation: ListFormation;
		open: boolean;
		list: List;
		validationResults: {
			primary: { valid: boolean; requirements: { requirement: string; met: number }[] };
			secondary: { valid: boolean; requirements: { requirement: string; met: number }[] };
		};
	};

	let { formation = $bindable(), open = $bindable(false), list, validationResults }: Props = $props();

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

	function getPrimaryValue() {
		return formation.type;
	}
	function setPrimaryValue(newValue: string) {
		delete formation.fwBonus;
		for (const unit of formation.units) {
			delete unit.bonus;
		}
		formation.type = newValue;
	}

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

<Dialog bind:open title={`Edit ${formation?.name}`}>
	{#snippet description()}
		<span class="edit-formation-description">
			Vehicle formations should have matched pairs of combat vehicles, but that is not currently validated. All requirements appear to be validating correctly, but there are
			possibly still bugs.
		</span>
	{/snippet}
	<div class="edit-formation-body">
		<label>Formation Name: <input class="edit-formation-name-input" type="text" name="formation-name" id="formation-id" bind:value={formation.name} /></label>
		<div class="formation">
			<div class="formation-selection-row">
				<div class="edit-formation-option-select-row">
					<p>Formation Type:</p>
					<div class="select-formation-type-wrapper"><Select bind:value={getPrimaryValue, setPrimaryValue} type="single" groupedItems={formationTypeList}></Select></div>
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
				{#each formationDetails?.bonuses ?? [] as bonus, index}
					<div class="formation-bonus-row">
						{#if bonus.type == "Unique"}
							<p class="muted bonus-description">{bonus.description}</p>
						{:else if bonus.type == "FormationWide"}
							<p class="muted">{bonus.grantedAbility?.join("/")}</p>
							<p class="muted">{bonus.uses ? `x${calculateBonusAmount(formation.units.length, bonus.uses)}` : "-"} (Formation-wide)</p>
							{#if bonus.grantedAbility.length > 1}
								<Select
									type="single"
									placeholder="Select Bonus"
									items={bonus.grantedAbility.map((ability) => {
										return { value: ability, label: ability };
									})}
									value={formation.fwBonus?.find((savedBonus) => savedBonus.ind == index)?.abil}
									onValueChange={(value: string) => {
										if (formation.fwBonus) {
											const existingBonus = formation.fwBonus.find((savedBonus) => savedBonus.ind == index);
											if (existingBonus) {
												existingBonus.abil = value;
											} else {
												formation.fwBonus.push({ ind: index, abil: value });
											}
										} else {
											formation.fwBonus = [{ ind: index, abil: value }];
										}
									}}
								></Select>
							{/if}
						{:else if bonus.type == "Assigned"}
							<p class="muted">{bonus.grantedAbility?.join("/")}</p>
							<p class="muted">{bonus.assignedNumber ? `x${calculateBonusAmount(formation.units.length, bonus.assignedNumber)}` : "-"}</p>
							<AssignFormationBonusModal {bonus} {index} bind:formation {list}></AssignFormationBonusModal>
						{/if}
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
					{#each secondaryDetails?.bonuses ?? [] as bonus, index}
						<div class="formation-bonus-row">
							{#if bonus.type == "Unique"}
								<p class="muted bonus-description">{bonus.description}</p>
							{:else if bonus.type == "FormationWide"}
								<p class="muted">{bonus.grantedAbility?.join("/")}</p>
								<p class="muted">{bonus.uses ? `x${calculateBonusAmount(formation.units.length, bonus.uses)}` : "-"} (Formation-wide)</p>
								{#if bonus.grantedAbility.length > 1}
									<Select
										type="single"
										placeholder="Select Bonus"
										items={bonus.grantedAbility.map((ability) => {
											return { value: ability, label: ability };
										})}
										value={formation.secondary?.fwBonus?.find((savedBonus) => savedBonus.ind == index)?.abil}
										onValueChange={(value: string) => {
											if (formation.secondary?.fwBonus) {
												const existingBonus = formation.secondary?.fwBonus.find((savedBonus) => savedBonus.ind == index);
												if (existingBonus) {
													existingBonus.abil = value;
												} else {
													formation.secondary?.fwBonus.push({ ind: index, abil: value });
												}
											} else {
												formation.secondary!.fwBonus = [{ ind: index, abil: value }];
											}
										}}
									></Select>
								{/if}
							{/if}
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
		color: var(--surface-color-light-text-color);
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
		display: grid;
		grid-template-columns: max-content max-content max-content 1fr;
		gap: 4px;
		border: 1px solid var(--border);
		margin: 0px 8px;
	}
	.formation-bonus-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 4;
		column-gap: 14px;
		border-bottom: 1px solid var(--border);
		padding: 4px 8px;
	}
	.formation-bonus-row:hover {
		background-color: var(--surface-color-light);
	}
	input {
		background-color: var(--surface-color-light);
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
	.bonus-description {
		max-width: 90dvw;
	}
</style>
