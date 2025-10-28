<script lang="ts">
	import { getEraName, getEraNames, getErasAndFactions, getGeneralId } from "$lib/remote/era-faction.remote";
	import { getApprovedTournamentList, submitList } from "./tournament.remote";
	import { validateRules } from "$lib/rules/validateList";
	import { toastController } from "$lib/stores";
	import { getRulesByName, ruleSets } from "$lib/types/rulesets";
	import { createAbilityLineString } from "$lib/utilities/abilityUtilities";
	import FixModal from "./FixModal.svelte";
	import type { ValidationUnitData, TournamentData } from "./types";
	import { getUnitData } from "./validate.remote";
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { submittedList } from "$lib/stores/listSubmission.svelte";
	import { nanoid } from "nanoid";
	import { afterNavigate } from "$app/navigation";

	let files = $state<FileList>();

	const eraList = $derived(await getErasAndFactions());
	const eraNames = $derived(await getEraNames());
	const tournamentList = $derived((await getApprovedTournamentList()).data);

	let selectedTournament = $state<TournamentData | undefined>();
	let selectedEra = $derived(selectedTournament?.era ?? 10);
	let selectedFaction = $derived(eraList.get(selectedEra)![0].id);
	let selectedRules = $derived(selectedTournament?.tournamentRules ?? "wn350v3");
	let lockSelections = $state(false);

	let unitData = $state<ValidationUnitData[]>([]);
	let unfoundUnits = $derived(unitData.filter((u) => !u.mulData).length);
	let fixedData = $state(false);

	let issues = $state<{ issueList: Map<string, Set<string>> }>();

	let submitApproval = $state(false);

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

	if (page.url.searchParams.has("redirect") && submittedList.data) {
		console.log("search params working");
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(new File([submittedList.data], submittedList.name ? `${submittedList.name}.pdf` : `${nanoid(6)}.pdf`));
		files = dataTransfer.files;
	}
</script>

<svelte:head>
	<title>Terminals Validation</title>
</svelte:head>

