<script lang="ts">
	import { Dialog, Slider, Switch } from "$lib/generic";
	import type { MulUnit } from "$lib/types/list.svelte";
	import { Tabs } from "bits-ui";
	import type { PlayUnitData } from "../../../types/types";
	import { removeDamage, takeDamage } from "../../remote/matchUnitUpdates.remote";
	import { getContext } from "svelte";

	type Props = {
		unit: PlayUnitData;
		open: boolean;
		reference: MulUnit;
	};

	let { unit, open = $bindable(false), reference }: Props = $props();
	const matchId: number = getContext("matchId");

	let damageToTake = $state(0);
	let takePending = $state(true);
	let damageToRemove = $state(0);
	let removePending = $derived(unit.pending.damage != 0);

	function applyDamage() {
		takeDamage({ matchId, unitId: unit.id, damage: damageToTake, pending: takePending });
		damageToTake = 0;
		takePending = true;
		open = false;
	}
	function healDamage() {
		if (confirm(`Remove ${damageToRemove} ${removePending ? "pending" : "applied"} damage from this unit?`)) {
			removeDamage({ matchId, unitId: unit.id, damage: damageToRemove, pending: removePending });
			damageToRemove = 0;
			open = false;
		}
	}
</script>

<Dialog bind:open title={`Damage ${reference.name}`}>
	<Tabs.Root value="add">
		<Tabs.List class="matchUnitTabs">
			<Tabs.Trigger class="matchUnitTrigger" value="add">Add Damage</Tabs.Trigger>
			<Tabs.Trigger class="matchUnitTrigger" value="remove">Remove Damage</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="add">
			<div class="damage-modal-body">
				<div class="input-row">
					<button class="damage-amount-button" onclick={() => (damageToTake -= 5)}>-5</button>
					<button class="damage-amount-button" onclick={() => (damageToTake -= 1)}>-1</button>
					<input type="number" class="damage-amount" bind:value={damageToTake} min={0} max={16} />
					<button class="damage-amount-button" onclick={() => (damageToTake += 1)}>+1</button>
					<button class="damage-amount-button" onclick={() => (damageToTake += 5)}>+5</button>
				</div>
				<div class="apply-buttons">
					<Switch bind:checked={takePending} height={25}>
						{#snippet leftValue()}
							<p class={{ "switch-activated": takePending }}>Immediately</p>
						{/snippet}
						{#snippet rightValue()}
							<p class={{ "switch-activated": !takePending }}>End of Round</p>
						{/snippet}
					</Switch>
					<button onclick={applyDamage}>Apply Damage</button>
				</div>
			</div>
		</Tabs.Content>
		<Tabs.Content value="remove">
			<div class="damage-modal-body">
				<Switch bind:checked={removePending} height={25}>
					{#snippet leftValue()}
						<p class={{ "switch-activated": takePending }}>Applied</p>
					{/snippet}
					{#snippet rightValue()}
						<p class={{ "switch-activated": !takePending }}>Pending</p>
					{/snippet}
				</Switch>

				<div class="removal-wrapper">
					<p>Current Damage ({removePending ? "Pending" : "Applied"}):</p>
					<p>{removePending ? unit.pending.damage : unit.current.damage}</p>
					<p>Damage to remove:</p>
					<input type="number" bind:value={damageToRemove} min={0} max={removePending ? unit.pending.damage : unit.current.damage} />
				</div>
				<div class="slider-wrapper">
					<Slider bind:value={damageToRemove} type="single" min={0} max={removePending ? unit.pending.damage : unit.current.damage} step={1} position="bottom" />
				</div>

				<div class="apply-buttons">
					<div></div>
					<button onclick={healDamage}>Remove Damage</button>
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</Dialog>

<style>
	.damage-modal-body {
		margin-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 400px;
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
		width: 75px;
	}
	.damage-amount-button {
		font-size: 30px;
	}
	.apply-buttons {
		margin-top: 16px;
		display: flex;
		justify-content: space-evenly;
		align-items: center;
		gap: 24px;

		button {
			padding: 8px;
			font-size: 18px;
		}
	}
	.slider-wrapper {
		width: 95%;
		align-self: center;
		margin-bottom: 20px;
	}
	.switch-activated {
		color: var(--surface-color-light-text-color);
	}
	.removal-wrapper {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 8px 12px;
	}
	.removal-wrapper p:nth-child(odd) {
		text-align: end;
	}
</style>
