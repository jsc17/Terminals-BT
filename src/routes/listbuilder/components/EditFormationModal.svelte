<script lang="ts">
	import { getContext } from "svelte";
	import { getFormationTypeByName, type FormationType, type FormationV2 } from "../types/formation";
	import type { List } from "../types/list.svelte";
	import Select from "$lib/components/Generic/Select.svelte";
	import formationTypes from "$lib/data/formationTypes.json" assert { type: "json" };
	import Dialog from "$lib/components/Generic/Dialog.svelte";

	type Props = {
		formation: FormationV2;
		open: boolean;
	};

	let { formation, open = $bindable(false) }: Props = $props();

	let list: List = getContext("list");

	let formationTypeList: { groupLabel: string; items: { value: string; label: string }[] }[] = formationTypes.map((group) => {
		return {
			groupLabel: group.type,
			items: group.formations.map((formation: FormationType) => {
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
		formationTypes.flatMap((group) => {
			return group.formations
				.filter((formation: FormationType) => {
					return formation.secondary;
				})
				.map((secondary: FormationType) => {
					return { value: secondary.name, label: secondary.name };
				});
		})
	);

	let formationDetails = $derived(getFormationTypeByName(formation.type));
	let secondaryDetails = $derived.by(() => {
		if (secondaryValue == "None") {
			return undefined;
		} else {
			return getFormationTypeByName(secondaryValue);
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
	<span class="edit-formation-description"> Most formations require 3 units minimum. Many formations will have additional requirements that are listed below. </span>
{/snippet}

<Dialog bind:open title={`Edit ${formation?.name}`} {description}>
	<div class="edit-formation-body">
		<label>Formation Name: <input class="edit-formation-name-input" type="text" name="formation-name" id="formation-id" bind:value={formation.name} /></label>
		<div class="edit-formation-options-container">
			<div class="edit-formation-option-wrapper">
				<div class="edit-formation-option-select-row">
					<p>Formation Type:</p>
					<div class="select-formation-type-wrapper"><Select bind:value={formation.type} type="single" groupedItems={formationTypeList}></Select></div>
				</div>
				<div class="edit-formation-option-details">
					{#if formationDetails?.ideal}
						<p>•</p>
						<p>{`Ideal Role - ${formationDetails.ideal}`}</p>
					{/if}
					{#if formationDetails?.requirements}
						{#each formationDetails.requirements as requirement}
							<p>•</p>
							<p>{requirement}</p>
						{/each}
					{/if}
					{#if formationDetails?.secondary}
						<p>•</p>
						<p class="error">
							I'm not your mother and you can organize your units how you like, but I recommend making this formation as a secondary on the formation they are attached to.
						</p>
					{/if}
				</div>
			</div>
			<div class="edit-formation-option-wrapper">
				<div class="edit-formation-option-select-row">
					<p>Secondary:</p>
					<div class="select-formation-type-wrapper"><Select bind:value={getSecondaryValue, setSecondaryValue} type="single" items={secondaryFormationList}></Select></div>
				</div>
				<div class="edit-formation-option-details">
					{#if !secondaryDetails}
						<p>•</p>
						<p>{`Optionally select an attached secondary formation`}</p>
					{:else if secondaryDetails.requirements}
						{#each secondaryDetails.requirements as requirement}
							<p>•</p>
							<p>{requirement}</p>
						{/each}
					{/if}
				</div>
			</div>
		</div>
		<div>Formation bonus details and formation validation coming soonish</div>
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
	.edit-formation-options-container {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 4px;
		width: 100%;
	}
	.edit-formation-option-wrapper {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
	}
	.select-formation-type-wrapper {
		width: clamp(5em, 100%, 12em);
	}
	.edit-formation-option-select-row {
		display: flex;
		gap: 8px;
		align-items: center;
		padding: 4px;
		border-bottom: 1px solid var(--border);

		p {
			font-size: 0.95em;
		}
	}
	.edit-formation-option-details {
		display: grid;
		grid-template-columns: min-content 1fr;
		gap: 4px 8px;
		padding: 4px;

		p {
			color: var(--muted-foreground);
			font-size: 0.95em;
		}
		p.error {
			color: lightcoral;
		}
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
</style>
