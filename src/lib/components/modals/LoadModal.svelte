<script lang="ts">
	import { eras, factions } from "$lib/data/erasFactionLookup";
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { getContext } from "svelte";
	import { resultList } from "$lib/utilities/resultList.svelte";

	let list: any = getContext("list");
	let { showLoadModal = $bindable(), status = $bindable() } = $props();
	let loadDialog: HTMLDialogElement;
	let importCode = $state("");
	let savedLists = $state<string[]>([]);
	let selectedList = $state(-1);

	$effect(() => {
		if (showLoadModal == true) {
			loadDialog.showModal();
			savedLists = JSON.parse(localStorage.getItem("lists") ?? '["No saved lists"]');
		} else {
			loadDialog.close();
		}
	});

	function deleteList(index: number) {
		localStorage.removeItem(savedLists[index]);
		savedLists.splice(index, 1);
		localStorage.setItem("lists", JSON.stringify(savedLists));
	}

	async function loadList() {
		let era, faction, units;
		let [listDetails, sublists] = importCode.split("-");
		[era, faction, ...units] = listDetails.split(":");
		if (sublists != undefined) {
			list.sublists = [];
			list.sublists = sublists.split(":");
		}
		resultList.details.era = parseInt(era);
		resultList.details.faction = parseInt(faction);

		status = "loading";
		await resultList.loadUnits();

		status = "loaded";
		if (resultList.results.length == 0) {
			status = "error";
		}

		list.details.name = selectedList != -1 ? savedLists[selectedList] : `${eras.get(resultList.details.era)} ${factions.get(resultList.details.faction)}`;
		list.details.era = eras.get(resultList.details.era)!;
		list.details.faction = factions.get(resultList.details.faction)!;
		list.details.general = factions.get(resultList.general)!;
		while (list.units.length) {
			list.remove(0);
		}
		units.forEach((unit) => {
			let [id, skill] = unit.split(",");
			let unitToAdd = resultList.results.find((result: any) => {
				return result.id == parseInt(id);
			});
			if (unitToAdd != null) {
				list.add(unitToAdd);
			}
			if (skill != "undefined") {
				list.modifySkill(list.units.length - 1, parseInt(skill), list.units.at(-1)!.pv);
			}
		});

		showLoadModal = false;
	}

	function selectRow(index: number) {
		selectedList = index;
		importCode = localStorage.getItem(savedLists[index])!;
	}
</script>

<dialog
	bind:this={loadDialog}
	on:close={() => {
		showLoadModal = false;
	}}
	class:dialog-wide={appWindow.isNarrow}>
	<div class="dialog-body">
		<div class="close-button">
			<button
				class="close-button"
				on:click={() => {
					showLoadModal = false;
				}}>Close</button>
		</div>
		<div class="table-container">
			<table class="saved-lists">
				<colgroup>
					<col style="width:90%" />
					<col style="width:10%" />
				</colgroup>
				<tbody>
					{#each savedLists as list, index}
						<tr id={index.toString()} class:selected={selectedList == index} on:click={() => selectRow(index)} on:dblclick={loadList}>
							<td>{list}</td>
							<td><button on:click={() => deleteList(index)}>-</button></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p>Select a list above or paste a list code into the box below</p>
		<div class="load-bar">
			<label for="importCode">List Code: </label><input type="text" name="importCode" id="importCode" bind:value={importCode} />
			<button on:click={loadList}>Load</button>
			<button on:click={()=>{
					navigator.clipboard.writeText(importCode!);
				}}> Copy </button>
		</div>
	</div>
</dialog>

<style>
	input[type="text"] {
		width: 75%;
	}
	.load-bar,
	.dialog-buttons {
		display: flex;
		gap: 8px;
		justify-content: center;
		align-items: center;
	}
	.table-container {
		min-width: 80%;
		height: 200px;
		overflow-y: auto;
		background-color: var(--card);
	}
	tr,
	td,
	tbody {
		width: 100%;
	}
	.close-button {
		display: flex;
		justify-content: end;
	}
	.selected {
		td {
			color: var(--primary-foreground);
		}
		background-color: var(--primary);
	}
</style>
