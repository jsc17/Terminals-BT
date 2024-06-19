<script lang="ts">
	import { eras, factions } from "$lib/data/erasFactionLookup";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { getContext } from "svelte";
	import { deserialize } from "$app/forms";
	import { resultList } from "../resultList.svelte";
	import { ruleSets, getRules, type Options } from "../options";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { list } from "../list.svelte";
	import { getNewSkillCost } from "$lib/utilities/bt-utils";
	import { type Unit } from "../unit";

	let user: any = getContext("user");

	type ImportList = {
		name: string;
		era: number;
		faction: number;
		units: string[];
		sublists: string[];
		local?: boolean;
		rules: Options;
	};

	let { showLoadModal = $bindable(), status = $bindable(), selectedRules = $bindable() } = $props();
	let loadDialog: HTMLDialogElement;
	let importCode = $state("");
	let savedLists = $state<ImportList[]>([]);
	let selectedListIndex = $state(-1);
	let localListsExist = $state(false);

	$effect(() => {
		if (showLoadModal == true) {
			getLists();
			importCode = "";
			selectedListIndex = -1;
			loadDialog.showModal();
		} else {
			loadDialog.close();
		}
	});

	async function getLists() {
		savedLists = [];
		localListsExist = false;
		//attempt to load saved lists from server
		const response: any = deserialize(await (await fetch("/?/loadList", { method: "POST", body: "" })).text());
		if (response.status == 200) {
			const responseLists = JSON.parse(response.data.lists);
			for (const tempList of responseLists) {
				savedLists.push({
					name: tempList.name,
					era: Number(tempList.era),
					faction: Number(tempList.faction),
					units: JSON.parse(tempList.units),
					sublists: JSON.parse(tempList.sublists),
					local: false,
					rules: getRules(tempList.rules) ?? ruleSets[0]
				});
			}
		} else {
			toastController.addToast("Failed to load lists from server, please try again");
			console.log(response.data.message);
		}

		//load local storage saved sublists
		const localLists = JSON.parse(localStorage.getItem("lists") ?? "[]");
		if (localLists.length) {
			localListsExist = true;
			for (const localListName of localLists) {
				const localData = localStorage.getItem(localListName)!;
				if (localData.charAt(0) == "{") {
					const localList = JSON.parse(localData);
					savedLists.push({
						name: localList.name,
						era: Number(localList.era),
						faction: Number(localList.faction),
						rules: getRules(localList.rules.name ?? "noRes")!,
						sublists: localList.sublists,
						units: localList.units,
						local: true
					});
				} else {
					let [listDetails, localSublists] = localData.split("-");
					if (!localSublists) {
						localSublists = "";
					}
					let [localEra, localFaction, ...localUnits] = listDetails.split(":");
					savedLists.push({
						name: localListName,
						era: Number(localEra),
						faction: Number(localFaction),
						units: localUnits,
						sublists: localSublists.split(":"),
						local: true,
						rules: ruleSets[0]
					});
				}
			}
		}
	}

	async function deleteList(index: number) {
		let listToRemove = savedLists[index];
		if (listToRemove.local) {
			localStorage.removeItem(listToRemove.name);
			let localLists = JSON.parse(localStorage.getItem("lists")!);
			let localIndex = localLists.findIndex((element: string) => {
				return (element = listToRemove.name);
			});
			localLists.splice(localIndex, 1);
			localStorage.setItem("lists", JSON.stringify(localLists));
			savedLists.splice(index, 1);
		} else {
			const response: any = deserialize(await (await fetch("/?/deleteList", { method: "POST", body: JSON.stringify({ name: listToRemove.name }) })).text());
			if (response.status == 200) {
				savedLists.splice(index, 1);
			} else {
				alert("List deletion failed. Please try again");
			}
		}
	}

	async function importList() {
		let parsedCode: ImportList;
		if (importCode.charAt(0) == "{") {
			parsedCode = JSON.parse(importCode);
		} else {
			//Legacy non-json code import. Will likely never be used, but it only adds one extra check. Should have just used a json to start instead of fancy string splitting.
			const [body, sublists] = importCode.split("-");
			const [era, faction, ...units] = body.split(":");
			parsedCode = {
				name: "Imported List",
				era: Number(era),
				faction: Number(faction),
				rules: ruleSets[0],
				units,
				sublists: sublists.split(":")
			};
		}
		loadList(parsedCode);
	}

	async function loadList(parsedCode?: ImportList) {
		let data: ImportList;
		if (parsedCode) {
			data = parsedCode;
		} else {
			data = savedLists[selectedListIndex];
		}
		const { era, faction, name, units, sublists, rules } = data;

		list.setOptions(rules.name);
		resultList.setOptions(rules.name);
		selectedRules = rules.name;

		resultList.details.era = era;
		resultList.details.faction = faction;

		status = "loading";
		await resultList.loadUnits();

		if (resultList.results.length == 0) {
			status = "error";
		} else {
			status = "loaded";
		}

		list.details.name = name;
		list.details.era = era;
		list.details.faction = faction;
		list.details.general = resultList.general;
		list.sublists = sublists;

		list.items = [];
		let unitArray = units;
		for (const item of unitArray) {
			if (item.charAt(0) == "{") {
				const formationData = JSON.parse(item);
				const tempFormation = { style: formationData.style, name: formationData.name, type: formationData.type, units: <Unit[]>[] };

				for (const unit of formationData.units) {
					let [id, skill] = unit.split(",");
					let unitToAdd = JSON.parse(
						JSON.stringify(
							resultList.results.find((result: Unit) => {
								return result.mulId == parseInt(id);
							})
						)
					);
					if (unitToAdd != null) {
						if (skill != "undefined") {
							unitToAdd.skill = parseInt(skill);
							unitToAdd.cost = getNewSkillCost(parseInt(skill), unitToAdd.pv);
						}
						tempFormation.units.push(unitToAdd);
					}
				}
				list.addFormation(tempFormation.style, tempFormation.name, tempFormation.type, tempFormation.units);
			} else {
				let [id, skill] = item.split(",");
				let unitToAdd = JSON.parse(
					JSON.stringify(
						resultList.results.find((result: Unit) => {
							return result.mulId == parseInt(id);
						})
					)
				);
				if (unitToAdd != null) {
					if (skill != "undefined") {
						unitToAdd.skill = parseInt(skill);
						unitToAdd.cost = getNewSkillCost(parseInt(skill), unitToAdd.pv);
					}
					list.addUnit(unitToAdd);
				}
			}
		}
		showLoadModal = false;
	}
