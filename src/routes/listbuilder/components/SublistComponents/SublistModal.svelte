<script lang="ts">
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { list } from "../../list.svelte";
	import { dndzone, type DndEvent } from "svelte-dnd-action";
	import { isUnit } from "../../unit";
	import { Sublist } from "./Sublist.svelte";
	import { untrack } from "svelte";
	import { flip } from "svelte/animate";
	import VerticalSublist from "./VerticalSublist.svelte";
	import SublistPrintModal from "./SublistPrintModal.svelte";
	import MobileSublist from "./MobileSublist.svelte";
	import HorizontalSublist from "./HorizontalSublist.svelte";
	import AutogenerationModal from "./AutogenerationModal.svelte";

	let { showSublistModal = $bindable() } = $props();

	let sublistId = 1;
	let tempSublist = $state<Sublist>(new Sublist(0));
	let sublists = $state<Sublist[]>([]);
	let filteredSublists = $derived.by(() => {
		let tempSublists: Sublist[] = [];
		for (const sublist of sublists) {
			if (scenarioFilter == "All" || scenarioFilter == sublist.scenario) {
				tempSublists.push(sublist);
			}
		}
		return tempSublists;
	});
	let scenarioFilter = $state<string>("All");
	let layout = $state<"vertical" | "horizontal">("vertical");
	let flipDurationMs = 300;

	let sublistDialog: HTMLDialogElement;
	let editSublistDialog: HTMLDialogElement;
	let showPrintModal = $state(false);
	let showAutoModal = $state(false);

	$effect(() => {
		if (showSublistModal) {
			untrack(() => {
				loadSublists();
			});
			sublistDialog.showModal();
		} else {
			sublistDialog.close();
		}
	});

	let selectedSublist: Sublist;

	let dropTargetStyle = { outline: "none" };
	function handleSort(e: CustomEvent<DndEvent<Sublist>>) {
		sublists = e.detail.items;
	}

	//sublist creation and editting functions
	function loadSublists() {
		sublists = [];
		for (const data of list.sublists) {
			if (data.charAt(0) == "{") {
				const sublist = JSON.parse(data);
				const newSublist = new Sublist(sublistId);
				sublistId++;

				newSublist.scenario = sublist.sc;
				newSublist.checked = sublist.un.map((id: string) => {
					return Number(id);
				});

				sublists.push(newSublist);
			} else {
				const newSublist = new Sublist(sublistId);
				sublistId++;

				newSublist.scenario = "-";
				newSublist.checked = data.split(",").map((id: string) => {
					return Number(id);
				});

				sublists.push(newSublist);
			}
		}
	}

	function addSublist() {
		let newList: Sublist = new Sublist(sublistId);
		const createdId = sublistId;
		sublistId++;

		sublists.push(newList);

		editSublist(createdId);
	}
	function editSublist(id: number) {
		selectedSublist = sublists.find((sublist) => {
			return sublist.id == id;
		})!;
		tempSublist.checked = [...selectedSublist.checked];

		editSublistDialog.showModal();
	}

	function handleEditSave() {
		selectedSublist.checked = [...tempSublist.checked];
		editSublistDialog.close();
		updateList();
	}

	function copySublist(id: number) {
		const createdSublist = new Sublist(sublistId);
		sublistId++;
		createdSublist.checked = [
			...(sublists.find((sublist) => {
				return sublist.id == id;
			})?.checked ?? [])
		];
		sublists.push(createdSublist);
		updateList();
	}
	function deleteSublist(id: number) {
		let index = sublists.findIndex((sublist) => {
			return sublist.id == id;
		});
		sublists.splice(index, 1);
		updateList();
	}

	function updateList() {
		list.sublists = [];
		for (const sublist of sublists) {
			list.sublists.push(JSON.stringify({ sc: sublist.scenario, un: sublist.checked }));
		}
	}

	function handleCheck(e: Event, id: number) {
		const element = e.target as HTMLInputElement;
		if (element.checked) {
			tempSublist.checked.push(id);
		} else {
			const index = tempSublist.checked.findIndex((ind) => {
				return ind == id;
			});
			tempSublist.checked.splice(index, 1);
		}
	}
</script>

