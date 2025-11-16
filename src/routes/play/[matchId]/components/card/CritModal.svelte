<script lang="ts">
	import { Dialog } from "$lib/generic";
	import type { MulUnit } from "$lib/types/listTypes";
	import { nanoid } from "nanoid";
	import type { LogRound, PlayUnit } from "../../../types/types";
	import CritRemovalModal from "./CritRemovalModal.svelte";

	type Props = {
		unit: PlayUnit;
		reference: MulUnit;
		open: boolean;
	};

	let { unit, open = $bindable(false), reference }: Props = $props();

	let currentCritSelection = $state<string>("");

	const availableButtons = $derived.by(() => {
		switch (reference.subtype) {
			case "BM":
			case "IM":
				return { crits: ["Engine", "Fire Control", "MP", "Weapon", "Ammo Hit / Destroyed"] };
			case "CV":
			case "SV":
				return { crits: ["Engine", "Fire Control", "Weapon", "Ammo Hit / Crew Killed"], motive: ["-2 MV", "1/2 MV", "0 MV"] };
			case "PM":
				return { crits: ["Fire Control", "MP", "Weapon", "Unit Destroyed"] };
			case "AF":
			case "CF":
				return { crits: ["Engine", "Fire Control", "Weapon", "Fuel Hit / Crew Killed"] };
			default:
				return { crits: [] };
		}
	});

	function applyCrit() {
		if (currentCritSelection != "") {
			let critType = currentCritSelection;
			if (critType == "Ammo Hit / Destroyed" || critType == "Ammo Hit / Crew Killed" || critType == "Unit Destroyed" || critType == "Fuel Hit / Crew Killed") {
				critType = "destroyed";
			}
			if (critType == "-2 MV") {
				critType = "mhit";
			}
			if (critType == "1/2 MV") {
				critType = "mhalf";
			}
			if (critType == "0 MV") {
				critType = "mimm";
			}
			const critId = nanoid(6);
			const newCrit = { id: critId, type: critType.toLowerCase().replaceAll(" ", "") };
			unit.current.crits.push(newCrit);
			currentCritSelection = "";
			open = false;
		}
	}

	function pendCrit() {
		if (currentCritSelection != "") {
			let critType = currentCritSelection;
			if (critType == "Ammo Hit / Destroyed" || critType == "Ammo Hit / Crew Killed" || critType == "Unit Destroyed" || critType == "Fuel Hit / Crew Killed") {
				critType = "destroyed";
			}
			if (critType == "-2 MV") {
				critType = "mhit";
			}
			if (critType == "1/2 MV") {
				critType = "mhalf";
			}
			if (critType == "0 MV") {
				critType = "mimm";
			}
			const critId = nanoid(6);
			const newCrit = { id: critId, type: critType.toLowerCase().replaceAll(" ", "") };
			unit.pending.crits.push(newCrit);
			currentCritSelection = "";
			open = false;
		}
	}
</script>

{#snippet critButton(value: string)}
	<button
		class={{ "crit-button": true, "selected-button": currentCritSelection == value }}
		onclick={() => {
			currentCritSelection = value;
		}}>{value}</button
	>
{/snippet}

<Dialog bind:open title={`Critical Hit ${reference.name}`}>
	<div class="crit-modal-body">
		{#if availableButtons.crits}
			<fieldset class="crit-button-list">
				<legend>Critical Hits</legend>
				{#each availableButtons?.crits as button}
					{@render critButton(button)}
				{/each}
			</fieldset>
		{:else}
			<p>Unknown unit type, you shouldn't have been able to get here.</p>
		{/if}

		{#if availableButtons.motive}
			<fieldset class="crit-button-list">
				<legend>Motive Hits</legend>
				{#each availableButtons?.motive as button}
					{@render critButton(button)}
				{/each}
			</fieldset>
		{/if}

		<p class="crit-choice">
			<span class="muted">Critical to apply:</span>
			{currentCritSelection !== undefined && currentCritSelection != "" ? currentCritSelection : "Choose a critical above"}
		</p>
		<div class="apply-buttons">
			<button onclick={applyCrit}>Apply Now</button>
			<div class="temp-div">
				<button onclick={pendCrit}>Apply At End of Round</button>
			</div>
		</div>
		<div class="remove-button">
			<CritRemovalModal {unit}></CritRemovalModal>
		</div>
	</div>
</Dialog>

<style>
	.crit-modal-body {
		margin-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.crit-button-list {
		border: 1px solid var(--border);
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}
	.crit-button {
		font-size: 16px;
		font-weight: bold;
		min-width: min(30dvw, 150px);
		max-width: min(45dvw, 300px);
		padding: 8px;
	}
	.apply-buttons {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 24px;
		margin-top: 16px;

		& button {
			padding: 8px;
			font-size: 18px;
		}
	}
	.remove-button {
		background-color: lightcoral;
		align-self: end;
	}
	.selected-button {
		background-color: bisque;
	}
</style>
