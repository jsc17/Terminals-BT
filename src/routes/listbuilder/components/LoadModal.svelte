<script lang="ts">
	import { eras, factions } from "$lib/data/erasFactionLookup";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { getContext } from "svelte";
	import { deserialize } from "$app/forms";
	import { toastController } from "$lib/stores/toastController.svelte";
	import type { ResultList } from "$lib/types/resultList.svelte";
	import type { List } from "../types/list.svelte";
	import { getRules } from "$lib/types/options";
	import { convertOldFormations, type FormationV2 } from "../types/formation";
	import type { ListCode, ListCodeUnit } from "../types/listCode";
	import type { SublistV2 } from "../types/sublist";

	let user: any = getContext("user");
	let resultList: ResultList = getContext("resultList");
	let list: List = getContext("list");

	let importCode = $state("");
	let savedLists = $state<ListCode[]>([]);
	let selectedListIndex = $state(-1);
	let localListsExist = $state(false);
	let dialogElement: HTMLDialogElement;
	let localLists: string[] = [];

	export function show() {
		dialogElement.showModal();
		getLists();
	}

	async function getLists() {
		savedLists = [];
		localListsExist = false;
		//attempt to load saved lists from server
		if (user.username) {
			const response: any = deserialize(await (await fetch("?/loadList", { method: "POST", body: "" })).text());
			if (response.status == 200) {
				const responseLists = JSON.parse(response.data.lists);
				for (const tempList of responseLists) {
					savedLists.push({
						id: tempList.id,
						name: tempList.name,
						era: Number(tempList.era),
						faction: Number(tempList.faction),
						units: JSON.parse(tempList.units),
						formations: JSON.parse(tempList.formations),
						sublists: JSON.parse(tempList.sublists),
						rules: tempList.rules ?? "noRes",
						lcVersion: tempList.lcVersion
					});
				}
			} else {
				toastController.addToast("Failed to load lists from server, please try again");
				console.log(response.data.message);
			}
		}
		// load local storage saved sublists
		localLists = JSON.parse(localStorage.getItem("lists") ?? "[]");
		if (localLists.length) {
			localListsExist = true;
			console.log("Loading Local Lists");
			for (const localListName of localLists) {
				const localData = localStorage.getItem(localListName)!;
				if (localData.charAt(0) == "{") {
					const localList = JSON.parse(localData);
					if (localList.lcVersion && localList.lcVersion == 1) {
						savedLists.push({
							id: localList.id,
							name: localList.name,
							era: Number(localList.era),
							faction: Number(localList.faction),
							units: localList.units,
							formations: localList.formations,
							sublists: localList.sublists,
							rules: localList.rules ?? "noRes",
							lcVersion: localList.lcVersion
						});
					} else {
						let importedUnits: ListCodeUnit[] = [];
						let importedFormations: FormationV2[] = [];
						let importedSublists: SublistV2[] = [];

						importedFormations.push({ id: crypto.randomUUID(), name: "Unassigned units", type: "none", units: [] });

						for (const item of localList.units) {
							if (item.charAt(0) == "{") {
								const formationData = JSON.parse(item);
								const formationId: string = crypto.randomUUID();
								let formationUnitList: { id: string }[] = [];

								for (const unit of formationData.units) {
									const unitId: string = crypto.randomUUID();
									let [mulId, skill] = unit.split(",");

									if (skill == "undefined") {
										skill = 4;
									}
									importedUnits.push({ id: unitId, mulId, skill, customization: {} });
									formationUnitList.push({ id: unitId });
								}
								importedFormations.push({ id: formationId, name: formationData.name, type: formationData.type, units: formationUnitList });
							} else {
								const unitId = crypto.randomUUID();
								let [mulId, skill] = item.split(",");
								if (skill == "undefined") {
									skill = 4;
								}
								importedUnits.push({ id: unitId, mulId, skill, customization: {} });
								importedFormations[0].units.push({ id: unitId });
							}
						}

						for (const sublist of localList.sublists) {
							const subListData = JSON.parse(sublist);
							const sublistId: string = crypto.randomUUID();
							const scenario: string = subListData.sc;
							const checked = subListData.un.map((unitPos: number) => {
								return importedUnits[unitPos].id;
							});

							importedSublists.push({ id: sublistId, scenario, checked });
						}

						const importedList: ListCode = {
							id: crypto.randomUUID(),
							name: localList.name,
							era: Number(localList.era),
							faction: Number(localList.faction),
							rules: localList.rules.name ?? "noRes",
							sublists: importedSublists,
							units: importedUnits,
							formations: importedFormations,
							lcVersion: 1
						};
						savedLists.push(importedList);
						localStorage.setItem(localList.name, JSON.stringify(importedList));
					}
				}
			}
		}
	}

	async function deleteList(idToRemove: string) {
		let listToRemove = savedLists.find((list) => {
			return list.id == idToRemove;
		})!;
		if (localLists.includes(listToRemove.name)) {
			localStorage.removeItem(listToRemove.name);
			localLists = localLists.filter((listName) => {
				return listName != listToRemove.name;
			});
			localStorage.setItem("lists", JSON.stringify(localLists));
			savedLists = savedLists.filter((list) => {
				return list.id != idToRemove;
			});
		} else {
			const response: any = deserialize(await (await fetch("?/deleteList", { method: "POST", body: JSON.stringify({ id: idToRemove }) })).text());
			if (response.status == 200) {
				savedLists = savedLists.filter((list) => {
					return list.id != idToRemove;
				});
			} else {
				alert("List deletion failed. Please try again");
			}
		}
	}

	// async function importList() {
	// 	let parsedCode: ImportList;
	// 	if (importCode.charAt(0) == "{") {
	// 		const importData = JSON.parse(importCode);
	// 		parsedCode = {
	// 			name: importData.name ?? "Imported List",
	// 			era: importData.era ?? 0,
	// 			faction: importData.faction ?? 0,
	// 			rules: importData.rules ?? "noRes",
	// 			units: importData.units ?? [],
	// 			sublists: importData.sublists ?? []
	// 		};
	// 	} else {
	// 		//Legacy non-json code import. Will likely never be used, but it only adds one extra check. Should have just used a json to start instead of fancy string splitting.
	// 		const [body, sublists] = importCode.split("-");
	// 		const [era, faction, ...units] = body.split(":");
	// 		parsedCode = {
	// 			name: "Imported List",
	// 			era: Number(era),
	// 			faction: Number(faction),
	// 			rules: ruleSets[0],
	// 			units,
	// 			sublists: sublists.split(":")
	// 		};
	// 	}
	// 	loadList(parsedCode);
	// }

	async function loadList(parsedCode?: ListCode) {
		await list.loadList(parsedCode ?? savedLists[selectedListIndex], resultList);
		dialogElement?.close();
	}
