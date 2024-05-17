<script lang="ts">
	import eraList from "$lib/data/erasFactionsList.json";
	import { eras, factions } from "$lib/data/erasFactionLookup";
	import { enhance, deserialize } from "$app/forms";

	interface UnitPreview {
		id: string;
		name: string;
		mulId: number;
		skill: number;
		pv: number;
		link: string;
	}

	interface Issue {
		id: string;
		title: string;
		description: string;
		number: string;
		violatingUnits: string[];
	}

	let { data } = $props();
	let tournamentList = $state<{ id: number; name: string; organizer: string; era: number; date: Date }[]>([]);
	for (const tournament of data.tournamentList) {
		tournamentList.push({
			id: Number(tournament.id),
			name: tournament.name,
			organizer: tournament.organizer,
			era: Number(tournament.era),
			date: new Date(tournament.tournament_date)
		});
	}
	let selectedTournament = $state<number>(-1);
	let selectedEra = $state<number>(-1);
	let selectedFaction = $state<number>(-1);
	let uploadType = $state<"mul" | "terminal" | "jeff">("mul");
	let unitList = $state<UnitPreview[]>([]);
	let selectedUnit = $state(-1);
	let selectedReplacement = $state(-1);
	let filterValue = $state("");
	let unitData = $state<{ name: string; mulId: number }[]>([]);
	let status = $state<"waiting" | "loading" | "loaded">("waiting");
	let issueList = $state<Issue[]>([]);
	let fixUnitDialog: HTMLDialogElement;
	let loadListDialog: HTMLDialogElement;
	let savedLists = $state<{ name: string; era: number; faction: number; units: string; sublists: string }[]>([]);
	let selectedList = $state(-1);
	let listCode = $state("");

	$effect(() => {
		if (selectedTournament != -1) {
			selectedEra = tournamentList[selectedTournament].era;
		}
	});

	let availableFactions = $derived.by(() => {
		let available: number[] = [];
		eraList.forEach((era) => {
			if (era.id == selectedEra) {
				era.factions.forEach((faction) => {
					available = available.concat(faction[1]);
				});
			}
		});
		available.sort((a, b) => {
			return factions.get(a)! > factions.get(b)! ? 1 : -1;
		});
		return available;
	});

	function handleUploadForm({ formData, cancel }: { formData: FormData; cancel: any }) {
		if (selectedEra == -1) {
			alert("Please select an era");
			cancel();
		} else {
			formData.append("era", selectedEra.toString());
		}
		if (selectedEra == -1) {
			alert("Please select a faction");
			cancel();
		} else {
			formData.append("faction", selectedFaction.toString());
		}
		return async ({ result }: any) => {
			if (result.status == 200) {
				unitList = JSON.parse(result.data.unitList);
			} else {
				alert(result.data.message);
			}
		};
	}
	function handleValidationForm({ formData, cancel }: { formData: FormData; cancel: any }) {
		if (unitList.length == 0) {
			cancel();
		} else {
			status = "loading";
		}
		formData.append("era", selectedEra.toString());
		formData.append("faction", selectedFaction.toString());
		formData.append("unitList", JSON.stringify(unitList));

		return async ({ result }: any) => {
			if (result.status == 200) {
				status = "loaded";
				issueList = JSON.parse(result.data.issueList);
			} else {
				alert(result.data.message);
			}
		};
	}
	function handleSubmitForm({ formData, cancel }: { formData: FormData; cancel: any }) {
		const message = formData.get("message") as string;
		if (issueList.length && !message?.length) {
			alert("Must include a message to the TO when submitting a list with issues");
			cancel();
		}
		formData.append("id", tournamentList[selectedTournament].id.toString());
		formData.append("unitList", JSON.stringify(unitList));
		formData.append("issueList", JSON.stringify(issueList));
		formData.append("era", selectedEra.toString());
		formData.append("faction", selectedFaction.toString());
	}
	function fixUnit(index: number) {
		selectedUnit = index;
		fixUnitDialog.showModal();
		if (!unitData.length) {
			fetch("?/getUnits", { method: "POST", body: "" }).then((response) => {
				response.text().then((value) => {
					const result: any = deserialize(value);
					unitData = JSON.parse(result.data.unitList);
				});
			});
		}
	}
	function openListDialog() {
		loadListDialog.showModal();
		fetch("?/getUserLists", {
			method: "POST",
			body: ""
		}).then((response) => {
			response.text().then((value) => {
				const result: any = deserialize(value);
				if (result.status == 200) {
					savedLists = result.data.lists;
				} else {
					alert(result.data.message);
				}
			});
		});
	}
	function selectRow(index: number) {
		selectedList = index;
	}
	function loadList() {
		const formData = new FormData();
		if (selectedEra != -1 && selectedFaction != -1) {
			formData.append("era", selectedEra.toString());
			formData.append("faction", selectedFaction.toString());
			formData.append("uploadType", "terminalSaved");
			formData.append("uploadData", savedLists[selectedList].units);

			fetch("?/parseUnits", { method: "POST", body: formData }).then((response) => {
				response.text().then((value) => {
					const result: any = deserialize(value);
					if (result.status == 200) {
						unitList = JSON.parse(result.data.unitList);
					} else {
						alert(result.data.message);
					}
				});
			});
		} else {
			alert("Must select era and faction");
		}
		loadListDialog.close();
	}