</script>

<dialog
	bind:this={loadDialog}
	onclose={() => {
		showLoadModal = false;
	}}
	class:dialog-wide={appWindow.isNarrow}>
	<div class="dialog-body">
		<div class="space-between">
			{#if user.username}
				<div></div>
			{:else}
				<p>Login to load lists saved to account</p>
			{/if}
			<button
				onclick={() => {
					showLoadModal = false;
				}}>Close</button>
		</div>
		<div class="table-container">
			<table class="saved-lists">
				<colgroup>
					<col />
					<col style="width:15%" />
					<col style="width:15%" />
					<col style="width:20%" />
					<col style="width:20px" />
				</colgroup>
				<thead>
					<tr>
						<th>List name</th>
						<th>Era</th>
						<th>Faction</th>
						<th>Rules</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each savedLists as savedList, index}
						<tr
							id={index.toString()}
							class:selected={selectedListIndex == index}
							onclick={() => {
								selectedListIndex = index;
							}}
							ondblclick={() => {
								loadList();
							}}>
							<td class:local={savedList.local}>{savedList.name}</td>
							<td style="text-align:center">{eras.get(savedList.era)}</td>
							<td style="text-align:center">{factions.get(savedList.faction)}</td>
							<td style="text-align:center">{savedList.rules.display}</td>
							<td><button onclick={() => deleteList(index)}>-</button></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="space-between">
			<button
				onclick={() => {
					loadList();
				}}>Load</button>
			{#if localListsExist}
				<p>Lists with red names are saved to local device storage . Please consider creating an account to sync them between devices.</p>
			{/if}
		</div>
		<br />
		<p>Paste a list code into the box below to import a saved code:</p>
		<div class="load-bar">
			<label for="importCode">List Code: </label><input type="text" name="importCode" id="importCode" bind:value={importCode} />
			<button onclick={importList}> Import </button>
		</div>
	</div>
</dialog>

<style>
	dialog {
		width: 70%;
	}
	input[type="text"] {
		width: 75%;
	}
	.load-bar {
		display: flex;
		gap: 8px;
		justify-content: center;
		align-items: center;
	}
	.table-container {
		min-width: 100%;
		height: 200px;
		overflow-y: auto;
		background-color: var(--card);
	}
	table,
	tbody {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0 4px;
	}
	tbody tr:nth-child(even) {
		background-color: var(--muted);
	}
	th {
		border-bottom: 1px solid var(--border);
	}
	.selected {
		box-shadow: 5px 0px 5px var(--primary) inset;
	}
	td {
		overflow: hidden;
		padding-left: 8px;
	}
	.local {
		color: var(--error);
	}
</style>
