<script lang="ts">
	import {
		PrintModal,
		SaveModal,
		LoadModal,
		SublistModal,
		UnitCustomizationModal,
		ScaModal,
		FormationCard,
		ListInfoPopover,
		FindUnitAvailabilityModal,
		BattlefieldSupportModal
	} from "./";
	import { type ListFormation, List } from "$lib/types/list.svelte";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { ruleSets } from "$lib/types/rulesets";
	import { sendListToPlay } from "$lib/playmode/playmode";
	import { getContext } from "svelte";
	import { dndzone, dragHandleZone, type DndEvent } from "svelte-dnd-action";
	import { appWindow, toastController } from "$lib/stores";
	import { Dialog } from "$lib/generic";
	import { deserialize } from "$app/forms";
	import { Collapsible, DropdownMenu } from "$lib/generic";
	import { getBSCbyId } from "$lib/data/battlefieldSupport";
	import { dev } from "$app/environment";

	type Props = {
		listCloseCallback: (id: string) => void;
		list: List;
	};

	const resultList: ResultList = getContext("resultList");

	let { listCloseCallback, list = $bindable() }: Props = $props();
	let printModal = $state<PrintModal>();
	let saveModal = $state<SaveModal>();
	let loadModal = $state<LoadModal>();
	let unitCustomizationModal = $state<UnitCustomizationModal>();
	let availabilityModal = $state<FindUnitAvailabilityModal>();
	let battlefieldSupportModal = $state<BattlefieldSupportModal>();

	let scaModalOpen = $state(false);
	let scaListOpen = $state(true);
	let bsListOpen = $state(true);
	let sublistModalOpen = $state(false);

	let dropTargetStyle = { outline: "solid var(--primary)" };
	let flipDurationMs = 100;
	let draggingColumns = $state(false);
	function handleDndConsider(e: CustomEvent<DndEvent<ListFormation>>) {
		draggingColumns = true;
		list.formations = e.detail.items;
	}
	function handleDndFinalize(e: CustomEvent<DndEvent<ListFormation>>) {
		draggingColumns = false;
		list.formations = e.detail.items;
	}
	function transformDraggedElement(draggedEl: HTMLElement | undefined, data: any, index: number | undefined) {
		const unitCardElement: HTMLElement | null | undefined = draggedEl?.querySelector(".unit-cards");
		const dropMessageElement: HTMLElement | null | undefined = draggedEl?.querySelector(".drop-message");
		if (unitCardElement) {
			unitCardElement.innerHTML = "Unit list collapsed while dragging formations";
		}
		dropMessageElement?.remove();
	}

	async function shareList() {
		const formData = new FormData();
		formData.append("list", JSON.stringify(list.getListCode()));
		const id: string = crypto.randomUUID();
		formData.append("id", id);
		let sharedUrl = `https://terminal.tools/listbuilder?share=${id}`;
		if (dev) {
			sharedUrl = `https://localhost:5173/listbuilder?share=${id}`;
		}
		navigator.clipboard.writeText(sharedUrl);

		const response: any = deserialize(await (await fetch("?/shareList", { method: "POST", body: formData })).text());
		if (response.type == "success") {
			toastController.addToast("Shareable list link saved to clipboard");
		} else {
			toastController.addToast("Failed to create shareable link. Please try again");
		}
	}

	async function clearList() {
		if (confirm("Remove all units and formations from the list?")) {
			list.clear();
		}
	}

	async function resetList() {
		if (confirm("Clear all units,formations and faction/era selection, and start a new list?")) {
			resultList.eras = [];
			resultList.factions = [];
			resultList.loadResults();
			list.clear();
			list.details = { name: "New List", eras: [], factions: [], general: -1 };
			list.id = crypto.randomUUID();
			list.rules = "noRes";
		}
	}
</script>