<main>
	<div class="validation-body">
		<p class="muted">
			MUL or Terminal PDF's only, others will probably error out, but at the very least will not read correctly. Formations printed in the unit table will break the parsing
		</p>
		<form
			enctype="multipart/form-data"
			{...getUnitData.enhance(async ({ submit }) => {
				issues = undefined;
				await submit();
				if (getUnitData.result?.status == "success") {
					unitData = getUnitData.result.data ?? [];
					lockSelections = true;
				} else {
					toastController.addToast(getUnitData.result?.message ?? "Invalid message recieved");
				}
			})}
		>
			<div class="section">
				<h2>1. Select a tournament to autofill details and allow for submission to the Tournament Organizer, or skip this step if you just want to validate a list</h2>
				<label
					>Tournament <span class="muted">(Optional)</span>:
					<select bind:value={selectedTournament} disabled={lockSelections}>
						<option value={undefined}>None</option>
						{#each tournamentList as tournament}
							<option value={tournament}>{tournament.name}</option>
						{/each}
					</select></label
				>
				<div class="tournament-details">
					<p class="muted tournament-detail">Date:</p>
					<p class="tournament-detail">{selectedTournament?.tournament_date.toDateString() ?? "-"}</p>
					<p class="muted tournament-detail">Location:</p>
					<p class="tournament-detail">{selectedTournament?.location ?? "-"}</p>
					<p class="muted tournament-detail">Era:</p>
					<p class="tournament-detail">{selectedTournament ? (selectedTournament.era ? await getEraName(selectedTournament.era) : "Any Era") : "-"}</p>
					<p class="muted tournament-detail">Rules:</p>
					<p class="tournament-detail">{selectedTournament?.tournamentRules ? getRulesByName(selectedTournament.tournamentRules)?.display : "-"}</p>
				</div>
			</div>

			<div class="section">
				<h2>2. Select an era, faction, and ruleset to check list validity. If you have chosen a tournament, some of these options may already be set and locked</h2>
				<label>
					Rules:
					<select name="selectedRules" bind:value={selectedRules} required disabled={selectedTournament?.tournamentRules != undefined || lockSelections}>
						{#each ruleSets as rules}
							<option value={rules.name}>{rules.display}</option>
						{/each}
					</select>
				</label>
				<label>
					Era:
					<select bind:value={selectedEra} required disabled={selectedTournament?.era != undefined || lockSelections}>
						{#each eraList.keys() as era}
							<option value={era}>{eraNames.get(era)}</option>
						{/each}
					</select>
					<input type="hidden" name="selectedEra" value={selectedEra} />
				</label>
				<label
					>Faction:
					<select name="selectedFaction" bind:value={selectedFaction} required disabled={lockSelections}>
						{#each eraList.get(selectedEra) as faction}
							<option value={faction.id}>{faction.name}</option>
						{/each}
					</select>
				</label>
				<div class="inline">
					<input type="file" name="listFile" id="listFile" accept="application/pdf" required bind:files disabled={lockSelections} />
				</div>
				<div class="inline">
					<button disabled={lockSelections}>Get Unit Data</button>
				</div>
			</div>
		</form>
		<div class="section">
			<h2>3. Review Unit Data (You shouldn't have to do anything here unless it misread any of the units from the uploaded pdf)</h2>
			<table>
				<thead>
					<tr>
						<th></th>
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
								{#if unit.mulData}
									<span class="center" style="color: green; font-weight: bold;">✔</span>
								{:else}
									<span class="center" style="color: red; font-weight: bold;">X</span>
								{/if}
							</td>
							<td>
								{#if unit.link}
									<a href={unit.link} target="_blank">{unit.name}</a>
								{:else}
									{unit.name}
								{/if}
							</td>
							{#each [unit.skill, unit.pv, unit.mulData?.rulesLevel, unit.mulData?.subtype, createAbilityLineString(unit.mulData?.abilities ?? []), unit.available, unit.unique] as data}
								<td>{data ?? "-"}</td>
							{/each}
							<td>
								<FixModal bind:unit={unitData![index]} era={selectedEra} faction={selectedFaction} bind:fixedData />
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
			<h2 class="no-margin">4. Check for any list issues</h2>
			<div class="inline">
				<button onclick={handleValidation} disabled={unfoundUnits > 0 || unitData.length == 0}>Validate</button>
				{#if unfoundUnits > 0}
					<p class="error">Fix all unfound units in the previous section to validate</p>
				{/if}
				{#if unitData.length == 0}
					<p class="muted">Upload a file to validate list</p>
				{/if}
			</div>
			<table>
				<thead>
					<tr>
						<th>Issue</th>
						<th>Problem Units</th>
					</tr>
				</thead>
				<tbody>
					{#if issues == undefined}
						<tr>
							<td colspan="2">Validate list to show any potential issues</td>
						</tr>
					{:else if issues?.issueList.size}
						{#each issues.issueList as [issue, units]}
							<tr>
								<td class="error">{issue}</td>
								<td>{Array.from(units).join(", ")}</td>
							</tr>
						{/each}
					{:else}
						<tr>
							<td colspan="2">No list issues found! Use the following section if you are submitting your list for a tournament.</td>
						</tr>
					{/if}
				</tbody>
			</table>
		</div>

		<form
			class="section"
			enctype="multipart/form-data"
			{...submitList.enhance(async ({ data, submit }) => {
				console.log("submitting");

				if (files) {
					await submit();
					console.log(submitList.result);
					toastController.addToast(submitList.result?.message ?? "Invalid Message Received");
				}
			})}
		>
			<h2>5. Submit your list to the T.O.</h2>

			<label>Player Name: <input type="text" name="playerName" required disabled={issues == undefined || issues?.issueList.size > 0} /></label>
			<label>Email address: <input type="email" name="playerEmail" required disabled={issues == undefined || issues?.issueList.size > 0} /></label>
			<label
				><input type="checkbox" name="permission" bind:checked={submitApproval} required disabled={issues == undefined || issues?.issueList.size > 0} /> By submitting this list, you
				acknowledge your email address and name will be provided to the tournament organizer. Any stored personal data will be removed after the tournament has completed.</label
			>
			<button class="submit" disabled={!selectedTournament || !submitApproval || issues == undefined || issues?.issueList.size > 0}>Submit</button>
			<input type="file" name="listFile" bind:files class="hidden" aria-hidden="true" />
			<input type="hidden" name="tournamentId" value={selectedTournament?.id} />
			<input type="hidden" name="eraId" value={selectedEra} />
			<input type="hidden" name="factionId" value={selectedFaction} />
			<input type="hidden" name="fixedData" value={fixedData} />
			{#each unitData as unit}
				<input type="hidden" name="unit[]" value={JSON.stringify({ id: unit.mulData?.mulId, sk: unit.skill })} />
			{/each}
		</form>
	</div>
</main>

<style>
	.validation-body {
		display: grid;
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
		margin-top: 16px;
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
		border-collapse: collapse;
	}
	td,
	th {
		padding: 8px;
		border: 2px solid var(--border);
	}
	.tournament-details {
		padding: 0px 16px;
		display: grid;
		grid-template-columns: max-content max-content;
		gap: 4px 8px;
	}
	.tournament-detail {
		font-size: 0.9rem;
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
	h2 {
		font-size: 1.1rem;
	}
</style>