<!-- main sublist dialog -->
<dialog
	bind:this={sublistDialog}
	onclose={() => {
		updateList();
		showSublistModal = false;
	}}
	class="sublist-modal">
	<div class="dialog-body">
		<div class="space-between">
			<h2>sublists {appWindow.isMobile}</h2>
			{#if !appWindow.isMobile}
				<div class="center gap8">
					<p>Display</p>
					<button
						onclick={() => {
							layout = "vertical";
						}}>Vertical</button>
					<button
						onclick={() => {
							layout = "horizontal";
						}}>Horizontal</button>
				</div>
			{/if}
			<button
				onclick={() => {
					showSublistModal = false;
				}}>Close</button>
		</div>
		<main>
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
					<button onclick={addSublist}>Add</button>
					<button
						onclick={() => {
							showAutoModal = true;
						}}>Generate sublists</button>
					<button
						onclick={() => {
							showPrintModal = true;
						}}>Print all sublists</button>
				</div>
			</div>
			{#if appWindow.isMobile}
				<div
					class="sublist-container sublist-container-horizontal"
					use:dndzone={{ items: sublists, dropTargetStyle, flipDurationMs }}
					onconsider={handleSort}
					onfinalize={handleSort}>
					{#each filteredSublists as sublist (sublist.id)}
						<div animate:flip={{ duration: flipDurationMs }} class="panel-mobile">
							<MobileSublist {sublist} {editSublist} {deleteSublist} {copySublist}></MobileSublist>
						</div>
					{/each}
					<div class="add-panel panel-mobile">
						<button onclick={addSublist}>+</button>
					</div>
				</div>
			{:else}
				<div
					class="sublist-container"
					use:dndzone={{ items: sublists, dropTargetStyle, flipDurationMs }}
					onconsider={handleSort}
					onfinalize={handleSort}
					class:sublist-container-horizontal={layout == "horizontal"}>
					{#each filteredSublists as sublist (sublist.id)}
						<div animate:flip={{ duration: flipDurationMs }} class:panel-vertical={layout == "vertical"} class:panel-horizontal={layout == "horizontal"}>
							{#if layout == "vertical"}
								<VerticalSublist {sublist} {editSublist} {deleteSublist} {copySublist}></VerticalSublist>
							{:else if layout == "horizontal"}
								<HorizontalSublist {sublist} {editSublist} {deleteSublist} {copySublist}></HorizontalSublist>
							{/if}
						</div>
					{/each}
					<div class="add-panel" class:panel-vertical={layout == "vertical"} class:panel-horizontal={layout == "horizontal"}>
						<button onclick={addSublist}>+</button>
					</div>
				</div>
			{/if}
		</main>
	</div>
</dialog>

<!-- Edit sublist dialog -->
<dialog bind:this={editSublistDialog} class:dialog-wide={appWindow.isNarrow}>
	<div class="dialog-body">
		<table>
			<thead>
				<tr>
					<th></th>
					<th>Unit</th>
					<th>Skill</th>
					<th>PV</th>
				</tr>
			</thead>
			<tbody>
				{#each list.items as item}
					{#if isUnit(item)}
						<tr>
							<td><input type="checkbox" id={`checkbox${item.id!.toString()}`} checked={tempSublist.checked?.includes(item.id!)} onchange={(e)=>{ handleCheck(e, item.id!)}} /></td>
							<td><label for={`checkbox${item.id!.toString()}`}>{item.name}</label></td>
							<td>{item.skill}</td>
							<td>{item.cost}</td>
						</tr>
					{:else}
						{#each item.units as unit}
							<tr>
								<td
									><input type="checkbox" id={`checkbox${unit.id!.toString()}`} checked={tempSublist.checked?.includes(unit.id!)} onchange={(e)=>{handleCheck(e, unit.id!)}} /></td>
								<td>{unit.name}</td>
								<td>{unit.skill}</td>
								<td>{unit.cost}</td>
							</tr>
						{/each}
					{/if}
				{/each}
			</tbody>
		</table>
		<div style:display="flex" style:gap="16px">
			<div>{`Units: ${tempSublist.checked.length}/10`}</div>
			<div>{`PV: ${tempSublist.stats.pv}/250`}</div>
		</div>
		<div class="dialog-buttons">
			<button
				onclick={() => {
					editSublistDialog.close();
				}}>Cancel</button>
			<button onclick={handleEditSave}>Save</button>
		</div>
	</div>
</dialog>

<SublistPrintModal bind:showPrintModal {sublists}></SublistPrintModal>
<AutogenerationModal bind:showAutoModal bind:sublistId bind:sublists></AutogenerationModal>

<style>
	.sublist-modal {
		width: 100%;
		height: 100%;
	}
	main {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px;
		height: 100%;
		width: 100%;
		border: 1px solid var(--border);
	}
	.sublist-container {
		display: flex;
		gap: 8px;
		padding: 8px;
		height: 100%;
		overflow: auto;
	}
	.sublist-container-horizontal {
		flex-direction: column;
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
		width: 15%;
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
