<script lang="ts">
	import { PrintModal, SaveModal, LoadModal, SublistModal, UnitCustomizationModal, FormationCard, ListInfoPopover, FindUnitAvailabilityModal } from "./";
	import { type ListFormation, List } from "$lib/types/list.svelte";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { getRulesByName, ruleSets } from "$lib/types/rulesets";
	import { dndzone, dragHandleZone, type DndEvent } from "svelte-dnd-action";
	import { appWindow, toastController } from "$lib/stores";
	import { Dialog } from "$lib/generic";
	import { deserialize } from "$app/forms";
	import { Collapsible, DropdownMenu } from "$lib/generic";
	import { getBSCbyId } from "$lib/data/battlefieldSupport";
	import { submittedList } from "$lib/stores/listSubmission.svelte";
	import type { PrintListOutput } from "../printing/types";
	import { printList } from "../printing/print.remote";
	import type { SettingsOutput } from "../types/settings";
	import { getContext } from "svelte";
	import { goto } from "$app/navigation";
	import PlayModal from "$lib/sharedDialogs/PlayModal.svelte";
	import { page } from "$app/state";
	import EditListModal from "./modals/EditListModal.svelte";
	import { MenuIcon } from "$lib/icons";
	import FormationListPopover from "./ListbuilderComponents/FormationListPopover.svelte";
	import BattlefieldSupportPopover from "./ListbuilderComponents/BattlefieldSupportPopover.svelte";
	import SCAPopover from "./ListbuilderComponents/SCAPopover.svelte";

	type Props = {
		listCloseCallback: (id: string) => void;
		resultList: ResultList;
		list: List;
	};

	let { listCloseCallback, resultList = $bindable(), list = $bindable() }: Props = $props();
	let saveModal = $state<SaveModal>();
	let loadModal = $state<LoadModal>();
	let playModal = $state<PlayModal>();
	let unitCustomizationModal = $state<UnitCustomizationModal>();
	let availabilityModal = $state<FindUnitAvailabilityModal>();

	let scaModalOpen = $state(false);
	let scaListOpen = $state(true);
	let sublistModalOpen = $state(false);
	let printModalOpen = $state(false);
	let editModalOpen = $state(false);

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
		const sharedUrl = `${page.url.origin}/share?share=${id}`;

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
			resultList.clear();
			list.clear();
			list.details = { name: "New List", eras: [], factions: [], general: -1 };
			list.id = crypto.randomUUID();
			list.rules = "noRes";
		}
	}

	let settings: SettingsOutput = getContext("listbuilderSettings");

	async function submitList() {
		let listData: PrintListOutput = {
			name: list.details.name,
			units: list.units.map((u) => ({ id: u.id, mulId: u.baseUnit.mulId, skill: u.skill ?? 4, customization: u.customization })),
			formations: list.formations.map((f) => ({
				name: f.name,
				type: f.type,
				units: f.units.map((u) => u.id),
				secondary: f.secondary && f.secondary.units.length ? { type: f.secondary?.type, units: f.secondary?.units.map((u) => u.id) } : undefined
			})),
			scas: list.scaList.map((v) => v.id),
			bs: Array.from(list.bsList.entries()).map(([id, count]) => ({ id, count }))
		};
		toastController.addToast("Preparing list for submission. Please wait until you are redirected.");
		printList({ listData, printOptions: { ...settings.print, cardStyle: "mul" } }).then((pdf) => {
			const blob = new Blob([new Uint8Array(pdf)], { type: "application/pdf" });

			submittedList.name = list.details.name;
			submittedList.data = blob;
			submittedList.era = list.details.eras.length == 1 ? list.details.eras[0] : undefined;
			submittedList.faction = list.details.factions.length == 1 ? list.details.factions[0] : undefined;
			submittedList.rules = list.rules;
			goto(`/validation?redirect`);
		});
	}
</script>

