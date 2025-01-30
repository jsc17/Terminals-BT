<script lang="ts">
	import { PrintModal, SaveModal, LoadModal, SublistModal, UnitCard } from "./index";
	import { ruleSets } from "$lib/types/options";
	import { flip } from "svelte/animate";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import FormationCard from "./FormationCard.svelte";
	import Menu from "$lib/components/Menu.svelte";
	import { getContext } from "svelte";
	import type { ResultList } from "$lib/types/resultList.svelte";
	import type { List } from "$lib/types/list.svelte";
	import type { FormationV2 } from "$lib/types/formation";
	import { dndzone, type DndEvent } from "svelte-dnd-action";

	const resultList: ResultList = getContext("resultList");
	let list: List = getContext("list");

	let { recentChanges, description }: { recentChanges: string[]; description: string[] } = $props();
	let showPrintModal = $state(false);
	let showSaveModal = $state(false);
	let showLoadModal = $state(false);
	let showSublistModal = $state(false);
	let selectedRules = $state("noRes");

	$effect(() => {
		selectedRules = list.rules;
	});

	let errorDialog = $state<HTMLDialogElement>();

	let dropTargetStyle = { outline: "solid var(--primary)" };

	let flipDurationMs = 100;

	function handleConsider(e: CustomEvent<DndEvent<FormationV2>>) {
		list.items = e.detail.items;
	}

	function handleFinalize(e: CustomEvent<DndEvent<FormationV2>>) {
		list.items = e.detail.items;
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
				<!-- {#if list.rules?.maxPv}
					<p class:errors={list.pv > list.options.maxPv}>PV: {list.pv}/{list.options.maxPv}</p>
				{:else} -->
				<p>PV: {list.pv}</p>
				<!-- {/if} -->

				<!-- {#if list.options?.maxUnits}
					<p class:errors={list.unitCount > list.options.maxUnits}>Units: {list.unitCount}/{list.options.maxUnits}</p>
				{:else} -->
				<p>Units: {list.unitCount}</p>
				<!-- {/if} -->
			</div>
			<!-- {#if list.issues.issueList.size}
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
			{/if} -->
			<div class="list-buttons">
				<Menu text={"+"}>
					<button
						class="menu-button"
						onclick={() => {
							list.newFormation("ground");
						}}>Add Ground Formation</button
					>
					<button
						class="menu-button"
						onclick={() => {
							list.newFormation("air");
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
								list.clear();
							}
						}}
					>
						Clear List
					</button>
				</Menu>
			</div>
		</div>
	</div>
	{#if list.unitCount == 0 && list.formations.length == 1}
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
	{:else}
		<div class="list-units">
			{#each list.formations as formation (formation.id)}
				<FormationCard {formation}></FormationCard>
			{/each}
			<!-- 			use:dndzone={{ items: list.formations, dropTargetStyle, flipDurationMs, type: "formations", centreDraggedOnCursor: !appWindow.isMobile }}
			onconsider={handleConsider}
			onfinalize={handleFinalize} -->

			<!-- {#each list.items as unit (unit.id)}
				<div class={{ mobileCard: appWindow.isMobile }} animate:flip={{ duration: flipDurationMs }}>
					{#if isUnit(unit)}
						{#if appWindow.isMobile}
							<div use:dragHandle aria-label="drag handle for {unit.name}" class="handle">
								<img class="move-arrow" src="/icons/chevron-up.svg" width="15px" alt="move up" />
								<img class="move-arrow" src="/icons/chevron-down.svg" width="15px" alt="move down" />
							</div>
						{/if}
						<UnitCard {unit}></UnitCard>
					{:else}
						<FormationCard {unit}></FormationCard>
					{/if}
				</div>
			{/each} -->
		</div>
	{/if}
</div>

<!-- <PrintModal bind:showPrintModal></PrintModal> -->
<!-- <SaveModal bind:showSaveModal></SaveModal -->
<!-- <LoadModal bind:showLoadModal></LoadModal> -->
<!-- <SublistModal bind:showSublistModal></SublistModal> -->

<style>
	.listbuilder {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: auto;
		z-index: 1;
		scrollbar-gutter: stable;
	}
	.list-header {
		display: flex;
		flex-direction: column;
		border-bottom: 1px solid var(--border);
		padding-bottom: 4px;
		gap: 8px;
	}
	.list-units {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 4px 0px 16px 0px;
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
	.info {
		padding: 16px;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		height: 100%;
		gap: 48px;
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
	.mobileCard {
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
	:global(.drop-target-zone) {
		outline: solid green;
	}
</style>