<div class="card listbuilder">
	<div class="list-header">
		<div class="list-info">
			<input id="listName" type="text" placeholder="List name" bind:value={list.details.name} />
			<div class="inline">
				<label for="rules">Rules:</label>
				<select
					bind:value={list.rules}
					onchange={() => {
						resultList.setOptions(list.rules ?? "noRes");
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
				<ListInfoPopover bind:list />
			</div>
			{#if list.issues?.issueList.size}
				<Dialog title="List Rules Issues" triggerClasses="transparent-button">
					{#snippet trigger()}
						<div class="center"><img src="/icons/alert-outline.svg" alt="Error" class="error-icon" /> <span class="primary">Show issues</span></div>
					{/snippet}
					{#snippet description()}
						{#if list.issues.issueMessage}
							<p class="muted">{list.issues.issueMessage}</p>
						{/if}
					{/snippet}
					<div class="error-dialog-body">
						{#each list.issues.issueList as [issue, units]}
							<div class="errors align-right">{issue}:</div>
							<div>{Array.from(units).join(", ")}</div>
						{/each}
					</div>
				</Dialog>
			{/if}
			<div class="list-buttons">
				<DropdownMenu
					items={[
						{ type: "item", label: "Add Formation", onSelect: () => list.addFormation() },
						{ type: "item", label: "Add Special Command Ability", onSelect: () => (scaModalOpen = true) },
						{ type: "item", label: "Add Battlefield Support", onSelect: () => battlefieldSupportModal?.show() }
					]}
				>
					{#snippet trigger()}
						<div class="dropdown-menu-wrapper"><img src="/icons/add.svg" alt="Add Menu Button" /></div>
					{/snippet}
				</DropdownMenu>

				<DropdownMenu
					items={[
						{ type: "item", label: "Load / Import List", onSelect: () => loadModal?.show() },
						{ type: "item", label: "Save / Export List", onSelect: () => saveModal?.show() },
						{ type: "item", label: "Print List", onSelect: () => printModal?.open() },
						{ type: "item", label: "Share List Link", onSelect: () => shareList() },
						{ type: "separator" },
						{ type: "item", label: "Check List Availability", onSelect: () => availabilityModal?.show() },
						{ type: "item", label: "Generate Sublists", onSelect: () => (sublistModalOpen = true) },
						{ type: "item", label: "Play List", onSelect: () => sendListToPlay(list.details.name, list.formations, list.units) },
						{ type: "separator" },
						{ type: "item", label: "Clear Units/Formations", onSelect: () => clearList() },
						{ type: "item", label: "Reset List", onSelect: () => resetList() },
						{ type: "item", label: "Close List", onSelect: () => listCloseCallback(list.id) }
					]}
				>
					{#snippet trigger()}
						<div class="dropdown-menu-wrapper"><img src="/icons/menu.svg" alt="Menu Button" /></div>
					{/snippet}
				</DropdownMenu>
			</div>
		</div>
	</div>
	{#if list.unitCount == 0 && list.formations.length == 1}
		<div class="info">
			<p class="muted">Check the <a href="/changelog" target="_blank">changelog</a> for a list of recent changes</p>
			<p class="muted">
				Terminals 'Tech Tools is a site I have created as a hobby to improve my experience playing Alpha Strike. It is a free, non-commercial fan-site that makes no claim to
				ownership to any properties referenced within.
			</p>
			<p class="muted">
				Publicly available sources, primarily the Master Unit List, were used to create the database that drives the site. If there are any legal issues or questions, please
				contact me for immediate removal.
			</p>
			<p class="muted">
				Account registration is required for some features, primarily sharing list's between devices. Beyond that, there are no additional features locked behind any sort of
				subscription.
			</p>
			<p class="muted">Issues or Feature suggestions should be reported on my <a href="https://github.com/jsc17/Terminals-BT">Github</a> page</p>
			<p class="muted">
				Mechwarrior, BattleMech, 'Mech and Aerotech are registered trademarks of The Topps Company, Inc. All Rights Reserved to the appropriate owners and original content
				creators.
			</p>
		</div>
	{:else if appWindow.isMobile}
		{#if list.scaList.length}
			<div class="list-scas">
				<div class="list-scas-header">
					<div class="flex-between">
						<p>Strategic Command Abilities</p>
						<button
							onclick={() => {
								scaListOpen = !scaListOpen;
							}}
							class="transparent-button expand-collapse">{scaListOpen ? "collapse" : "expand"}</button
						>
					</div>
				</div>
				<Collapsible bind:open={scaListOpen}>
					{#each list.scaList as sca, index}
						<div class="list-sca-row">
							<p>{sca.name}</p>
							<button
								onclick={() => {
									list.removeSCA(index);
								}}>Remove</button
							>
						</div>
					{/each}
				</Collapsible>
			</div>
		{/if}
		<div
			class="list-units"
			use:dragHandleZone={{ items: list.formations, dropTargetStyle, flipDurationMs, type: "formations", transformDraggedElement, dragDisabled: list.formations.length == 1 }}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each list.formations as formation (formation.id)}
				<FormationCard {formation} {draggingColumns} {unitCustomizationModal} bind:list></FormationCard>
			{/each}
		</div>
	{:else}
		{#if list.scaList.length}
			<div class="list-scas">
				<div class="list-scas-header">
					<div class="flex-between">
						<p>Strategic Command Abilities</p>
						<button
							onclick={() => {
								scaListOpen = !scaListOpen;
							}}
							class="transparent-button expand-collapse">{scaListOpen ? "collapse" : "expand"}</button
						>
					</div>
				</div>
				<Collapsible bind:open={scaListOpen}>
					{#each list.scaList as sca, index}
						<div class="list-sca-row">
							<p>{sca.name}</p>
							<button
								onclick={() => {
									list.removeSCA(index);
								}}>Remove</button
							>
						</div>
					{/each}
				</Collapsible>
			</div>
		{/if}
		{#if list.bsList.length}
			<div class="list-scas">
				<div class="list-scas-header">
					<div class="flex-between">
						<p>Battlefield Support</p>
						<p>
							<span class="muted">Total BSP:</span>
							{list.bsList.reduce((totalCost, currentBS) => {
								return (totalCost += getBSCbyId(currentBS)?.bspCost ?? 0);
							}, 0)}
						</p>
						<button
							onclick={() => {
								bsListOpen = !bsListOpen;
							}}
							class="transparent-button expand-collapse">{bsListOpen ? "collapse" : "expand"}</button
						>
					</div>
				</div>
				<Collapsible bind:open={bsListOpen}>
					<div class="list-bs-container">
						{#each list.bsList as bs, index}
							{@const support = getBSCbyId(bs)}
							{#if support}
								<div class="list-bs-row">
									<p>{support.name}</p>
									<p class="bs-stat"><span class="muted">TN:</span> {support.btn}</p>
									<p class="bs-stat"><span class="muted">Dmg:</span> {support.dmg}</p>
									<p class="bs-stat"><span class="muted">BSP Cost:</span> {support.bspCost}</p>
									<button
										onclick={() => {
											list.removeBS(index);
										}}>Remove</button
									>
								</div>
							{/if}
						{/each}
					</div>
				</Collapsible>
			</div>
		{/if}
		<div
			class="list-units"
			use:dndzone={{ items: list.formations, dropTargetStyle, flipDurationMs, type: "formations", transformDraggedElement, dragDisabled: list.formations.length == 1 }}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each list.formations as formation, index (formation.id)}
				<FormationCard bind:formation={list.formations[index]} {draggingColumns} {unitCustomizationModal} bind:list></FormationCard>
			{/each}
		</div>
	{/if}
</div>

<ScaModal bind:open={scaModalOpen} bind:list></ScaModal>
<PrintModal bind:this={printModal} bind:list></PrintModal>
<FindUnitAvailabilityModal bind:this={availabilityModal} bind:list />
<SublistModal bind:list bind:open={sublistModalOpen} />
<BattlefieldSupportModal bind:this={battlefieldSupportModal} bind:list />
<LoadModal bind:this={loadModal} bind:list></LoadModal>
<SaveModal bind:this={saveModal} bind:list></SaveModal>
<UnitCustomizationModal bind:this={unitCustomizationModal} bind:list></UnitCustomizationModal>

<style>
	.listbuilder {
		position: relative;
		width: 100%;
		height: 100%;
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
	.list-scas {
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-bottom: 2px solid var(--border);
		border-left: 1px solid var(--border);
		border-right: 1px solid var(--border);
		margin-bottom: 2px;
	}
	.list-scas-header {
		padding: 4px;
		background-color: var(--background);
		display: flex;
		align-items: center;
		border: 1px solid var(--border);
	}
	.list-sca-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2px 16px;

		button {
			background-color: transparent;
			border: none;
			color: var(--primary);
		}
	}
	.list-sca-row:not(:last-child) {
		border-bottom: 1px solid var(--border);
	}
	.list-bs-container {
		display: grid;
		grid-template-columns: 1fr repeat(4, max-content);
		column-gap: 16px;
	}
	.list-bs-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 5;
		padding: 2px 16px;

		button {
			background-color: transparent;
			border: none;
			color: var(--primary);
		}
	}
	.list-bs-row:not(:last-child) {
		border-bottom: 1px solid var(--border);
	}
	.bs-stat {
		font-size: 0.9em;
	}
	.list-units {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 4px 0px 16px 0px;
		flex: 1;
		overflow: auto;
		scrollbar-gutter: stable;
	}
	.list-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: max-content;
	}
	.list-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 80%;
		gap: 8px;
		align-items: center;
	}
	.list-stats {
		display: flex;
		gap: 4px;
		p {
			margin-left: 4px;
		}
	}
	.info {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		flex: 1;
	}

	input[type="text"] {
		width: min(250px, 50%);
	}
	.errors {
		color: var(--error);
	}
	.error-icon {
		width: 20px;
		height: 20px;
		filter: var(--error-filter);
	}
	.error-dialog-body {
		padding: 20px;
		display: grid;
		grid-template-columns: max-content auto;
		padding: 16px;
		color: var(--error);
		gap: 8px;
	}
	:global(.drop-target-zone) {
		outline: solid green;
	}
	.dropdown-menu-wrapper {
		width: max-content;
		padding: 0px 8px;

		& img {
			width: 20px;
			height: 20px;
		}
	}
</style>
