<script lang="ts">
	import { getEraName, getEras, getFactionsInEra, getGeneralId } from "$lib/remote/era-faction.remote";
	import { getApprovedTournamentList, submitList } from "../../lib/remote/tournament.remote";
	import { validateRules } from "$lib/rulesValidation/validateList";
	import { toastController } from "$lib/stores";
	import { getRulesByName, ruleSets } from "$lib/types/rulesets";
	import { createAbilityLineString } from "$lib/utilities/abilityUtilities";
	import FixModal from "./FixModal.svelte";
	import { getUnitData, type ValidationUnitData } from "./validate.remote";
	import { Checkbox, DropdownMenu } from "bits-ui";

	let selectedRules = $state("wn350v3");
	let files = $state<FileList>();

	let selectedEra = $state<number>(10);
	let selectedFaction = $state<number>(102);

	let eraList = $derived(getEras());
	let factionList = $derived(await getFactionsInEra([selectedEra]));

	let tournamentListPromise = getApprovedTournamentList();
	let tournamentList = $derived(tournamentListPromise.current?.data ?? []);
	let selectedTournament = $derived(tournamentList[0]);

	let unitData = $state<ValidationUnitData[]>([]);

	let issues = $state<{ issueList: Map<string, Set<string>> }>();

	let submitApproval = $state(false);
	const selectedEraMatchesTournament = $derived.by(() => {
		if (selectedTournament.era == null) return true;
		if (selectedTournament.era == selectedEra) return true;
		return false;
	});

	async function handleValidation() {
		if (getUnitData.result?.status == "success") {
			const unitList =
				unitData
					?.filter((res) => {
						return res.mulData != undefined;
					})
					.map((data) => {
						return { id: data.id, skill: data.skill, data: data.mulData! };
					}) ?? [];
			if (unitList?.length == unitData?.length) {
				const general = (await getGeneralId({ era: selectedEra, faction: selectedFaction }))?.general;
				const factions = general ? [selectedFaction, general] : [selectedFaction];
				issues = await validateRules(unitList, [selectedEra], factions, selectedRules);
			} else {
				alert("not all units are valid");
			}
		}
	}
</script>

<svelte:head>
	<title>Terminals Validation</title>
</svelte:head>

