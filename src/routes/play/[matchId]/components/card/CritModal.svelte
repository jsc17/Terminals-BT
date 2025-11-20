<script lang="ts">
	import { Dialog } from "$lib/generic";
	import type { MulUnit } from "$lib/types/listTypes";
	import { nanoid } from "nanoid";
	import type { PlayUnit } from "../../../types/types";
	import { criticalLists } from "../../utilities/criticalList";
	import { Tabs } from "bits-ui";
	import { takeCritical, removeCritical } from "../../../remote/matchUpdates.remote";
	import { getContext } from "svelte";

	type Props = {
		unit: PlayUnit;
		reference: MulUnit;
		open: boolean;
	};

	let { unit, open = $bindable(false), reference }: Props = $props();

	const matchId: number = getContext("matchId");

	let selectedCritical = $state<number>(-1);
	let criticalType = $derived(
		criticalLists.get(reference.subtype)?.crits.find((c) => c.id == selectedCritical) ?? criticalLists.get(reference.subtype)?.motive?.find((m) => m.id == selectedCritical)
	);

	function applyCrit(pending: boolean) {
		if (!criticalType) return;

		takeCritical({ matchId, unitId: unit.id, type: criticalType.value, pending, rounds: criticalType.value == "crewstunned" ? 1 : undefined });

		selectedCritical = -1;
		open = false;
	}
	function undoCrit(criticalId: number) {
		if (
			confirm(
				"Removing a critical can't be undone. Critical order can also matter, and there is currently no way to add a critical back into the middle of the list. Are you sure you wish to remove it? "
			)
		)
			removeCritical({ matchId, critId: criticalId });
	}
</script>

<Dialog bind:open title={`Critical Hit ${reference.name}`}>
	<Tabs.Root value="add">
		<Tabs.List class="matchUnitTabs">
			<Tabs.Trigger class="matchUnitTrigger" value="add">Add Critical</Tabs.Trigger>
			<Tabs.Trigger class="matchUnitTrigger" value="remove">Remove Criticals</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="add">
			<div class="crit-modal-body">
				{#if criticalLists.get(reference.subtype)?.crits}
					<fieldset class="crit-button-list">
						<legend>Critical Hits</legend>
						{#each criticalLists.get(reference.subtype)?.crits as critical, index}
							<label class="critical-range" for={`critical${index}`}>{critical.range}</label>
							<input class="critical-radio" type="radio" id={`critical${index}`} value={critical.id} bind:group={selectedCritical} />
							<label class="critical-label" for={`critical${index}`}>{critical.label}</label>
						{/each}
					</fieldset>
				{:else}
					<p>Unknown unit type, you shouldn't have been able to get here.</p>
				{/if}
				{#if criticalLists.get(reference.subtype)?.motive}
					<fieldset class="crit-button-list">
						<legend>Motive Hits</legend>
						{#each criticalLists.get(reference.subtype)?.motive as motive, index}
							<label class="critical-range" for={`motive${index}`}>{motive.range}</label>
							<input class="critical-radio" type="radio" id={`motive${index}`} value={motive.id} bind:group={selectedCritical} />
							<label class="critical-label" for={`motive${index}`}>{motive.label}</label>
						{/each}
					</fieldset>
				{/if}
				<div class="apply-buttons">
					<button onclick={() => applyCrit(false)} disabled={criticalType?.value == "none"}>Apply Now</button>
					<div class="temp-div">
						<button onclick={() => applyCrit(true)} disabled={criticalType?.value == "none"}>Apply At End of Round</button>
					</div>
				</div>
			</div>
		</Tabs.Content>
		<Tabs.Content value="remove">
			<div class="crit-modal-body">
				<div class="current-critical-list">
					{#if unit.current.crits.length}
						<div class="current-critical-row">
							<p class="bold">Round Taken</p>
							<p class="bold">Critical Hit</p>
						</div>

						{#each unit.current.crits as critical}
							{@const label =
								criticalLists.get(reference.subtype)?.crits.find((c) => c.value == critical.type) ??
								criticalLists.get(reference.subtype)?.motive?.find((m) => m.value == critical.type)}
							<div class="current-critical-row">
								<p class="center">{critical.round}</p>
								<p>{label?.label ?? critical.type}</p>
								<button class="remove-button" onclick={() => undoCrit(critical.id)}>Remove</button>
							</div>
						{/each}
					{:else}
						<div class="critical-row">
							<p>Unit hasn't suffered any critical hits yet</p>
						</div>
					{/if}
				</div>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</Dialog>

<style>
	:global([data-tabs-list].matchUnitTabs) {
		background-color: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		justify-self: center;
	}
	:global([data-tabs-trigger].matchUnitTrigger) {
		background-color: transparent;
		padding: 8px 24px;
		color: var(--text-color);
	}
	:global([data-tabs-trigger].matchUnitTrigger[data-state="active"]) {
		background-color: var(--button);
		color: var(--button-text-color);
	}
	.crit-modal-body {
		margin-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-height: 40dvh;
	}

	.crit-button-list {
		border: 1px solid var(--border);
		display: grid;
		grid-template-columns: max-content max-content 1fr;
		column-gap: 4px;
	}
	.critical-radio {
		visibility: none;
		height: 0;
		width: 0;
	}
	.critical-radio:checked + label {
		background-color: var(--button);
		color: var(--button-text-color);
	}
	.critical-range,
	.critical-label {
		font-size: 16px;
		font-weight: bold;
		padding: 8px;
	}
	.critical-range {
		justify-self: center;
	}

	.apply-buttons {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 24px;

		& button {
			padding: 8px;
			font-size: 18px;
		}
	}
	.current-critical-list {
		display: grid;
		grid-template-columns: max-content 1fr max-content;
		column-gap: 24px;
		border: 1px solid var(--border);
	}
	.current-critical-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 3;
		border-bottom: 1px solid var(--border);
		padding: 8px 24px;
		width: 100%;
	}
	.remove-button {
		color: black;
		background-color: lightcoral;
		width: max-content;
	}
</style>
