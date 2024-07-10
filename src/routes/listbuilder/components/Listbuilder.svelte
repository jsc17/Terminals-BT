<script lang="ts">
	import { PrintModal, SaveModal, LoadModal, SublistModal, UnitCard } from "./index";
	import { ruleSets } from "$lib/types/options";
	import { flip } from "svelte/animate";
	import { dndzone, type DndEvent, dragHandle, dragHandleZone } from "svelte-dnd-action";
	import { type Unit, isUnit } from "$lib/types/unit";
	import { dragType, isFormation, type Formation } from "$lib/types/formation.svelte";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import FormationCard from "./FormationCard.svelte";
	import Menu from "$lib/components/Menu.svelte";
	import { getContext } from "svelte";
	import type { ResultList } from "$lib/types/resultList.svelte";
	import type { UnitList } from "$lib/types/list.svelte";

	const resultList: ResultList = getContext("resultList");

	let list: UnitList = getContext("list");

	let { recentChanges, description }: { recentChanges: string[]; description: string[] } = $props();
	let showPrintModal = $state(false);
	let showSaveModal = $state(false);
	let showLoadModal = $state(false);
	let showSublistModal = $state(false);
	let selectedRules = $state("noRes");

	$effect(() => {
		selectedRules = list.options.name;
	});

	let errorDialog = $state<HTMLDialogElement>();

	let dropTargetStyle = { outline: "none" };

	let flipDurationMs = 100;

	function handleConsider(e: CustomEvent<DndEvent<Unit | Formation>>) {
		for (const item of list.items) {
			if (e.detail.info.id == item.id?.toString()) {
				if (isFormation(item)) {
					dragType.type = "unit";
				}
			}
		}
		list.items = e.detail.items;
	}

	function handleFinalize(e: CustomEvent<DndEvent<Unit | Formation>>) {
		list.items = e.detail.items;
		dragType.type = "all";
	}
</script>