<div class="card listbuilder">
	<div class="list-header">
		<div class="list-details">
			<p>{list.details.name}</p>
			<div class="list-rules-row">
				<p class="list-info"><span class="muted">Rules:</span> {getRulesByName(list.rules ?? "noRes")?.display}</p>
				{#await list.issues then issues}
					{#if issues.issueList.size}
						<Dialog title="List Rules Issues" triggerClasses="transparent-button">
							{#snippet trigger()}
								<div class="center">
									<img src="/icons/alert-outline.svg" alt="Error" class="error-icon" /> <span class="primary list-info">Show issues</span>
								</div>
							{/snippet}
							{#snippet description()}
								{#if issues.issueMessage}
									<p class="muted">{issues.issueMessage}</p>
								{/if}
							{/snippet}
							<div class="error-dialog-body">
								{#each issues.issueList as [issue, units]}
									<div class="errors align-right">{issue}:</div>
									<div>{Array.from(units).join(", ")}</div>
								{/each}
							</div>
						</Dialog>
					{/if}
				{/await}
			</div>
		</div>
		<ListInfoPopover bind:list />
		<DropdownMenu
			items={[
				{ type: "item", label: "Edit List Details", onSelect: () => (editModalOpen = true) },
				{ type: "item", label: "Load / Import List", onSelect: () => loadModal?.show() },
				{ type: "item", label: "Save / Export List", onSelect: () => saveModal?.show() },
				{ type: "item", label: "Print List", onSelect: () => (printModalOpen = true) },
				{ type: "item", label: "Share List Link", onSelect: () => shareList() },
				{ type: "separator" },
				{ type: "item", label: "Check List Availability", onSelect: () => availabilityModal?.show() },
				{ type: "item", label: "Play List", onSelect: () => playModal?.open(list) },
				{ type: "item", label: "Submit List to Tournament", onSelect: () => submitList() },
				{ type: "separator" },
				{ type: "item", label: "Clear Units/Formations", onSelect: () => clearList() },
				{ type: "item", label: "Reset List", onSelect: () => resetList() },
				{ type: "item", label: "Close List", onSelect: () => listCloseCallback(list.id) }
			]}
		>
			{#snippet trigger()}
				<MenuIcon fill="var(--button-text-color)" height="15" width="15" />
			{/snippet}
		</DropdownMenu>
	</div>
	<div class="list-addition-buttons">
		<FormationListPopover bind:list />
		<BattlefieldSupportPopover bind:list />
		<SCAPopover bind:list />
		<button onclick={() => (sublistModalOpen = true)}>Sublists</button>
	</div>
	{#if list.units.length == 0 && list.formations.length == 1}
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
	{:else if appWindow.isNarrow}
		<div
			class="list-units"
			use:dragHandleZone={{ items: list.formations, dropTargetStyle, flipDurationMs, type: "formations", transformDraggedElement, dragDisabled: list.formations.length == 1 }}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each list.formations as formation (formation.id)}
				<FormationCard {formation} {draggingColumns} {unitCustomizationModal} bind:list {playModal}></FormationCard>
			{/each}
		</div>
	{:else}
		<div
			class="list-units"
			use:dndzone={{ items: list.formations, dropTargetStyle, flipDurationMs, type: "formations", transformDraggedElement, dragDisabled: list.formations.length == 1 }}
			onconsider={handleDndConsider}
			onfinalize={handleDndFinalize}
		>
			{#each list.formations as formation, index (formation.id)}
				<FormationCard bind:formation={list.formations[index]} {draggingColumns} {unitCustomizationModal} bind:list {playModal}></FormationCard>
			{/each}
		</div>
	{/if}
</div>

<PrintModal bind:list bind:open={printModalOpen}></PrintModal>
<FindUnitAvailabilityModal bind:this={availabilityModal} bind:list />
<SublistModal bind:list bind:open={sublistModalOpen} {playModal} />
<LoadModal bind:this={loadModal} bind:list></LoadModal>
<SaveModal bind:this={saveModal} bind:list></SaveModal>
<UnitCustomizationModal bind:this={unitCustomizationModal} bind:list></UnitCustomizationModal>
<EditListModal bind:open={editModalOpen} {list} />

<PlayModal bind:this={playModal} />

<style>
	.listbuilder {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	.list-header {
		display: grid;
		grid-template-columns: 1fr max-content max-content;
		border-bottom: 1px solid var(--border);
		gap: 32px;
		align-items: center;
		padding: 0px 8px 4px 8px;
	}
	.list-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.list-info {
		font-size: 0.8em;
	}
	.list-rules-row {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		column-gap: 8px;
	}
	.list-addition-buttons {
		display: grid;
		grid-auto-columns: 1fr;
		grid-auto-flow: column;
		gap: 2px;
		padding: 2px 4px;
	}

	.list-units {
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
		overflow: auto;
		scrollbar-gutter: stable;
		scroll-behavior: smooth;
		margin-top: 8px;
	}

	.info {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 20px;
		flex: 1;
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

	@media (max-width: 600px) {
		.list-header {
			gap: 14px;
		}
	}
</style>
