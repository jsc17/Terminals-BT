<script lang="ts">
	import type { Unit } from "$lib/types/unit";
	import { deserialize, enhance } from "$app/forms";
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { list } from "../list.svelte";
	import { dndzone, type DndEvent } from "svelte-dnd-action";
	import { isUnit } from "../unit";

	type Sublist = {
		id: number;
		index: number;
		unitList: [Unit, boolean][];
		scenario: string;
		checked: number;
		pv: number;
		health: number;
		short: number;
		medium: number;
		long: number;
		size: number;
		string?: string;
		unitIndices: number[];
	};
	let sublistId = 0;

	let count = 0;
	let sublists = $state<Sublist[]>([]);
	let autosublists = $state<any[]>([]);
	let scenarioFilter = $state<string>("All");
	let showMinUnitInfoDropdown = $state<boolean>(false);
	let layout = $state<"vertical" | "horizontal" | "mobile">("vertical");
	let showFilters = $state<boolean>(false);

	let { showSublistModal = $bindable() } = $props();
	let sublistDialog: HTMLDialogElement;
	let editSublistDialog: HTMLDialogElement;
	let autoGenerationDialog: HTMLDialogElement;
	let printDialog: HTMLDialogElement;

	let autoMinPV = $state(240),
		autoMaxPV = $state(250),
		autoMinUnitCost = $state(0);

	let loaded = false;

	$effect(() => {
		if (showSublistModal) {
			if (!loaded) {
				loadSublists();
			}
			if (appWindow.isMobile) {
				layout = "mobile";
			} else if (appWindow.isNarrow) {
				layout = "horizontal";
			}

			sublistDialog.showModal();
		} else {
			loaded = false;
			sublistDialog.close();
		}
	});

	let tempSublist = $state<Sublist>({
		id: -1,
		index: -1,
		unitList: [],
		scenario: "-",
		checked: 0,
		pv: 0,
		health: 0,
		short: 0,
		medium: 0,
		long: 0,
		size: 0,
		unitIndices: []
	});
	let selectedSublist = -1;

	let dropTargetStyle = { outline: "none" };
	function handleSort(e: CustomEvent<DndEvent<Sublist>>) {
		sublists = e.detail.items;
	}

	//sublist creation and editting functions
	function addSublist() {
		let newList: Sublist = {
			id: sublistId,
			index: count,
			unitList: [],
			scenario: "-",
			checked: 0,
			pv: 0,
			health: 0,
			short: 0,
			medium: 0,
			long: 0,
			size: 0,
			unitIndices: []
		};
		sublistId++;

		for (const item of list.units) {
			if (isUnit(item)) {
				newList.unitList.push([item, false]);
			} else {
				for (const unit of item.units) {
					newList.unitList.push([unit, false]);
				}
			}
		}
		sublists.push(JSON.parse(JSON.stringify(newList)));
		count++;

		editSublist(sublists.length - 1);
	}
	function editSublist(index: number) {
		tempSublist.unitList = JSON.parse(JSON.stringify(sublists[index].unitList));
		tempSublist.pv = sublists[index].pv;
		tempSublist.checked = sublists[index].checked;
		selectedSublist = index;
		editSublistDialog.showModal();
	}
	function handleCheck(unit: Unit, index: number) {
		if (tempSublist.unitList[index][1]) {
			tempSublist.pv += unit.cost;
			tempSublist.checked += 1;
		} else {
			tempSublist.pv -= unit.cost;
			tempSublist.checked -= 1;
		}
	}
	function handleEditSave() {
		sublists[selectedSublist].unitList = JSON.parse(JSON.stringify(tempSublist.unitList));
		sublists[selectedSublist].pv = tempSublist.pv;
		sublists[selectedSublist].checked = tempSublist.checked;
		let tempSize = 0;
		sublists[selectedSublist].health = 0;
		sublists[selectedSublist].short = 0;
		sublists[selectedSublist].medium = 0;
		sublists[selectedSublist].long = 0;
		for (const [unit, checked] of sublists[selectedSublist].unitList) {
			if (checked) {
				sublists[selectedSublist].health += unit.health ?? 0;
				sublists[selectedSublist].short += unit.damageS ?? 0;
				sublists[selectedSublist].medium += unit.damageM ?? 0;
				sublists[selectedSublist].long += unit.damageL ?? 0;
				tempSize += unit.size ?? 0;
			}
		}
		sublists[selectedSublist].size = parseFloat((tempSize / sublists[selectedSublist].checked).toFixed(1));
		tempSublist.unitIndices = [];
		for (let i = 0; i < tempSublist.unitList.length; i++) {
			if (tempSublist.unitList[i][1]) {
				tempSublist.unitIndices.push(i);
			}
		}
		const removeIndex = list.sublists.findIndex((sublist: string) => {
			return sublist == sublists[selectedSublist].unitIndices.toString();
		});
		if (removeIndex != -1) {
			list.sublists.splice(removeIndex, 1);
		}
		list.sublists.push(
			tempSublist.unitIndices
				.sort((a, b) => {
					return a - b;
				})
				.toString()
		);
		tempSublist.unitList = [];
		selectedSublist = -1;
		editSublistDialog.close();
	}
	function copySublist(index: number) {
		sublists.push(JSON.parse(JSON.stringify(sublists[index])));
	}
	function deleteSublist(index: number) {
		let removeString = sublists[index].unitIndices.toString();
		let removeIndex = list.sublists.findIndex((sublist: string) => {
			return sublist == removeString;
		});
		if (removeIndex != -1) {
			list.sublists.splice(removeIndex, 1);
		}
		sublists.splice(index, 1);
	}
	function generatesublists() {
		autosublists = [];
		let index = 0;
		const possibleUnits = JSON.parse(JSON.stringify(list.units)).filter((unit: Unit) => {
			unit.index = index;
			index++;
			return unit.cost >= autoMinUnitCost;
		});
		const combinations: any[] = [[]];
		for (const el of possibleUnits) {
			const last = combinations.length - 1;
			for (let i = 0; i <= last; i++) {
				combinations.push([...combinations[i], el]);
			}
		}
		combinations.forEach((subset) => {
			if (subset.length) {
				let tempString = "",
					pv = 0,
					checked = 0,
					indices: number[] = [];

				subset.forEach((unit: Unit) => {
					tempString += `${unit.name} (Skill ${unit.skill}), `;
					indices.push(unit.index!);
					checked++;
					pv += unit.cost;
				});

				if (checked <= 10 && pv <= autoMaxPV && pv >= autoMinPV) {
					let newList = $state<Sublist>({
						id: sublistId,
						index: -1,
						unitList: [],
						scenario: "-",
						checked: checked,
						pv: pv,
						health: 0,
						short: 0,
						medium: 0,
						long: 0,
						size: 0,
						string: tempString.slice(0, tempString.length - 2),
						unitIndices: indices!
					});
					sublistId++;
					let exists = autosublists.findIndex((list) => {
						return list.string! == newList.string!;
					});
					if (exists == -1) {
						autosublists.push(newList);
					}
				}
			}
		});
	}

	function addAutoSublist(index: number) {
		let newList: Sublist = JSON.parse(JSON.stringify(autosublists[index]));
		newList.index = count;
		count++;
		let tempSize = 0,
			unitIndex = 0;

		for (const item of list.units) {
			if (isUnit(item)) {
				const unitChecked = newList.unitIndices!.includes(unitIndex);
				unitIndex++;
				if (unitChecked) {
					newList.health += item.health ?? 0;
					newList.short += item.damageS ?? 0;
					newList.medium += item.damageM ?? 0;
					newList.long += item.damageL ?? 0;
					tempSize += item.size ?? 0;
				}
				newList.unitList.push([item, unitChecked]);
			} else {
				for (const unit of item.units) {
					const unitChecked = newList.unitIndices!.includes(unitIndex);
					unitIndex++;
					if (unitChecked) {
						newList.health += unit.health ?? 0;
						newList.short += unit.damageS ?? 0;
						newList.medium += unit.damageM ?? 0;
						newList.long += unit.damageL ?? 0;
						tempSize += unit.size ?? 0;
					}
					newList.unitList.push([unit, unitChecked]);
				}
			}
			newList.size = parseFloat((tempSize / newList.checked).toFixed(1));
			sublists.push(newList);
			list.sublists.push(
				newList
					.unitIndices!.sort((a, b) => {
						return a - b;
					})
					.toString()
			);
		}
	}

	function loadSublists() {
		sublists = [];
		loaded = true;

		list.sublists.forEach((sublist: string) => {
			const formattedSublist = sublist.split(",").map((index: string) => {
				return parseInt(index);
			});
			let newList: Sublist = {
				id: sublistId,
				index: count,
				unitList: [],
				scenario: "-",
				checked: 0,
				pv: 0,
				health: 0,
				short: 0,
				medium: 0,
				long: 0,
				size: 0,
				unitIndices: formattedSublist
			};
			sublistId++;
			count++;
			let tempSize = 0,
				unitIndex = 0;
			for (const item of list.units) {
				if (isUnit(item)) {
					const unitChecked = newList.unitIndices!.includes(unitIndex);
					unitIndex++;
					if (unitChecked) {
						newList.checked += 1;
						newList.pv += item.cost;
						newList.health += item.health ?? 0;
						newList.short += item.damageS ?? 0;
						newList.medium += item.damageM ?? 0;
						newList.long += item.damageL ?? 0;
						tempSize += item.size ?? 0;
					}
					newList.unitList.push([item, unitChecked]);
				} else {
					for (const unit of item.units) {
						const unitChecked = newList.unitIndices!.includes(unitIndex);
						unitIndex++;
						if (unitChecked) {
							newList.checked += 1;
							newList.pv += unit.cost;
							newList.health += unit.health ?? 0;
							newList.short += unit.damageS ?? 0;
							newList.medium += unit.damageM ?? 0;
							newList.long += unit.damageL ?? 0;
							tempSize += unit.size ?? 0;
						}
						newList.unitList.push([unit, unitChecked]);
					}
					newList.size = parseFloat((tempSize / newList.checked).toFixed(1));
					sublists.push(newList);
				}
			}
		});
	}

	async function printSubList(index: number) {
		let form = new FormData();

		let sublistUnits: Unit[] = [];
		let condense = false;
		if (sublists[index].checked == 9 || sublists[index].checked == 10) {
			condense = true;
		}
		sublists[index].unitList.forEach((unit) => {
			if (unit[1]) {
				sublistUnits.push(unit[0]);
			}
		});
		let body = JSON.stringify({
			units: sublistUnits,
			playername: "",
			listname: list.details.name,
			era: list.details.era,
			faction: list.details.faction,
			general: list.details.general,
			style: "detailed",
			condense: condense
		});
		form.append("body", body);
		let response = deserialize(await (await fetch("/?/print", { method: "POST", body: form })).text());
		//@ts-ignore
		const blob = new Blob([new Uint8Array(Object.values(JSON.parse(response.data.pdf)))], { type: "application/pdf" });
		const downloadElement = document.createElement("a");
		downloadElement.download = list.details.name;
		downloadElement.href = URL.createObjectURL(blob);
		downloadElement.click();
	}
	function printAllsublists() {
		printDialog.showModal();
	}
	function handlePrintForm({ formData, cancel, submitter }: any) {
		printDialog.close();

		formData.append("sublists", JSON.stringify(sublists));

		if (submitter.innerText == "Cancel") {
			cancel();
		}
		return async ({ result }: any) => {
			const blob = new Blob([new Uint8Array(Object.values(JSON.parse(result.data.pdf)))], { type: "application/pdf" });
			const downloadElement = document.createElement("a");
			downloadElement.download = `${list.details.name} sublists`;
			downloadElement.href = URL.createObjectURL(blob);
			downloadElement.click();
		};
	}
	function createString(sublist: Sublist) {
		let tempString = "";
		for (const [unit, checked] of sublist.unitList) {
			if (checked) {
				tempString += `${unit.name} (${unit.skill}), `;
			}
		}
		return tempString;
	}