<div class="card listbuilder">
	<div class="list-header">
		<div class="list-info">
			<input id="listName" type="text" placeholder="List name" bind:value={list.details.name} />
			<div class="inline">
				<label for="rules">Rules:</label>
				<select
					bind:value={selectedRules}
					onchange={() => {
						resultList.setOptions(selectedRules ?? "noRes");
						list.setOptions(selectedRules ?? "noRes");
					}}
				>
					{#each ruleSets as rules}
						<option value={rules.name}>{rules.display}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="list-info">
			<div class="list-stats">
				{#if list.options?.maxPv}
					<p class:errors={list.pv > list.options.maxPv}>PV: {list.pv}/{list.options.maxPv}</p>
				{:else}
					<p>PV: {list.pv}</p>
				{/if}

				{#if list.options?.maxUnits}
					<p class:errors={list.unitCount > list.options.maxUnits}>Units: {list.unitCount}/{list.options.maxUnits}</p>
				{:else}
					<p>Units: {list.unitCount}</p>
				{/if}
			</div>
			{#if list.issues.issueList.size}
				<button class="error-button" onclick={() => errorDialog?.showModal()}><img src="/icons/alert-outline.svg" alt="Error" class="error-icon" /> Show issues</button>
				<dialog bind:this={errorDialog} class="error-dialog">
					<div class="error-dialog-header">
						<p>{list.options.name} rules issues</p>
						<button
							onclick={() => {
								errorDialog?.close();
							}}>Close</button
						>
					</div>
					<div class="error-dialog-body">
						{#each list.issues.issueList as [issue, units]}
							<div class="errors align-right">{issue}:</div>
							<div>{Array.from(units).join(", ")}</div>
						{/each}
					</div>
				</dialog>
			{/if}
			<div class="list-buttons">
				<Menu text={"+"}>
					<button
						class="menu-button"
						onclick={() => {
							list.addFormation("ground");
						}}>Add Ground Formation</button
					>
					<button
						class="menu-button"
						onclick={() => {
							list.addFormation("air");
						}}>Add Air Formation</button
					>
					<hr />
					<div>More features coming soon</div></Menu
				>
				<Menu img={"/icons/menu.svg"}>
					<button
						class="menu-button"
						onclick={() => {
							showLoadModal = true;
						}}
					>
						Load / Import List
					</button>
					<button
						class="menu-button"
						onclick={() => {
							showSaveModal = true;
						}}
					>
						Save / Export List
					</button>
					<button
						class="menu-button"
						onclick={() => {
							showPrintModal = true;
						}}
					>
						Print List
					</button>
					<button
						class="menu-button"
						onclick={() => {
							showSublistModal = true;
						}}
					>
						Generate Sublists
					</button>
					<button
						class="menu-button"
						onclick={() => {
							if (confirm("Remove all units and formations from the list?")) {
								list.items = [];
							}
						}}
					>
						Clear List
					</button>
				</Menu>
			</div>
		</div>
	</div>
	<div class="list-units">
		{#if list.items.length == 0}
			<div class="info">
				<div>
					<h1 style:color="var(--primary)">Latest:</h1>
					<ul>
						{#each recentChanges as change}
							<li>{change}</li>
						{/each}
						<li>Check the <a href="/changelog" target="_blank">changelog</a> for a complete list of recent changes</li>
					</ul>
					{#each description as line}
						<p>{line}</p>
						<br />
					{/each}
				</div>
				<p>Mechwarrior, BattleMech, 'Mech and Aerotech are registered trademarks of The Topps Company, Inc. All Rights Reserved.</p>
			</div>
		{:else if appWindow.isMobile}
			<div class="unit-cards" use:dragHandleZone={{ items: list.items, dropTargetStyle, flipDurationMs, type: "all" }} onconsider={handleConsider} onfinalize={handleFinalize}>
				{#each list.items as unit (unit.id)}
					<div animate:flip={{ duration: flipDurationMs }} class="mobile-card">
						{#if isUnit(unit)}
							<div use:dragHandle aria-label="drag handle for {unit.name}" class="handle">
								<img class="move-arrow" src="/icons/chevron-up.svg" width="15px" alt="move up" />
								<img class="move-arrow" src="/icons/chevron-down.svg" width="15px" alt="move down" />
							</div>
							<UnitCard {unit}></UnitCard>
						{:else}
							<FormationCard {unit}></FormationCard>
						{/if}
					</div>
				{/each}
			</div>
		{:else}
			<div
				class="unit-cards"
				use:dndzone={{ items: list.items, dropTargetStyle, flipDurationMs, type: "all", centreDraggedOnCursor: true }}
				onconsider={handleConsider}
				onfinalize={handleFinalize}
			>
				{#each list.items as unit (unit.id)}
					<div animate:flip={{ duration: flipDurationMs }}>
						{#if isUnit(unit)}
							<UnitCard {unit}></UnitCard>
						{:else}
							<FormationCard {unit}></FormationCard>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<PrintModal bind:showPrintModal></PrintModal>
<SaveModal bind:showSaveModal></SaveModal>
<LoadModal bind:showLoadModal></LoadModal>
<SublistModal bind:showSublistModal></SublistModal>

<style>
	.listbuilder {
		position: sticky;
		width: 100%;
		max-height: 98dvh;
		top: 35px;
		overflow-y: auto;
		z-index: 1;
		display: flex;
		flex-direction: column;
	}
	.list-header {
		display: flex;
		flex-direction: column;
		border-bottom: 1px solid var(--border);
		padding-bottom: 4px;
		gap: 8px;
	}
	.list-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: max-content;
	}
	.list-buttons {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.list-stats {
		display: flex;
		gap: 16px;
	}
	.list-units {
		flex: 1;
	}
	.info {
		padding: 16px;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		height: 100%;
		gap: 48px;
	}
	.unit-cards {
		display: flex;
		flex-direction: column;
		min-height: 100%;
		gap: 4px;
	}
	input[type="text"] {
		width: min(250px, 50%);
	}
	.errors {
		color: var(--error);
	}
	.menu-button {
		background-color: transparent;
		color: var(--primary);
	}
	.mobile-card {
		display: flex;
		height: 100%;
	}
	.handle {
		width: 25px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 4px;
	}
	.move-arrow {
		filter: var(--primary-filter);
	}
	.error-icon {
		width: 20px;
		height: 20px;
		filter: var(--error-filter);
	}
	.error-dialog {
		padding: 16px;
	}
	.error-dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
	}
	.error-dialog-body {
		padding: 20px;
		display: grid;
		grid-template-columns: max-content auto;
		padding: 16px;
		color: var(--error);
		gap: 8px;
	}
	.error-button {
		display: flex;
		align-items: center;
		background-color: transparent;
		color: var(--primary);
		gap: 4px;
	}
</style>
