<script lang="ts">
	import data from "$lib/data/erasFactionsList.json";
	import { eras, factions } from "$lib/data/erasFactionLookup.js";
	import { enhance } from "$app/forms";
	import { getMULResults } from "$lib/utilities/bt-utils.js";

	let status = $state<"waiting" | "loading" | "loaded">("waiting");
	let { form } = $props();
	let selectedEra = $state("-1");
	let selectedFaction = $state("-1");
	let allowedFactions = $derived.by(() => {
		let allowed: number[] = [];
		data.forEach((era) => {
			if (era.id == parseInt(selectedEra)) {
				era.factions.forEach((faction) => {
					allowed = allowed.concat(faction[1]);
				});
			}
		});
		allowed.sort((a, b) => {
			return factions.get(a)! > factions.get(b)! ? 1 : -1;
		});
		return allowed;
	});
	let general = $derived.by(() => {
		let result = -1;
		data.forEach((era) => {
			if (era.id == parseInt(selectedEra)) {
				era.factions.forEach((faction) => {
					//@ts-ignore
					if (faction[1].includes(parseInt(selectedFaction))) {
						//@ts-ignore
						result = faction[0];
					}
				});
			}
		});
		return result;
	});
	let submitDialog: HTMLDialogElement;
	let reportDialog: HTMLDialogElement;
	let tournamentDialog: HTMLDialogElement;

	async function handleForm({ formData, cancel }: any) {
		status = "loading";
		if (selectedEra == "-1") {
			status = "waiting";
			alert("Please choose an era");
			cancel();
		}
		if (selectedFaction == "-1") {
			status = "waiting";
			alert("Please choose an faction");
			cancel();
		}
		if (formData.get("pdf").name == "") {
			status = "waiting";
			alert("No pdf uploaded");
			cancel();
		}
		formData.append("general", general);

		let responses = await Promise.all([getMULResults(parseInt(selectedEra), parseInt(selectedFaction), general), getMULResults(parseInt(selectedEra), 4)]);
		let [unitList, uniqueList] = responses;

		formData.append("unitList", JSON.stringify(unitList));
		formData.append("uniqueList", JSON.stringify(uniqueList));

		return async ({ update }: any) => {
			status = "loaded";
			update({ reset: false });
		};
	}

	$effect(() => {
		if (status == "loading") {
			submitDialog.showModal();
		} else {
			submitDialog.close();
		}
	});
</script>

