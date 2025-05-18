<script lang="ts">
	import { Dialog } from "$lib/components/Generic";
	import type { PlayUnit } from "$lib/types/unit";
	import { watch } from "runed";

	type Props = {
		unit: PlayUnit;
		open: boolean;
	};

	let { unit, open = $bindable(false) }: Props = $props();

	watch(
		() => open,
		() => {
			if (open) {
				currentCritSelection = -1;
				undoSelection = "";
			}
		}
	);

	let currentCritSelection = $state<number>();
	let destroyedString = $derived.by(() => {
		if (["BM", "IM"].includes(unit.baseUnit.subtype)) {
			return "Ammo Hit / Destroyed";
		} else if (["CV", "SV"].includes(unit.baseUnit.subtype)) {
			return "Ammo Hit / Crew Killed";
		} else if (unit.baseUnit.subtype == "PM") {
			return "Unit Destroyed";
		} else if (["AF", "CF"].includes(unit.baseUnit.subtype)) {
			return "Fuel Hit / Crew Killed";
		} else {
			return `${unit.baseUnit.subtype} not found`;
		}
	});
	let critKeys = $derived([
		{ key: "engine", label: "Engine Hit" },
		{ key: "fireControl", label: "Fire Control" },
		{ key: "mp", label: "MP Hit" },
		{ key: "weapon", label: "Weapon Hit" },
		{ key: "destroyed", label: destroyedString },
		{ key: "motiveHit", label: "-2 MV" },
		{ key: "motiveHalf", label: "1/2 MV" },
		{ key: "motiveIm", label: "0 MV" }
	]);

	function applyCrit() {
		if (currentCritSelection != undefined && currentCritSelection >= 0) {
			console.log($state.snapshot(currentCritSelection));
			if (currentCritSelection == 4) {
				unit.current.crits.destroyed = true;
			} else {
				const key = critKeys[currentCritSelection].key;
				unit.current.crits[key] += 1;
			}
			open = false;
		}
	}
	let undoSelection = $state<string>("");
	function undoCrit() {
		if (undoSelection.length) {
			if (undoSelection == "destroyed" || undoSelection == "motiveIm") {
				unit.current.crits[undoSelection] = false;
			} else {
				unit.current.crits[undoSelection] -= 1;
			}
		}
	}
</script>

<Dialog bind:open title={`Critical Hit ${unit.baseUnit.name}`}>
	<div class="crit-modal-body">
		<fieldset class="crit-button-list">
			<legend>Critical Hits</legend>
			{#if unit.baseUnit.subtype != "PM"}
				<button
					class="crit-button"
					onclick={() => {
						currentCritSelection = 0;
					}}>Engine</button
				>
			{/if}
			<button
				class="crit-button"
				onclick={() => {
					currentCritSelection = 1;
				}}>Fire Control</button
			>
			{#if !["CV", "SV", "AF", "CF"].includes(unit.baseUnit.subtype)}
				<button
					class="crit-button"
					onclick={() => {
						currentCritSelection = 2;
					}}>MP Hit</button
				>
			{/if}
			<button
				class="crit-button"
				onclick={() => {
					currentCritSelection = 3;
				}}>Weapon</button
			>
			<button
				class="destroy-crit"
				onclick={() => {
					currentCritSelection = 4;
				}}>{destroyedString}</button
			>
		</fieldset>
		{#if ["CV", "SV"].includes(unit.baseUnit.subtype)}
			<fieldset class="crit-button-list">
				<legend>Motive Hits</legend>
				<button
					class="crit-button"
					onclick={() => {
						currentCritSelection = 5;
					}}>-2 MV</button
				>
				<button
					class="crit-button"
					onclick={() => {
						currentCritSelection = 6;
					}}>1/2 MV</button
				>
				<button
					class="crit-button"
					onclick={() => {
						currentCritSelection = 7;
					}}>0 MV</button
				>
			</fieldset>
		{/if}
		<p class="crit-choice">
			<span class="muted">Critical to apply:</span>
			{currentCritSelection !== undefined && currentCritSelection >= 0 ? critKeys[currentCritSelection].label : "Choose a critical above"}
		</p>
		<div class="apply-buttons">
			<button onclick={applyCrit}>Apply Now</button>
			<div class="temp-div">
				<button disabled>Apply At End of Round <br /> (not implemented yet)</button>
			</div>
		</div>
		<div class="remove-button-row">
			<select bind:value={undoSelection}>
				{#each Object.entries(unit.current.crits) as crit}
					{#if (crit[0] == "destroyed" || crit[0] == "motiveIm") && crit[1]}
						<option value={crit[0]}
							>{critKeys.find(({ key }) => {
								return key == crit[0];
							})?.label}</option
						>
					{:else if crit[1] > 0}
						<option value={crit[0]}
							>{critKeys.find(({ key }) => {
								return key == crit[0];
							})?.label}</option
						>
					{/if}
				{/each}
			</select>
			<button class="remove-button" onclick={undoCrit}>Undo Critical</button>
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
		display: grid;
		grid-template-columns: repeat(auto-fill, min(30dvw, 150px));
		gap: 16px;
	}
	.crit-button {
		font-size: 16px;
		font-weight: bold;
		padding: 8px;
	}
	.destroy-crit {
		font-size: 16px;
		font-weight: bold;
		padding: 4px;
		background-color: var(--error);
	}
	.apply-buttons {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 24px;
		margin-top: 16px;

		button {
			padding: 8px;
			font-size: 18px;
		}
	}
	.remove-button-row {
		display: flex;
		width: 100%;
		justify-content: end;
	}
	.remove-button {
		background-color: var(--error);
	}
</style>