<svelte:boundary>
	{#snippet pending()}
		<p>Loading Validation Data...</p>
	{/snippet}
	<main>
		<div class="validation-body">
			<form
				class="section"
				enctype="multipart/form-data"
				{...getUnitData.enhance(async ({ submit }) => {
					issues = undefined;
					await submit();
					if (getUnitData.result?.status == "success") {
						unitData = getUnitData.result.data ?? [];
					} else {
						toastController.addToast(getUnitData.result?.message ?? "Invalid message recieved");
					}
				})}
			>
				<p class="muted">
					MUL or Terminal PDF's only, others will probably error out, but at the very least will not read correctly. Formations printed in the unit table will break the parsing
				</p>

				<div class="inline">
					<input type="file" name="listFile" id="listFile" accept="application/pdf" required bind:files />
				</div>
				<p class="muted">Select an Era and Faction to check unit availability. If you change this, please click "Get Data" again</p>
				<div class="inline">
					<label>
						Era:
						<select name="selectedEra" bind:value={selectedEra} required onchange={() => (unitData = [])}>
							{#each await eraList as era}
								<option value={era.id}>{era.name}</option>
							{/each}
						</select>
					</label>
					<label
						>Faction:
						<select name="selectedFaction" bind:value={selectedFaction} required>
							{#each await factionList as faction}
								<option value={faction.factionId}>{faction.faction.name}</option>
							{/each}
						</select>
					</label>
					<button>Get Data</button>
				</div>
			</form>
			<div class="section">
				<div class="section-header">
					Unit Data: <span class="muted">(Unless it doesn't read the units from the pdf correctly, you shouldn't have to do anything in this section)</span>
				</div>
				<table>
					<thead>
						<tr>
							<th>MUL</th>
							{#each ["Name", "Skill", "PV", "Rules", "Type", "Abilities", "Available", "Unique"] as header}
								<th>{header}</th>
							{/each}
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each unitData ?? [] as unit, index (unit.id)}
							<tr>
								<td>
									{#if unit.link}
										<a href={unit.link} target="_blank">Link</a>
									{:else}
										Not Found
									{/if}
								</td>
								{#each [unit.name, unit.skill, unit.pv, unit.mulData?.rulesLevel, unit.mulData?.subtype, createAbilityLineString(unit.mulData?.abilities ?? []), unit.available, unit.unique] as data}
									<td>{data ?? "-"}</td>
								{/each}
								<td>
									{#if !unit.mulData}
										<FixModal bind:unit={unitData![index]} era={selectedEra} faction={selectedFaction} />
									{:else}
										<span style="color: green; font-weight: bold;">✔</span>
									{/if}
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="10">Upload a file to display units</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="section">
				<div class="inline">
					<label>
						Rules:
						<select name="selectedRules" bind:value={selectedRules} onchange={() => (issues = undefined)}>
							{#each ruleSets as rules}
								<option value={rules.name}>{rules.display}</option>
							{/each}
						</select>
					</label>
					<button onclick={handleValidation}>Validate</button>
				</div>
				{#if issues}
					{#if issues.issueList.size}
						<table>
							<thead>
								<tr>
									<th>Issue</th>
									<th>Problem Units</th>
								</tr>
							</thead>
							<tbody>
								{#each issues.issueList as [issue, units]}
									<tr>
										<td class="error">{issue}</td>
										<td>{Array.from(units).join(", ")}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					{:else}
						<p>No List issues found!! If you are submitting this for a tournament, please select the tournament and submit it below</p>
					{/if}
				{/if}
			</div>
			{#if issues != undefined && issues?.issueList.size == 0}
				<form
					class="section"
					enctype="multipart/form-data"
					{...submitList.enhance(async ({ data, submit }) => {
						if (files) {
							data.append("listFile", files[0]);
							await submit();
							toastController.addToast(submitList.result?.message ?? "Invalid Message Received");
						}
					})}
				>
					<p class="muted">If you will be submitting this list to a tournament organizer, please validate the list above and then select the correct tournament</p>
					{#if tournamentList.length == 0}
						<h2>No currently active tournaments</h2>
					{:else}
						<label
							>Tournament <select bind:value={selectedTournament}>
								{#each tournamentList as tournament}
									<option value={tournament}>{tournament.name}</option>
								{/each}
							</select></label
						>
					{/if}
					{#if selectedTournament}
						<div class="tournament-details">
							<p>Tournament Date:</p>
							<p>{selectedTournament.tournament_date.toDateString()}</p>
							{#if selectedTournament.location}
								<p>Location:</p>
								<p>{selectedTournament.location}</p>
							{/if}
							{#if selectedTournament.era}
								<p>Required Era:</p>
								<p>{await getEraName(selectedTournament.era)}</p>
							{:else}
								<p>Era: Any Era</p>
							{/if}
							<p>Rules:</p>
							<p>{getRulesByName(selectedTournament.tournamentRules)?.display}</p>
						</div>
						<label>Player Name: <input type="text" name="playerName" required /></label>
						<label>Email address: <input type="email" name="playerEmail" required /></label>
						<label
							><input type="checkbox" name="permission" bind:checked={submitApproval} required /> By submitting this list, you acknowledge your email address and name will be provided
							to the tournament organizer. Any stored data will be removed after the tournament has completed.</label
						>
						{#if selectedTournament.era != null && selectedTournament.era != selectedEra}
							<p class="error">Selected era does not match the tournaments era. Please select the appropriate Era to submit</p>
						{/if}
						{#if selectedTournament.tournamentRules != selectedRules}
							<p class="error">Selected rules do not match the tournaments rules. Please select the appropriate rules and revalidate to submit</p>
						{/if}
						<button class="submit" disabled={!selectedEraMatchesTournament || !submitApproval}>Submit</button>
						<input type="hidden" name="tournamentId" value={selectedTournament.id} />
						<input type="hidden" name="era" value={selectedEra} />
						<input type="hidden" name="faction" value={selectedFaction} />
					{/if}
				</form>
			{/if}
		</div>
	</main>
</svelte:boundary>

<style>
	.validation-body {
		display: grid;
		row-gap: 16px;
		height: max-content;
	}
	.contents {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.section {
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.section-header {
		font-size: 1.25em;
	}
	select {
		margin-right: 16px;
	}
	main {
		overflow-y: auto;
		scrollbar-gutter: stable;
		padding: 16px;
	}
	table {
		margin-top: 16px;
		border-collapse: collapse;
	}
	td,
	th {
		padding: 8px;
		border: 2px solid var(--border);
	}
	.tournament-details {
		padding: 16px;
		display: grid;
		grid-template-columns: max-content max-content;
		gap: 4px 8px;
	}
	.tournament-details > p:nth-child(odd) {
		justify-self: end;
	}
	.submit-instructions {
		margin-top: 16px;
		margin-bottom: 8px;
	}
	.submit {
		width: max-content;
	}
</style>
