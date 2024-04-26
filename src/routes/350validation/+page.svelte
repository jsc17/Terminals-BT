<script lang="ts">
	import eraList from "$lib/data/erasFactionsList.json";
	import { eras, factions } from "$lib/data/erasFactionLookup";
	import { enhance } from "$app/forms";

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
		tournamentList.push({ id: Number(tournament.id), name: tournament.name, organizer: tournament.organizer, era: Number(tournament.era), date: new Date(tournament.date) });
	}
	let selectedTournament = $state<number>(-1);
	let selectedEra = $state<number>(-1);
	let selectedFaction = $state<number>(-1);
	let uploadType = $state<"mul" | "terminal" | "jeff">("mul");
	let unitList = $state<UnitPreview[]>([]);
	let status = $state<"waiting" | "loading" | "loaded">("waiting");
	let issueList = $state<Issue[]>([]);

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
</script>

<main>
	<section>
		<div class="card split">
			<div class="selection">
				<label for="tournamentSelect">Tournament: </label>
				<select name="tournamentSelect" id="tournamentSelect" bind:value={selectedTournament}>
					<option value={-1}>None</option>
					{#each tournamentList as tournament, index}
						<option value={index} selected={tournament.id == Number(data.id)}>{tournament.name}</option>
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
					<p>{tournamentList[selectedTournament].date.toDateString()}</p>
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
							<label for="uploadData">List Code:</label>
							<input type="text" name="uploadData" id="uploadData" />
							<button type="button">Paste</button>
						</div>
						<div class="center">-or-</div>
						<div class="inline">
							<p>Load from saved Lists: (not implemented yet)</p>
							<button
								disabled
								type="button"
								on:click={() => {
									console.log("test");
								}}>Load</button>
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
										<td></td>
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
					<p>Unit names in red haven't been found in the era and faction selected.</p>
					<p>Error fixing will be coming but will require some work on the backend, and I've let enough tangents delay putting out a version one of this page already.</p>
					<p>
						For now, please double check your list and the units faction/era availability, and if it should be valid but isn't, you will have a chance to attach a note when you
						submit the list.
					</p>
				</div>
			</div>
			<form class="center" method="post" action="?/validate" use:enhance={handleValidationForm}>
				<button disabled={unitList.length == 0}>Validate</button>
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
				<p>No issues found</p>
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
	</section>
</main>

<dialog>
	<table>
		<colgroup>
			<col style="width:15%" />
			<col style="width:45%" />
			<col style="width:5%" />
			<col style="width:30%" />
		</colgroup>
		<tbody>
			<tr>
				<td>List PV</td>
				<td>List may have a maximum of 350 total PV</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.pv[0]}
							<td class="valid">
								{form.valid.pv[1]}
							</td>
						{:else if form?.success}
							<td class="invalid">
								{form.valid.pv[1]}
							</td>
						{/if} -->
			</tr>
			<tr>
				<td>Total Units</td>
				<td>Total Units must be equal to or less than 16</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.unitNumber[0]}
							<td class="valid">{form.valid.unitNumber[1]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.unitNumber[1]}</td>
						{/if} -->
			</tr>
			<tr>
				<td>Total Mechs</td>
				<td>Total combined number of Battlemechs and Industrial Mechs must be equal to or less than 12</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.mechNumber[0]}
							<td class="valid">{form.valid.mechNumber[1]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.mechNumber[1]}</td>
						{/if} -->
			</tr>
			<tr>
				<td>Total Vehicles</td>
				<td>Total number of combat vehicles must be equal to or less than 8</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.cvNumber[0]}
							<td class="valid">{form.valid.cvNumber[1]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.cvNumber[1]}</td>
						{/if} -->
			</tr>
			<tr>
				<td>Total Infantry</td>
				<td>Total number of infantry (including BA) must be equal to or less than 5</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.infNumber[0]}
							<td class="valid">{form.valid.infNumber[1]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.infNumber[1]}</td>
						{/if} -->
			</tr>
			<tr>
				<td>Total Protomechs</td>
				<td>Total number of Protomechs must be equal to 0 or 5</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.proto[0]}
							<td class="valid">{form.valid.proto[1]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.proto[1]}</td>
						{/if} -->
			</tr>
			<tr>
				<td>Unavailable Units</td>
				<td>Units are available to the selected faction in the selected era</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.unitsUnavailable[0]}
							<td class="valid"></td>
						{:else if form?.success}
							<td class="invalid"></td>
						{/if}
						<td>
							{#if form?.success && !form.valid.unitsUnavailable[0]}
								{#each form.valid.unitsUnavailable[1] as unit}
									{unit + ", "}
								{/each}
							{/if}
						</td> -->
			</tr>
			<tr>
				<td>Invalid Unit Types</td>
				<td>Units must be Battlemechs, Industrial Mechs, Protomechs, Combat Vehicles, or Infantry</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.unallowedType[0]}
							<td class="valid"></td>
						{:else if form?.success}
							<td class="invalid"></td>
						{/if}
						<td>
							{#if form?.success && !form.valid.unallowedType[0]}
								{#each form.valid.unallowedType[1] as unit}
									{unit + ", "}
								{/each}
							{/if}
						</td> -->
			</tr>
			<tr>
				<td>Skill Threshold</td>
				<td>Unit Skill is a minimum of 2 and a maximum of 6</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.skillThreshold[0]}
							<td class="valid"></td>
						{:else if form?.success}
							<td class="invalid"></td>
						{/if}
						<td>
							{#if form?.success && !form.valid.skillThreshold[0]}
								{#each form.valid.skillThreshold[1] as unit}
									{unit + ", "}
								{/each}
							{/if}
						</td> -->
			</tr>
			<tr>
				<td>Skill Combinations</td>
				<td>May only have two units at the extremes of the skill range</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.skillCombo[0]}
							<td class="valid">{form.valid.skillCombo[2]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.skillCombo[2]}</td>
						{/if}
						<td>
							{#if form?.success && !form.valid.skillCombo[0]}
								{#each form.valid.skillCombo[1] as unit}
									{unit + ", "}
								{/each}
							{/if}
						</td> -->
			</tr>
			<tr>
				<td>Maximum Chassis</td>
				<td>You may have a maximum of 2 units with the same chassis</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.chassis[0]}
							<td class="valid"></td>
						{:else if form?.success}
							<td class="invalid"></td>
						{/if}
						<td>
							{#if form?.success && !form.valid.chassis[0]}
								{#each form.valid.chassis[1] as unit}
									{unit + ", "}
								{/each}
							{/if}
						</td> -->
			</tr>
			<tr>
				<td>Maximum Variants</td>
				<td>Each Mech must be a unique variant</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.variant[0]}
							<td class="valid"> </td>
						{:else if form?.success}
							<td class="invalid"></td>
						{/if}
						<td>
							{#if form?.success && !form.valid.variant[0]}
								{#each form.valid.variant[1] as unit}
									{unit + ", "}
								{/each}
							{/if}
						</td> -->
			</tr>
			<tr>
				<td>JMPS</td>
				<td>Combined total of JMPS must be equal to or less than 2</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.jmps[0]}
							<td class="valid">{form.valid.jmps[2]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.jmps[2]}</td>
						{/if}
						<td>
							{#if form?.success && !form.valid.jmps[0]}
								{#each form.valid.jmps[1] as unit}
									{unit + ", "}
								{/each}
							{/if}
						</td> -->
			</tr>
			<tr>
				<td>DRO</td>
				<td>Units with the DRO special ability are prohibited</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.dro[0]}
							<td class="valid"></td>
						{:else if form?.success}
							<td class="invalid"></td>
						{/if}
						<td>
							{#if form?.success && !form.valid.dro[0]}
								{#each form.valid.dro[1] as unit}
									{unit + ", "}
								{/each}
							{/if}</td> -->
			</tr>
			<tr>
				<td>Experimental Rules</td>
				<td>Units cannot have experimental rules</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.experimental[0]}
							<td class="valid"></td>
						{:else if form?.success}
							<td class="invalid"></td>
						{/if}
						<td>
							{#if form?.success && !form.valid.experimental[0]}
								{#each form.valid.experimental[1] as unit}
									{unit + ", "}
								{/each}
							{/if}
						</td> -->
			</tr>
			<tr>
				<td>Unknown Rules</td>
				<td>Units cannot have Unknown Rules</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.unknown[0]}
							<td class="valid"></td>
						{:else if form?.success}
							<td class="invalid"></td>
						{/if}
						<td>
							{#if form?.success && !form.valid.unknown[0]}
								{#each form.valid.unknown[1] as unit}
									{unit + ", "}
								{/each}
							{/if}
						</td> -->
			</tr>
			<tr>
				<td>Unique</td>
				<td>Unit must not be unique in the chosen era</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.unique[0]}
							<td class="valid"></td>
						{:else if form?.success}
							<td class="invalid"></td>
						{/if}
						<td>
							{#if form?.success && !form.valid.unique[0]}
								{#each form.valid.unique[1] as unit}
									{unit + ", "}
								{/each}
							{/if}</td> -->
			</tr>
			<tr>
				<td>Trailer without Hitch</td>
				<td>Must have at least as many units with HTC as you have trailered units</td>
				<!-- {#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.trailer[0]}
							<td class="valid"></td>
						{:else if form?.success}
							<td class="invalid"></td>
						{/if}
						<td>
							{#if form?.success && !form.valid.trailer[0]}
								Trailers: {form.valid.trailer[1].toString()} Hitch: {form.valid.trailer[2].toString()}
							{/if}
						</td> -->
			</tr>
		</tbody>
	</table>
</dialog>

<style>
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
</style>