<main>
	<div class="validation">
		<form method="POST" enctype="multipart/form-data" use:enhance={handleForm} action="?/validate">
			<div class="card">
				<h3>Step 1: Choose Era and Faction to check list against</h3>
				<div class="selection">
					<label for="eraSelect">Era: </label>
					<select bind:value={selectedEra} name="eraSelect" id="eraSelect">
						{#each data as era}
							<option value={era.id}>{eras.get(era.id)}</option>
						{/each}
					</select>
					<label for="factionSelect">Faction: </label>
					{#if parseInt(selectedEra) == -1}
						<select disabled id="factionSelect"> </select>
					{:else}
						<select bind:value={selectedFaction} name="factionSelect" id="factionSelect">
							{#each allowedFactions as faction}
								<option value={faction}>{factions.get(faction)}</option>
							{/each}
						</select>
					{/if}
					<p>General List - <a href={`http://masterunitlist.info/Era/FactionEraDetails?FactionId=${selectedFaction}&EraId=${selectedEra}`}>{factions.get(general)}</a></p>
				</div>
			</div>
			<div class="card">
				<div>
					<h3>Step 2: Upload a pdf copy of your list from the Master Unit List and click submit</h3>
					<p>Note: As awesome as my list builder is (and others are), the validator can only check pdf's from the MUL at the moment</p>
				</div>
				<div class="buttons">
					<input type="file" name="pdf" id="pdf" />
					<button type="submit">Submit</button>
				</div>
			</div>
		</form>
		<div class="card">
			<h3>Step 3: Check there is no red below (and add flatbed trucks if there aren't any)</h3>
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
						{#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.pv[0]}
							<td class="valid">
								{form.valid.pv[1]}
							</td>
						{:else if form?.success}
							<td class="invalid">
								{form.valid.pv[1]}
							</td>
						{/if}
					</tr>
					<tr>
						<td>Total Units</td>
						<td>Total Units must be equal to or less than 16</td>
						{#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.unitNumber[0]}
							<td class="valid">{form.valid.unitNumber[1]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.unitNumber[1]}</td>
						{/if}
					</tr>
					<tr>
						<td>Total Mechs</td>
						<td>Total combined number of Battlemechs and Industrial Mechs must be equal to or less than 12</td>
						{#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.mechNumber[0]}
							<td class="valid">{form.valid.mechNumber[1]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.mechNumber[1]}</td>
						{/if}
					</tr>
					<tr>
						<td>Total Vehicles</td>
						<td>Total number of combat vehicles must be equal to or less than 8</td>
						{#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.cvNumber[0]}
							<td class="valid">{form.valid.cvNumber[1]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.cvNumber[1]}</td>
						{/if}
					</tr>
					<tr>
						<td>Total Infantry</td>
						<td>Total number of infantry (including BA) must be equal to or less than 5</td>
						{#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.infNumber[0]}
							<td class="valid">{form.valid.infNumber[1]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.infNumber[1]}</td>
						{/if}
					</tr>
					<tr>
						<td>Total Protomechs</td>
						<td>Total number of Protomechs must be equal to 0 or 5</td>
						{#if status == "waiting"}
							<td></td>
						{:else if form?.success && form.valid.proto[0]}
							<td class="valid">{form.valid.proto[1]}</td>
						{:else if form?.success}
							<td class="invalid">{form.valid.proto[1]}</td>
						{/if}
					</tr>
					<tr>
						<td>Unavailable Units</td>
						<td>Units are available to the selected faction in the selected era</td>
						{#if status == "waiting"}
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
						</td>
					</tr>
					<tr>
						<td>Invalid Unit Types</td>
						<td>Units must be Battlemechs, Industrial Mechs, Protomechs, Combat Vehicles, or Infantry</td>
						{#if status == "waiting"}
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
						</td>
					</tr>
					<tr>
						<td>Skill Threshold</td>
						<td>Unit Skill is a minimum of 2 and a maximum of 6</td>
						{#if status == "waiting"}
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
						</td>
					</tr>
					<tr>
						<td>Skill Combinations</td>
						<td>May only have two units at the extremes of the skill range</td>
						{#if status == "waiting"}
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
						</td>
					</tr>
					<tr>
						<td>Maximum Chassis</td>
						<td>You may have a maximum of 2 units with the same chassis</td>
						{#if status == "waiting"}
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
						</td>
					</tr>
					<tr>
						<td>Maximum Variants</td>
						<td>Each Mech must be a unique variant</td>
						{#if status == "waiting"}
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
						</td>
					</tr>
					<tr>
						<td>JMPS</td>
						<td>Combined total of JMPS must be equal to or less than 2</td>
						{#if status == "waiting"}
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
						</td>
					</tr>
					<tr>
						<td>DRO</td>
						<td>Units with the DRO special ability are prohibited</td>
						{#if status == "waiting"}
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
							{/if}</td>
					</tr>
					<tr>
						<td>Experimental Rules</td>
						<td>Units cannot have experimental rules</td>
						{#if status == "waiting"}
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
						</td>
					</tr>
					<tr>
						<td>Unknown Rules</td>
						<td>Units cannot have Unknown Rules</td>
						{#if status == "waiting"}
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
						</td>
					</tr>
					<tr>
						<td>Unique</td>
						<td>Unit must not be unique in the chosen era</td>
						{#if status == "waiting"}
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
							{/if}</td>
					</tr>
					<tr>
						<td>Trailer without Hitch</td>
						<td>Must have at least as many units with HTC as you have trailered units</td>
						{#if status == "waiting"}
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
						</td>
					</tr>
				</tbody>
			</table>
		</div>

		<div class="card">
			<h3>Step 4: Final steps</h3>
			<p>
				Fix list errors or double check any invalid units using this link:
				{#if status == "loaded"}
					<a href={`#`} target="_blank">{eras.get(parseInt(selectedEra))} Era - {factions.get(parseInt(selectedFaction))}</a>
				{:else}
					Era - None (Upload a list to activate link)
				{/if}
			</p>
		</div>
	</div>
	<div class="list">
		<div class="buttons">
			<button
				on:click={() => {
					tournamentDialog.showModal();
				}}
				>Create Tournament Link
			</button>
		</div>
		<div class="card">
			<p>
				A hopefully simple list validator for 350. Still undergoing testing but everything seems to work so far. I'm sure the MUL has some tricks waiting up it's sleeves to break
				this to hell.
			</p>
			<p>Hit me up on the wolfnet discord if you find any issues. (Jonathan "Terminal" Colton)</p>
		</div>
		<div class="card">
			<h4>Unit List:</h4>
			{#if form?.success}
				<ul>
					{#each form.unitArray as unit}
						<li>{unit[0]}</li>
					{/each}
				</ul>
			{:else}
				<p>Upload a list to show units</p>
			{/if}
		</div>
	</div>
</main>

<dialog bind:this={submitDialog}>
	<div class="dialog-body">
		<h2>Analyzing list, please wait.</h2>
		<img src="/animation.gif" alt="loading" style="width: 200px;height:150px" />
	</div>
</dialog>
<dialog bind:this={reportDialog}>
	<div class="dialog-body">
		<form
			action="/?/report"
			method="post"
			use:enhance={() => {
				reportDialog.close();
			}}>
			<p>
				Obviously I'd like everything to work without issues, but if you're here it doesn't look like it did. Please enter the details of the issue below and I will see what I can
				do. Feel free to leave your name on discord or your email (completely optional) if you'd like an update if the issue needs one.
			</p>
			<textarea name="issue" id="issue" cols="30" rows="10"></textarea>
			<button type="submit">Submit</button>
		</form>
	</div>
</dialog>
<dialog bind:this={tournamentDialog}>
	<div class="dialog-body">
		<form
			class="tournamentDialog"
			action="?/createTournament"
			method="post"
			use:enhance={() => {
				tournamentDialog.close();
			}}>
			<p>
				Please enter the details in the lines below. After clicking submit you will receive an email at the address provided with a link that can be shared with your players. When
				they validate and submit the list using that link, you will receive an email with their name, list, and validation status.
			</p>
			<!-- <label for="organizerName">Organizer Name:</label> <input type="text" name="organizerName" id="organizerName" required />
			<label for="emailAddress">Organizer Email:</label> <input type="email" name="emailAddress" id="emailAddress" required /> -->
			<label for="tournamentName">Tournament Name:</label> <input type="text" name="tournamentName" id="tournamentName" required />
			<!-- <label for="tournamentDate">Date:</label><input type="date" name="tournamentDate" id="tournamentDate" /> -->
			<!-- <label for="tournamentEra">Era:</label><select name="tournamentEra" id="tournamentEra" required>
				{#each data as era}
					<option value={era.id}>{eras.get(era.id)}</option>
				{/each}</select> -->
			<button type="submit">Submit</button>
		</form>
	</div>
</dialog>

<style>
	main {
		display: flex;
	}
	.validation {
		width: 70%;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.list {
		display: flex;
		flex-direction: column;
		padding: 8px;
		width: 30%;
		gap: 8px;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	h3 {
		margin: 0;
	}
	p {
		margin: 0;
		margin-top: 8px;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.selection,
	.buttons {
		display: flex;
		gap: 16px;
		align-items: center;
	}
	select {
		width: 240px;
	}
	table {
		border-collapse: collapse;
	}
	td {
		height: 1.5rem;
		border: 1px solid var(--muted-foreground);
		padding: 8px;
		font-size: 0.75rem;
	}
	.valid {
		text-align: center;
		background-color: var(--primary);
		color: var(--primary-foreground);
	}
	.invalid {
		text-align: center;
		background-color: var(--error);
		color: var(--error-foreground);
	}
	.dialog-body {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.tournamentDialog {
		width: 350px;
	}
</style>
