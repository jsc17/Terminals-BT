<script lang="ts">
	import { Dialog } from "$lib/components/Generic";
	import type { PlayUnit } from "$lib/types/unit";

	type Props = {
		unit: PlayUnit;
		open: boolean;
	};

	let { unit, open = $bindable(false) }: Props = $props();
	6;
	let currentCritSelection = $state<number>();
	let destroyedString = $derived.by(() => {
		if (["BM", "IM"].includes(unit.baseUnit.subtype)) {
			return "Ammo Hit / Destroyed";
		} else if (["CV", "SV"].includes(unit.baseUnit.subtype)) {
			return "Ammo Hit / Crew Killed";
		} else if (unit.baseUnit.subtype == "PM") {
			return "Unit Destroyed";
		} else {
			return `${unit.baseUnit.subtype} not found`;
		}
	});
	let critKeys = $derived([
		{ key: "engine", label: "Engine Hit" },
		{ key: "fireControl", label: "Fire Control" },
		{ key: "mp", label: "MP Hit" },
		{ key: "weapon", label: "Weapon Hit" },
		{ key: "destroyed", label: destroyedString }
	]);

	function applyCrit() {
		if (currentCritSelection != undefined) {
			if (currentCritSelection == 4) {
				unit.current.crits.destroyed = true;
			} else {
				const key = critKeys[currentCritSelection].key;
				unit.current.crits[key] += 1;
			}
			open = false;
		}
	}
</script>

<Dialog bind:open title={`Critical Hit ${unit.baseUnit.name}`}>
	<div class="crit-modal-body">
		<div class="crit-button-list">
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
			<button
				class="crit-button"
				onclick={() => {
					currentCritSelection = 2;
				}}>MP Hit</button
			>
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
		</div>
		<p class="crit-choice">
			<span class="muted">Critical to apply:</span>
			{currentCritSelection !== undefined ? critKeys[currentCritSelection].label : "Choose a critical above"}
		</p>
		<div class="apply-buttons">
			<button onclick={applyCrit}>Apply Now</button>
			<div class="temp-div">
				<button disabled>Apply At End of Round <br /> (not implemented yet)</button>
			</div>
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
</style>
