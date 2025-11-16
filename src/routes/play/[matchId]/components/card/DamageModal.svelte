<script lang="ts">
	import { Dialog } from "$lib/generic";
	import type { MulUnit } from "$lib/types/list.svelte";
	import type { LogRound, PlayUnit } from "../../../types/types";

	type Props = {
		unit: PlayUnit;
		open: boolean;
		reference: MulUnit;
	};

	let { unit, open = $bindable(false), reference }: Props = $props();
	let damageToTake = $state(0);

	function modifyDamage(amount: number) {
		damageToTake += amount;
		if (damageToTake < 0) {
			damageToTake = 0;
		}
	}

	function applyDamage() {
		unit.current.damage += damageToTake;
		damageToTake = 0;
		open = false;
	}

	function pendDamage() {
		unit.pending.damage += damageToTake;
		damageToTake = 0;
		open = false;
	}

	function removeDamage() {
		if (confirm(`Remove ${damageToTake} damage from this unit? \n (Removes pending damage before applied damage. Disables undoing damage from the log)`)) {
			let damageRemaining = Math.max(damageToTake - unit.pending.damage, 0);
			unit.pending.damage = Math.max(unit.pending.damage - damageToTake, 0);
			unit.current.damage = Math.max(unit.current.damage - damageRemaining, 0);
			damageToTake = 0;
			open = false;
		}
	}
</script>

<Dialog bind:open title={`Damage ${reference.name}`}>
	<div class="damage-modal-body">
		<div class="input-row">
			<button
				class="damage-amount-button"
				onclick={() => {
					modifyDamage(-5);
				}}>-5</button
			>
			<button
				class="damage-amount-button"
				onclick={() => {
					modifyDamage(-1);
				}}>-1</button
			>
			<p class="damage-amount">{damageToTake}</p>
			<button
				class="damage-amount-button"
				onclick={() => {
					modifyDamage(1);
				}}
			>
				+1</button
			>
			<button
				class="damage-amount-button"
				onclick={() => {
					modifyDamage(5);
				}}>+5</button
			>
		</div>
		<div class="apply-buttons">
			<button onclick={applyDamage}>Apply Now</button>
			<div class="temp-div">
				<button onclick={pendDamage}>Apply At End of Round</button>
			</div>
		</div>
		<button class="remove-button" onclick={removeDamage}>Remove Damage</button>
	</div>
</Dialog>

<style>
	.damage-modal-body {
		margin-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.input-row {
		display: flex;
		gap: 18px;
		width: 100%;
		justify-content: center;
	}
	.damage-amount {
		font-size: 36px;
		margin: 0px 6px;
	}
	.damage-amount-button {
		font-size: 30px;
	}
	.apply-buttons {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 24px;

		button {
			padding: 8px;
			font-size: 18px;
		}
	}
	.remove-button {
		margin-top: 8px;
		background-color: lightcoral;
		align-self: end;
	}
</style>
