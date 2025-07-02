<script lang="ts">
	import { Dialog } from "$lib/components/global/";
	import type { MulUnit } from "$lib/types/list.svelte";
	import type { LogRound, PlayUnit } from "$lib/types/playmode";

	type Props = {
		unit: PlayUnit;
		open: boolean;
		reference: MulUnit;
		currentRoundLog: LogRound;
	};

	let { unit, open = $bindable(false), reference, currentRoundLog }: Props = $props();
	let damageToTake = $state(0);

	function modifyDamage(amount: number) {
		damageToTake += amount;
		if (damageToTake < 0) {
			damageToTake = 0;
		}
	}

	function applyDamage() {
		unit.current.damage += damageToTake;
		currentRoundLog.logs.push({ unitId: unit.id, unitName: reference.name, damageTaken: damageToTake, applied: true, undone: false });
		damageToTake = 0;
		open = false;
	}

	function pendDamage() {
		unit.pending.damage += damageToTake;
		currentRoundLog.logs.push({ unitId: unit.id, unitName: reference.name, damageTaken: damageToTake, applied: false, undone: false });
		damageToTake = 0;
		open = false;
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
</style>