</script>

<main>
	<section>
		<div class="card split">
			<div class="selection">
				<label for="tournamentSelect">Tournament: </label>
				<select name="tournamentSelect" id="tournamentSelect" bind:value={selectedTournament}>
					<option value={-1}>None</option>
					{#each tournamentList as tournament, index}
						<option value={index} selected={tournament.id == Number(data.id)}>{`${tournament.name} - ${tournament.date.toUTCString().split(" ").slice(1, 4).join(" ")}`}</option>
					{/each}
				</select>

				<label for="eraSelect">Era: </label>
				<select bind:value={selectedEra} name="eraSelect" id="eraSelect" disabled={selectedTournament != -1 && tournamentList[selectedTournament].era != -1}>
					{#each eraList as era}
						<option value={era.id}>{eras.get(era.id)}</option>
					{/each}
				</select>
				<label for="factionSelect">Faction: </label>
				<select bind:value={selectedFaction} name="factionSelect" id="factionSelect" disabled={selectedEra == -1}>
					{#each availableFactions as faction}
						<option value={faction}>{factions.get(faction)}</option>
					{/each}
				</select>
			</div>
			<div class="selection">
				{#if selectedTournament != -1}
					<p>Event Name:</p>
					<p>{tournamentList[selectedTournament].name}</p>
					<p>Date:</p>
					<p>{tournamentList[selectedTournament].date.toUTCString().split(" ").slice(0, 4).join(" ")}</p>
					<p>Hosted by:</p>
					<p>{tournamentList[selectedTournament].organizer}</p>
					<p>Era:</p>
					<p>{tournamentList[selectedTournament].era != -1 ? eras.get(tournamentList[selectedTournament].era) : "Any"}</p>
				{:else}
					<p>Event Name:</p>
					<div></div>
					<p>Date:</p>
					<div></div>
					<p>Hosted by:</p>
					<div></div>
					<p>Era:</p>
				{/if}
			</div>
		</div>
		<form class="card column" method="post" action="?/parseUnits" enctype="multipart/form-data" use:enhance={handleUploadForm}>
			<div class="split">
				<div class="selection">
					<label for="uploadType">Import type:</label>
					<select id="uploadType" name="uploadType" bind:value={uploadType}>
						<option value="mul">MUL PDF upload</option>
						<option value="terminal">Terminal's List builder</option>
						<option disabled value="jeff">Jeff's Battletech Tools json import</option>
					</select>
				</div>
				<div class="column">
					{#if uploadType == "mul"}
						<input type="file" name="uploadData" id="uploadData" required />
					{:else if uploadType == "terminal"}
						<div class="inline">
							<p>Load from saved Lists:</p>
							<button
								type="button"
								on:click={() => {
									openListDialog();
								}}>Load</button>
						</div>

						<div class="center">-or-</div>
						<div class="inline">
							<label for="uploadData">List Code:</label>
							<input type="text" name="uploadData" id="uploadData" bind:value={listCode} />
							<button
								type="button"
								on:click={() => {
									navigator.clipboard.readText().then((text) => {
										listCode = text;
									});
								}}>Paste</button>
						</div>
					{:else if uploadType == "jeff"}
						<input type="file" name="uploadData" id="uploadData" />
					{/if}
				</div>
			</div>
			<div class="center">
				<button>Submit</button>
			</div>
		</form>
		<div class="card column">
			<h2>Unit Preview</h2>
			<div class="split">
				<div class="column">
					<table>
						<colgroup>
							<col style="width:70%" />
							<col style="width:10%" />
							<col style="width:10%" />
							<col style="width:10%" />
						</colgroup>
						<thead>
							<tr>
								<th>Unit name</th>
								<th>Skill</th>
								<th>PV</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{#each Array(16) as _, index}
								{#if index < unitList.length}
									<tr>
										{#if unitList[index].mulId}
											<td><a href={unitList[index].link} target="_blank">{unitList[index].name}</a></td>
										{:else}
											<td style="color:var(--error)">{unitList[index].name}</td>
										{/if}
										<td>{unitList[index].skill}</td>
										<td>{unitList[index].pv}</td>
										<td>
											{#if !unitList[index].mulId}
												<button on:click={() => fixUnit(index)}>Fix</button>
											{/if}
										</td>
									</tr>
								{:else}
									<tr>
										<td>&nbsp;</td>
										<td></td>
										<td></td>
										<td></td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
				<div class="column">
					<p>Unit names in green have been successfully found.</p>
					<p>Unit names in red haven't been successfully parsed from a pdf upload. You'll need to fix it before moving on to the next step, or it throws everything off.</p>
					<p>
						There shouldn't be many, but if you find any, can you please click the settings button and create a report so I can try and figure out why it's not reading correctly.
					</p>
				</div>
			</div>
			<form class="center" method="post" action="?/validate" use:enhance={handleValidationForm}>
				<button
					disabled={unitList.length == 0 ||
						unitList.findIndex((unit) => {
							return unit.mulId == 0;
						}) != -1}>Validate</button>
			</form>
		</div>
	</section>
	<section>
		<div class="card" style="min-height:130px">
			<h1>Issues</h1>

			{#if status == "waiting"}
				<br />
				<p>Please upload list to view issues</p>
			{:else if status == "loading"}
				<br />
				<div class="inline">
					<p>Validating</p>
					<img src="/loading.gif" alt="loading" style="height:50px" />
				</div>
			{:else if status == "loaded" && issueList.length == 0}
				<p>No issues found ✅</p>
			{:else}
				<table>
					<colgroup>
						<col style="width:15%" />
						<col style="width:45%" />
						<col style="width:5%" />
						<col style="width:30%" />
					</colgroup>
					<tbody>
						{#each issueList as issue}
							<tr>
								<td>{issue.title}</td>
								<td>{issue.description}</td>
								<td>{issue.number}</td>
								<td>{issue.violatingUnits}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
		<form class="card column" method="post" action="?/submit" use:enhance={handleSubmitForm}>
			<h1>Tournament Upload</h1>
			<p>Fill out the fields below to submit your list to the tournament organizer:</p>
			<div class="inline"><label for="name">Name (required):</label><input type="text" id="name" name="name" required /></div>
			<div class="inline"><label for="email">Email Address (optional: will be shared with tournament organizer):</label><input type="email" name="email" id="email" /></div>
			<label for="message">Message to organizer:</label>
			<textarea name="message" id="message" rows="5" maxlength="500"></textarea>
			<div class="center"><button disabled={status != "loaded"}>Submit</button></div>
		</form>
		<div class="card">
			<a href="/tournament">Click here to create or manage your tournaments</a>
		</div>
	</section>
</main>

<dialog bind:this={loadListDialog}>
	<div class="dialog-body">
		<div class="space-between">
			<h1>User Lists</h1>
			<button
				on:click={() => {
					loadListDialog.close();
				}}>Close</button>
		</div>
		<div class="table-container">
			<table class="saved-lists">
				<colgroup>
					<col style="width:50%" />
					<col style="width:20%" />
					<col style="width:30%" />
				</colgroup>
				<tbody>
					{#if savedLists.length}
						{#each savedLists as savedList, index}
							<tr class:selected={selectedList == index} on:click={() => selectRow(index)}>
								<td>{savedList.name}</td>
								<td>{eras.get(savedList.era)}</td>
								<td>{factions.get(savedList.faction)}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
		<button
			on:click={() => {
				loadList();
			}}>Load</button>
	</div>
</dialog>

<dialog bind:this={fixUnitDialog}>
	<div class="dialog-body">
		<div class="space-between">
			<p>Fix unidentified unit</p>
			<button
				on:click={() => {
					fixUnitDialog.close();
				}}>Close</button>
		</div>
		<p>Please select the correct unit from the below list for: <span style="color:var(--primary)">{selectedUnit != -1 ? unitList[selectedUnit].name : "Null"}</span></p>
		<div class="space-between">
			<div class="inline"><label for="filterUnit">Filter:</label><input type="text" name="filterUnit" id="filterUnit" bind:value={filterValue} /></div>
			<button
				on:click={() => {
					if (selectedReplacement != -1) {
						unitList[selectedUnit].mulId = selectedReplacement;
						fixUnitDialog.close();
					}
				}}>Select</button>
		</div>
		<div class="fix-unit-table">
			<table style="display:block">
				<tbody>
					{#if unitData.length}
						{#each unitData as unit}
							{#if unit.name.toLowerCase().includes(filterValue.toLowerCase())}
								<tr
									on:click={() => {
										selectedReplacement = unit.mulId;
									}}
									class:selected={unit.mulId == selectedReplacement}><td>{unit.name}</td></tr>
							{/if}
						{/each}
					{:else}
						<tr><td>Loading...</td></tr>
					{/if}
				</tbody>
			</table>
		</div>
	</div>
</dialog>

<style>
	.dialog-body {
		* {
			flex-shrink: 0;
		}
	}
	.card {
		flex-shrink: 0;
	}
	main {
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: 16px;
		gap: 8px;
		height: 100%;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 8px;
		height: 100%;
	}
	.selection {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 2fr;
		gap: 8px;
		align-items: center;
	}
	select:not([disabled]) {
		border: 1px solid var(--ring);
	}
	select {
		width: 100%;
		height: 1.5rem;
	}
	.split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	input[type="file"] {
		height: 1.5rem;
	}
	h2 {
		margin: 0;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		border: 1px solid var(--border);
		overflow: auto;
	}
	th,
	td {
		border: 1px solid var(--border);
		line-height: 1.5rem;
	}
	textarea {
		background-color: var(--popover);
		color: var(--popover-foreground);
		border: 1px solid var(--border);
	}
	input {
		background-color: var(--popover);
		color: var(--popover-foreground);
		border: 1px solid var(--border);
	}
	.selected {
		box-shadow: 5px 0px 5px var(--primary) inset;
	}
	.fix-unit-table {
		height: 500px;
		overflow: auto;
	}
	.table-container {
		min-width: 100%;
		height: 100%;
		overflow-y: auto;
		background-color: var(--card);
	}
</style>
