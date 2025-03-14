<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { dndzone, dragHandleZone, type DndEvent } from "svelte-dnd-action";
	import VerticalSublist from "./VerticalSublist.svelte";
	import SublistPrintModal from "./SublistPrintModal.svelte";
	import HorizontalSublist from "./HorizontalSublist.svelte";
	import { getContext } from "svelte";
	import type { List } from "../../types/list.svelte";
	import type { SublistV2 } from "../../types/sublist";
	import EditSublistModal from "./EditSublistModal.svelte";
	import ExportSublistModal from "./ExportSublistModal.svelte";
	import MobileSublist from "./MobileSublist.svelte";
	import AutogenerationModal from "./AutogenerationModal.svelte";

	let list: List = getContext("list");

	let scenarioFilter = $state<string>("All");
	let layout = $state<"vertical" | "horizontal">("vertical");
	let flipDurationMs = 300;

	let sublistDialog: HTMLDialogElement;
	let printModal: SublistPrintModal;
	let editSublistModal = $state<EditSublistModal>();
	let exportSublistModal = $state<ExportSublistModal>();
	let autoSublistModal: AutogenerationModal;

	export function show() {
		sublistDialog.showModal();
	}

	let dropTargetStyle = { outline: "none" };
	function handleSort(e: CustomEvent<DndEvent<SublistV2>>) {
		list.sublists = e.detail.items;
	}
</script>

<!-- main sublist dialog -->
<dialog bind:this={sublistDialog} class="sublist-modal">
	<div class="dialog-body">
		<div class="space-between">
			<h2>Sublists</h2>
			{#if !appWindow.isMobile}
				<div class="center gap8">
					<p>Display</p>
					<button
						onclick={() => {
							layout = "vertical";
						}}>Vertical</button
					>
					<button
						onclick={() => {
							layout = "horizontal";
						}}>Horizontal</button
					>
				</div>
			{/if}
			<button
				onclick={() => {
					sublistDialog.close();
				}}>Close</button
			>
		</div>
		<div class="sublist-modal-content" class:sublist-modal-content-mobile={appWindow.isMobile}>
			<div class="space-between">
				<div>
					<label for="scenarioFilter">Scenario:</label>
					<select id="scenarioFilter" bind:value={scenarioFilter}>
						{#each ["All", "-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
							<option value={scenario}>{scenario}</option>
						{/each}
					</select>
				</div>
				<div class="center gap8">
					<button
						onclick={() => {
							const idAdded = list.addSublist();
							editSublistModal?.show(idAdded);
						}}>Add</button
					>
					<button
						onclick={() => {
							autoSublistModal.show();
						}}>Generate</button
					>
					<button
						onclick={() => {
							printModal.show();
						}}>Print</button
					>
				</div>
			</div>
			{#if appWindow.isMobile}
				<div
					class="sublist-container sublist-container-mobile"
					use:dragHandleZone={{ items: list.sublists, dropTargetStyle, flipDurationMs, dragDisabled: scenarioFilter != "All" }}
					onconsider={handleSort}
					onfinalize={handleSort}
				>
					{#each list.sublists as sublist (sublist.id)}
						{#if sublist.scenario == scenarioFilter || scenarioFilter == "All"}
							<div class="panel-horizontal">
								<MobileSublist {sublist} {list} {editSublistModal} {exportSublistModal}></MobileSublist>
							</div>
						{/if}
					{/each}
					<div class="add-panel" class:panel-vertical={layout == "vertical" && !appWindow.isMobile} class:panel-horizontal={layout == "horizontal" || appWindow.isMobile}>
						<button
							onclick={() => {
								const idAdded = list.addSublist();
								editSublistModal?.show(idAdded);
							}}>+</button
						>
					</div>
				</div>
			{:else}
				<div
					class="sublist-container"
					use:dndzone={{ items: list.sublists, dropTargetStyle, flipDurationMs, dragDisabled: scenarioFilter != "All" }}
					onconsider={handleSort}
					onfinalize={handleSort}
					class:sublist-container-vertical={layout == "vertical"}
					class:sublist-container-horizontal={layout == "horizontal"}
				>
					{#each list.sublists as sublist (sublist.id)}
						{#if sublist.scenario == scenarioFilter || scenarioFilter == "All"}
							<div class:panel-vertical={layout == "vertical" && !appWindow.isMobile} class:panel-horizontal={layout == "horizontal" || appWindow.isMobile}>
								{#if layout == "horizontal"}
									<HorizontalSublist {sublist} {list} {editSublistModal} {exportSublistModal}></HorizontalSublist>
								{:else}
									<VerticalSublist {sublist} {list} {editSublistModal} {exportSublistModal}></VerticalSublist>
								{/if}
							</div>
						{/if}
					{/each}
					<div class="add-panel" class:panel-vertical={layout == "vertical" && !appWindow.isMobile} class:panel-horizontal={layout == "horizontal" || appWindow.isMobile}>
						<button
							onclick={() => {
								const idAdded = list.addSublist();
								editSublistModal?.show(idAdded);
							}}>+</button
						>
					</div>
				</div>
			{/if}
		</div>
	</div>
</dialog>

<SublistPrintModal bind:this={printModal}></SublistPrintModal>
<EditSublistModal bind:this={editSublistModal}></EditSublistModal>
<ExportSublistModal bind:this={exportSublistModal}></ExportSublistModal>
<AutogenerationModal bind:this={autoSublistModal}></AutogenerationModal>

<style>
	.sublist-modal {
		width: 100%;
		height: 100%;
	}
	.sublist-modal-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px;
		height: 100%;
		width: 100%;
		border: 1px solid var(--border);
	}
	.sublist-modal-content-mobile {
		padding: 0px;
		border: none;
		gap: 4px;
	}
	.sublist-container {
		display: flex;
		gap: 8px;
		/* padding: 8px; */
		height: 100%;
		overflow: auto;
	}
	.sublist-container-horizontal,
	.sublist-container-mobile {
		flex-direction: column;
	}
	.sublist-container-vertical {
		scrollbar-width: auto;
	}
	.sublist-container-mobile {
		gap: 4px;
	}
	.add-panel {
		button {
			font-size: 10vmin;
			background-color: var(--card);
			color: var(--card-foreground);
			height: 100%;
			width: 100%;
		}
		background-color: var(--primary);
		flex-shrink: 0;
		border-radius: var(--radius);
	}
	.panel-vertical {
		height: 100%;
		width: 220px;
		flex-shrink: 0;
	}
	.panel-horizontal {
		width: 100%;
		flex-shrink: 0;
	}
	.panel-mobile {
		width: 100%;
		flex-shrink: 0;
	}

	.dialog-buttons {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
	}
</style>