</script>

<dialog bind:this={dialogElement}>
	<div class="dialog-body">
		<div class="space-between">
			{#if user.username}
				<div></div>
			{:else}
				<p>Login to load lists saved to account</p>
			{/if}
			<button
				onclick={() => {
					dialogElement?.close();
				}}>Close</button
			>
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
							}}
						>
							<td class:local={localLists.includes(savedList.name)}>{savedList.name}</td>
							<td style="text-align:center">{eras.get(savedList.era)}</td>
							<td style="text-align:center">{factions.get(savedList.faction)}</td>
							<td style="text-align:center">{getRules(savedList.rules)?.display}</td>
							<td><button onclick={() => deleteList(savedList.id)}>-</button></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<button
			class="load-button"
			onclick={() => {
				loadList();
			}}>Load</button
		>

		{#if localListsExist}
			<p>Lists with red names are saved to local device storage . Please consider creating an account to sync them between devices.</p>
		{/if}
		<!-- <br /> -->
		<!-- <p>Paste a list code into the box below to import a saved code:</p>
		<div class="load-bar">
			<label for="importCode">List Code: </label><input type="text" name="importCode" id="importCode" bind:value={importCode} />
			<button onclick={importList}> Import </button>
		</div> -->
	</div>
</dialog>

<style>
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
		min-height: 200px;
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
	.load-button {
		width: fit-content;
	}
</style>