</script>

<!-- main sublist dialog -->
<dialog
	bind:this={sublistDialog}
	onclose={() => {
		showSublistModal = false;
	}}
	class="sublist-modal">
	<div class="dialog-body">
		<div class="space-between">
			<h2>sublists</h2>
			{#if layout != "mobile"}
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
							autoGenerationDialog.showModal();
						}}>Generate sublists</button>
					<button onclick={printAllsublists}>Print all sublists</button>
				</div>
			</div>
			<ul
				class="sublist-container"
				use:dndzone={{ items: sublists, dropTargetStyle }}
				onconsider={handleSort}
				onfinalize={handleSort}
				class:sublist-container-horizontal={layout == "horizontal" || layout == "mobile"}>
				{#each sublists as sublist, index (sublist.id)}
					{#if scenarioFilter == "All" || scenarioFilter == sublist.scenario}
						{#if layout == "vertical"}
							<li class="sublist-vertical" draggable="true">
								<div class="space-between">
									<select id={`scenario${sublist.index}`} bind:value={sublist.scenario}>
										{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
											<option value={scenario}>{scenario}</option>
										{/each}
									</select>
									<button onclick={() => editSublist(index)}>Edit</button>
								</div>
								<ul class="sublist-units-vertical">
									{#each sublist.unitList as [unit, checked]}
										{#if checked}
											<li>
												<div>{unit.name}</div>
												<div>{unit.skill}</div>
											</li>
										{/if}
									{/each}
								</ul>
								<ul class="sublist-stats">
									<li>PV: {`${sublist.pv}/250`}</li>
									<li>Units: {`${sublist.checked}/10`}</li>
									<li>Total Health: {sublist.health}</li>
									<li>Total Short: {sublist.short}</li>
									<li>Total Medium: {sublist.medium}</li>
									<li>Total Long: {sublist.long}</li>
									<li>Avg. Size: {sublist.size}</li>
								</ul>
								<div class="space-between">
									<button
										onclick={() => {
											printSubList(index);
										}}>Print Sublist</button>
									<button onclick={() => copySublist(index)}>Copy</button>
									<button onclick={() => deleteSublist(index)}>Delete</button>
								</div>
							</li>
						{:else if layout == "horizontal"}
							<li class="sublist-horizontal column">
								<div class="space-between">
									<div class="center gap8">
										<select id={`scenario${sublist.index}`} bind:value={sublist.scenario}>
											{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
												<option value={scenario}>{scenario}</option>
											{/each}
										</select>
										<button onclick={() => copySublist(index)}>Copy</button>
										<button onclick={() => editSublist(index)}>Edit</button>
									</div>
									<div class="center gap8">
										<button
											onclick={() => {
												printSubList(index);
											}}>Print Sublist</button>
										<button onclick={() => deleteSublist(index)}>Delete</button>
									</div>
								</div>
								<div class="sublist-units-horizontal gap8">
									{#each sublist.unitList as [unit, checked]}
										{#if checked}
											<div>{`${unit.name} (${unit.skill}),`}</div>
										{/if}
									{/each}
								</div>
								<div class="inline gap8">
									<div>PV: {`${sublist.pv}/250`}</div>
									<div>Units: {`${sublist.checked}/10`}</div>
									<div>Total Health: {sublist.health}</div>
									<div>Total Short: {sublist.short}</div>
									<div>Total Medium: {sublist.medium}</div>
									<div>Total Long: {sublist.long}</div>
									<div>Avg. Size: {sublist.size}</div>
								</div>
							</li>
						{:else if layout == "mobile"}
							<li class="sublist-mobile column">
								<div class="space-between">
									<select id={`scenario${sublist.index}`} bind:value={sublist.scenario}>
										{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
											<option value={scenario}>{scenario}</option>
										{/each}
									</select>
									<button onclick={() => copySublist(index)}>Copy</button>
									<button onclick={() => editSublist(index)}>Edit</button>
								</div>
								<div class="sublist-units-mobile">
									<div>{createString(sublist)}</div>
								</div>
								<div class="center gap8">
									<button
										onclick={() => {
											printSubList(index);
										}}>Print Sublist</button>
									<button onclick={() => deleteSublist(index)}>Delete</button>
								</div>
							</li>
						{/if}
					{/if}
				{/each}
				<li class:add-panel-vertical={layout == "vertical"} class:add-panel-horizontal={layout == "horizontal"} class:add-panel-mobile={layout == "mobile"}>
					<button onclick={addSublist}>+</button>
				</li>
			</ul>
		</main>
	</div>
</dialog>

<!-- Edit sublist dialog -->
<dialog
	bind:this={editSublistDialog}
	onclose={() => {
		selectedSublist = -1;
	}}
	class:dialog-wide={appWindow.isNarrow}>
	<div class="dialog-body">
		<div class="unit-selector">
			<p>Unit</p>
			<p>Skill</p>
			<p>PV</p>
			{#if tempSublist?.unitList.length}
				{#each tempSublist.unitList as [unit, checked], index}
					<div>
						<input type="checkbox" id={`checkbox${index.toString()}`} bind:checked={tempSublist.unitList[index][1]} onchange={() => handleCheck(unit, index)} /><label
							for={`checkbox${index.toString()}`}>{unit.name}</label>
					</div>
					<p>{unit.skill}</p>
					<p>{unit.cost}</p>
				{/each}
			{/if}
		</div>
		<div style:display="flex" style:gap="16px">
			<div>{`Units: ${tempSublist.checked}/10`}</div>
			<div>{`PV: ${tempSublist.pv}/250`}</div>
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

<!-- Auto list generation dialog -->
<dialog bind:this={autoGenerationDialog} class="auto-modal" class:dialog-wide={appWindow.isNarrow}>
	<div class="dialog-body">
		<div class="space-between">
			{#if !appWindow.isNarrow}
				<h1>Auto-generated sublists</h1>
			{/if}
			<p>Total Lists - {autosublists.length}</p>
			<button
				onclick={() => {
					autoGenerationDialog.close();
				}}>Close</button>
		</div>
		<div class:auto-main={layout != "mobile"} class:auto-main-mobile={layout == "mobile"}>
			<button
				class="accordian"
				class:hidden={!appWindow.isMobile}
				onclick={() => {
					showFilters = !showFilters;
				}}>
				<div class="space-between">
					<div></div>
					<div>Filters</div>
					<div>
						{#if showFilters}
							-
						{:else}
							+
						{/if}
					</div>
				</div>
			</button>
			<div class:hidden={appWindow.isNarrow && !showFilters}>
				<div class="options">
					<label for="autoMinPv">Min PV:</label>
					<input id="autoMinPv" type="number" bind:value={autoMinPV} />
					<label for="autoMaxPv">Max PV:</label>
					<input id="autoMaxPv" type="number" bind:value={autoMaxPV} />
					<div style:position="relative">
						<label for="autoMinUnitCost">Min unit PV:</label>
						<img
							src="/icons/information-outline.svg"
							alt="Min Unit info"
							class="button-icon"
							style:filter="var(--muted-filter)"
							onmouseenter={() => {
								showMinUnitInfoDropdown = true;
							}}
							onmouseleave={() => {
								showMinUnitInfoDropdown = false;
							}} />
						<div class="dropdown-content dropdown-bottom" class:dropdown-hidden={!showMinUnitInfoDropdown} class:dropdown-shown={showMinUnitInfoDropdown}>
							This tool can generate hundreds or thousands of combinations if you have cheap units. Recommend using this filter to get some basic sublists with a few points to
							spare, and then filling in cheaper units where you want them.
						</div>
					</div>
					<input id="autoMinUnitCost" type="number" bind:value={autoMinUnitCost} />
					<button onclick={generatesublists}>Generate sublists</button>
					<p>Additional filters coming soon...</p>
				</div>
			</div>
			<div class="auto-list-container">
				<div class="auto-list">
					<div>Units</div>
					<div class="center">Unit Count</div>
					<div class="center">PV</div>
				</div>
				{#each autosublists as sublist, index}
					<div class="auto-list">
						<div>{sublist.string}</div>
						<div class="center">{sublist.checked}</div>
						<div class="center">{sublist.pv}</div>
						<div class="center"><button style:padding="8px 16px" onclick={() => addAutoSublist(index)}>+</button></div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</dialog>

<dialog bind:this={printDialog} class:dialog-wide={appWindow.isNarrow}>
	<form action="/?/printsublists" method="post" use:enhance={handlePrintForm} class="padding8">
		<div class="inline column gap8">
			<div class="inline gap8"><input type="radio" name="sublistPrintLayout" id="vertical" value="vertical" checked /><label for="vertical">Vertical</label></div>
			<div class="inline gap8"><input type="radio" name="sublistPrintLayout" id="horizontal" value="horizontal" /><label for="horizontal">Horizontal</label></div>

			<div class="inline gap8">
				<input type="checkbox" name="sublistPrintGrouping" id="sublistPrintGroup" /><label for="sublistPrintGroup">Group sublists by scenario</label>
			</div>
		</div>
		<div class="center gap8">
			<button>Cancel</button>
			<button>Print</button>
		</div>
	</form>
</dialog>

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
		width: 100%;
		overflow-y: auto;
	}
	.sublist-container-horizontal {
		flex-direction: column;
	}
	ul {
		list-style-type: none;
		margin: 0;
		padding: 0;
		line-height: 1.5rem;
	}
	.add-panel-vertical,
	.add-panel-horizontal,
	.add-panel-mobile {
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
	.add-panel-vertical {
		height: 100%;
		width: 15%;
	}
	.add-panel-horizontal {
		height: 15%;
		width: 100%;
	}
	.add-panel-mobile {
		height: 10%;
		width: 100%;
	}
	.sublist-vertical {
		li {
			align-items: center;
			display: flex;
			justify-content: space-between;
			gap: 8px;
		}
		display: grid;
		grid-template-rows: 1.5rem 3fr 2fr 1.5rem;
		border: 1px solid var(--border);
		padding: 8px;
		gap: 8px;
		height: 100%;
		min-width: 15%;
		max-width: 15%;
		background-color: var(--card);
		color: var(--card-foreground);
		flex-shrink: 0;
	}
	.sublist-horizontal {
		border: 1px solid var(--border);
		padding: 8px;
		gap: 8px;
		min-height: 15%;
		width: 100%;
		background-color: var(--card);
		color: var(--card-foreground);
		flex-shrink: 0;
		justify-content: space-between;
	}
	.sublist-mobile {
		border-bottom: 1px solid var(--border);
		padding: 8px;
		min-height: 10%;
		width: 100%;
		font-size: 0.75rem;
	}
	.sublist-units-horizontal {
		display: flex;
		flex-wrap: wrap;
	}
	.sublist-units-mobile {
		display: flex;
		flex-wrap: wrap;
	}
	.unit-selector {
		label,
		p {
			font-size: 1.15rem;
		}
		display: grid;
		grid-template-columns: 5fr 1fr 1fr;
		gap: 4px;
		padding: 8px;
		align-items: center;
	}
	.dialog-buttons {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16px;
	}
	.auto-modal {
		width: 80%;
		height: 80%;
	}
	.auto-main {
		display: grid;
		grid-template-columns: 1fr 4fr;
		width: 100%;
		height: 100%;
	}
	.auto-main-mobile {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}
	.options {
		padding: 8px;
		height: 100%;
		width: 100%;
		background-color: var(--card);
		color: var(--card-foreground);
		border: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.auto-list-container {
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 24px;
		width: 100%;
		height: 100%;
	}
	.auto-list {
		display: grid;
		grid-template-columns: 10fr 1fr 1fr 1fr;
		gap: 16px;
	}
	.accordian {
		width: 100%;
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--card-foreground);
		padding: 8px;
	}
</style>
