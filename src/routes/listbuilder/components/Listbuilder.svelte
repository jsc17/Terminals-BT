<script lang="ts">
	import { PrintModal, SaveModal, LoadModal, SublistModal, UnitCustomizationModal, ScaModal, FormationCard, ListInfoPopover, FindUnitAvailabilityModal } from "./";
	import { ruleSets, type ResultList, type FormationV2, sendListToPlay } from "$lib/types/";
	import { getContext } from "svelte";
	import type { List } from "../../../lib/types/list.svelte";
	import { dndzone, dragHandleZone, type DndEvent } from "svelte-dnd-action";
	import { appWindow, toastController } from "$lib/stores/";
	import { deserialize } from "$app/forms";
	import { Separator, Menu } from "$lib/components/Generic";

	const resultList: ResultList = getContext("resultList");
	let list: List = getContext("list");

	let { recentChanges, description }: { recentChanges: string[]; description: string[] } = $props();
	let printModal = $state<PrintModal>();
	let saveModal = $state<SaveModal>();
	let loadModal = $state<LoadModal>();
	let sublistModal = $state<SublistModal>();
	let unitCustomizationModal = $state<UnitCustomizationModal>();
	let scaModal = $state<ScaModal>();
	let errorDialog = $state<HTMLDialogElement>();

	let dropTargetStyle = { outline: "solid var(--primary)" };
	let flipDurationMs = 100;
	let draggingColumns = $state(false);
	function handleDndConsider(e: CustomEvent<DndEvent<FormationV2>>) {
		draggingColumns = true;
		list.formations = e.detail.items;
	}
	function handleDndFinalize(e: CustomEvent<DndEvent<FormationV2>>) {
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
		formData.append("list", list.getListCode());
		const response: any = deserialize(await (await fetch("?/shareList", { method: "POST", body: formData })).text());
		if (response.type == "success") {
			navigator.clipboard.writeText(`https://terminal.tools/listbuilder?share=${response.data.id}`);
			toastController.addToast("Shareable list link saved to clipboard");
		} else {
			toastController.addToast("Failed to create shareable link. Please try again");
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
				<ListInfoPopover {list} />
			</div>
			{#if list.issues?.issueList.size}
				<button class="error-button" onclick={() => errorDialog?.showModal()}><img src="/icons/alert-outline.svg" alt="Error" class="error-icon" /> Show issues</button>
				<dialog bind:this={errorDialog} class="error-dialog">
					<div class="error-dialog-header">
						<p>{list.options?.name} rules issues</p>
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
						class="transparent-button"
						onclick={() => {
							list.newFormation();
						}}>Add Formation</button
					>
					<button
						class="transparent-button"
						onclick={() => {
							scaModal?.show();
						}}>Add Special Command Ability</button
					>
					<hr />
					<div>More features coming soon</div></Menu
				>
				<Menu img={"/icons/menu.svg"}>
					<button
						class="transparent-button"
						onclick={() => {
							loadModal?.show();
						}}
					>
						Load / Import List
					</button>
					<button
						class="transparent-button"
						onclick={() => {
							saveModal?.show();
						}}
					>
						Save / Export List
					</button>
					<button
						class="transparent-button"
						onclick={() => {
							printModal?.show();
						}}
					>
						Print List
					</button>
					<button
						class="transparent-button"
						onclick={() => {
							shareList();
						}}
					>
						Share List Link
					</button>
					<Separator orientation={"horizontal"} classes={"separator-border"} />

					<FindUnitAvailabilityModal {list} />

					<button
						class="transparent-button"
						onclick={() => {
							sublistModal?.show();
						}}
					>
						Generate Sublists
					</button>
					<button
						class="transparent-button"
						onclick={() => {
							sendListToPlay(list.formations, list.units);
						}}>Play List</button
					>
					<Separator orientation={"horizontal"} classes={"separator-border"} />
					<button
						class="transparent-button"
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
	{:else if appWindow.isMobile}
		{#if list.scaList.length}
			<div class="list-scas">
				<div class="list-scas-header">Strategic Command Abilities</div>
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
			</div>
		{/if}
		<div
			class="list-units"
			use:dragHandleZone={{ items: list.formations, dropTargetStyle, flipDurationMs, type: "formations", transformDraggedElement, dragDisabled: list.formations.length == 1 }}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each list.formations as formation (formation.id)}
				<FormationCard {formation} {draggingColumns} {unitCustomizationModal}></FormationCard>
			{/each}
		</div>
	{:else}
		{#if list.scaList.length}
			<div class="list-scas">
				<div class="list-scas-header">Strategic Command Abilities</div>
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
			</div>
		{/if}

		<div
			class="list-units"
			use:dndzone={{ items: list.formations, dropTargetStyle, flipDurationMs, type: "formations", transformDraggedElement, dragDisabled: list.formations.length == 1 }}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each list.formations as formation (formation.id)}
				<FormationCard {formation} {draggingColumns} {unitCustomizationModal}></FormationCard>
			{/each}
		</div>
	{/if}
</div>

<PrintModal bind:this={printModal}></PrintModal>
<SaveModal bind:this={saveModal}></SaveModal>
<LoadModal bind:this={loadModal}></LoadModal>
<SublistModal bind:this={sublistModal}></SublistModal>
<UnitCustomizationModal bind:this={unitCustomizationModal}></UnitCustomizationModal>
<ScaModal bind:this={scaModal}></ScaModal>

<style>
	.listbuilder {
		position: relative;
		width: 100%;
		height: 100%;
		scrollbar-gutter: stable;
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
	.list-units {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 4px 0px 16px 0px;
		flex: 1;
		overflow: auto;
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
		gap: 4px;
		p {
			margin-left: 4px;
		}
	}
	.info {
		padding: 16px;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
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
