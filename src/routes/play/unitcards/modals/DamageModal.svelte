<script lang="ts">
	import { Dialog } from "$lib/components/Generic";
	import type { PlayUnit } from "$lib/types/unit";

	type Props = {
		unit: PlayUnit;
		open: boolean;
	};

	let { unit, open = $bindable(false) }: Props = $props();

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

	function undoDamage() {
		const confirmUndo = confirm(`Are you sure you wish to remove ${damageToTake} damage from this unit?`);
		if (confirmUndo) {
			unit.current.damage -= damageToTake;
			if (unit.current.damage < 0) {
				unit.current.damage = 0;
			}
			damageToTake = 0;
			open = false;
		}
	}
</script>

<Dialog bind:open title={`Damage ${unit.baseUnit.name}`}>
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
				<button disabled>Apply At End of Round <br /> (not implemented yet)</button>
			</div>
		</div>
		<div class="remove-button-row">
			<button class="remove-button" onclick={undoDamage}>Undo damage</button>
		</div>
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
	.remove-button-row {
		display: flex;
		width: 100%;
		justify-content: end;
	}
	.remove-button {
		background-color: var(--error);
	}
</style>
