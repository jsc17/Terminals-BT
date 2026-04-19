<script lang="ts">
	import { getEraName, getEraNames, getErasAndFactions, getGeneralId } from "$lib/remote/era-faction.remote";
	import { getApprovedTournamentList, submitList } from "./tournament.remote";
	import { validateRules } from "$lib/rules/validateList";
	import { toastController } from "$lib/stores";
	import { getRulesByName, ruleSets } from "$lib/rules/rulesets";
	import { createAbilityLineString } from "$lib/utilities/abilityUtilities";
	import FixUnitDialog from "./Dialogs/FixUnitDialog.svelte";
	import type { ValidationUnitData, TournamentData, ValidationBFSData } from "./types";
	import { getUnitData } from "./validate.remote";
	import { page } from "$app/state";
	import { submittedList } from "$lib/stores/listSubmission.svelte";
	import { nanoid } from "nanoid";
	import { watch } from "runed";
	import { innerWidth } from "svelte/reactivity/window";
	import { logError } from "$lib/remote/error";
	import AddBFSDialog from "./Dialogs/AddBFSDialog.svelte";
	import AddUnitDialog from "./Dialogs/AddUnitDialog.svelte";
	import FixBFSDialog from "./Dialogs/FixBFSDialog.svelte";
	import { SubmitListSchema } from "./schema/submitList";

	let files = $state<FileList>();

	const eraList = $derived(await getErasAndFactions());
	const eraNames = $derived(await getEraNames());
	const tournamentList = $derived((await getApprovedTournamentList()).data);

	let selectedTournament = $state<TournamentData | undefined>();
	let selectedEra = $state<number>(10);
	let selectedFaction = $state<number>(5);
	let selectedRules = $state<string>("noRes");
	let rulesDetails = $derived(getRulesByName(selectedRules));
	let lockSelections = $state(false);

	let unitData = $state<ValidationUnitData[]>([]);
	let bfsData = $state<ValidationBFSData[]>([]);
	let formationCount = $state<number>(0);
	let scaCount = $state<number>(0);
	let unfoundUnits = $derived(unitData.filter((u) => !u.mulData).length + bfsData.filter((b) => !b.available).length);
	let addedUnits = $state<ValidationUnitData[]>([]);
	let addedBfs = $state<ValidationBFSData[]>([]);
	let fixedUnits = $state<{ fixed: ValidationUnitData; original: ValidationUnitData }[]>([]);
	let fixedBfs = $state<{ fixed: ValidationBFSData; original: ValidationBFSData }[]>([]);

	let issues = $state<{ issueList: Map<string, Set<string>> }>();

	let submitApproval = $state(false);
	let submitted = $state(false);

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
				const general = await getGeneralId({ era: selectedEra, faction: selectedFaction! });
				const factions = general ? [selectedFaction, general] : [selectedFaction];
				issues = await validateRules(
					unitList,
					[selectedEra],
					factions.filter((f) => f != undefined),
					selectedRules,
					new Map(bfsData.map((bfs) => [bfs.id ?? -1, bfs.count])),
					formationCount,
					scaCount
				);
			} else {
				alert("not all units are valid");
			}
		}
	}

	watch(
		() => selectedEra,
		() => {
			if (!eraList.get(selectedEra)?.factions.find((f) => f.id == selectedFaction)) selectedFaction = 5;
		}
	);

	watch(
		() => selectedTournament,
		() => {
			if (selectedTournament?.era) selectedEra = selectedTournament.era;
			if (selectedTournament?.tournamentRules) selectedRules = selectedTournament.tournamentRules;
		}
	);

	if (page.url.searchParams.has("redirect") && submittedList.data) {
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(new File([submittedList.data], submittedList.name ? `${submittedList.name}.pdf` : `${nanoid(6)}.pdf`));
		files = dataTransfer.files;
		if (submittedList.era) selectedEra = submittedList.era;
		if (submittedList.faction) selectedFaction = submittedList.faction;
		if (submittedList.rules) selectedRules = submittedList.rules;
	}
</script>

<svelte:head>
	<title>Terminals Validation</title>
</svelte:head>

<main>
	<div class="validation-body">
		<p class="muted">MUL or Terminal PDF's only, others will probably error out, but at the very least will not read correctly</p>
		<form
			enctype="multipart/form-data"
			{...getUnitData.enhance(async ({ submit }) => {
				issues = undefined;
				await submit();
				if (getUnitData.result?.status == "success") {
					unitData = getUnitData.result.data?.unitData ?? [];
					bfsData = getUnitData.result.data?.bfsData ?? [];
					formationCount = getUnitData.result.data?.formationCount ?? 0;
					scaCount = getUnitData.result.data?.scaCount ?? 0;
					lockSelections = true;
				} else {
					toastController.addToast(getUnitData.result?.message ?? "Invalid message recieved");
				}
			})}
		>
			<div class="section">
				<h2 class="tournament-select-header">
					1. Select a tournament to autofill details and allow for submission to the Tournament Organizer, or skip this step if you just want to validate a list
				</h2>
				<a class="tournament-select-link" href="/todashboard">Click here to create or manage a tournament</a>
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
					<p class="tournament-detail">
						{selectedTournament?.tournament_date.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" }) ?? "-"}
					</p>
					<p class="muted tournament-detail">Location:</p>
					<p class="tournament-detail">{selectedTournament?.location ?? "-"}</p>
					<p class="muted tournament-detail">Era:</p>
					<p class="tournament-detail">{selectedTournament ? (selectedTournament.era ? await getEraName(selectedTournament.era) : "Any Era") : "-"}</p>
					<p class="muted tournament-detail">Rules:</p>
					<p class="tournament-detail">{selectedTournament?.tournamentRules ? rulesDetails?.display : "-"}</p>
				</div>
			</div>

			<div class="section">
				<h2>2. Select an era, faction, and ruleset to check list validity. If you have chosen a tournament, some of these options may already be set and locked</h2>
				<label>
					Rules:
					<select name="selectedRules" bind:value={selectedRules} required disabled={selectedTournament?.tournamentRules != undefined || lockSelections}>
						{#each ruleSets as rules}
							{#if !rules.archived}
								<option value={rules.name}>{rules.display}</option>
							{/if}
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
						{#each eraList.get(selectedEra)?.factions as faction}
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
			<input {...getUnitData.fields.rules.as("hidden", selectedRules)} />
		</form>
		<div class={{ section: true, "locked-section": unitData.length == 0 }}>
			<h2 class="tournament-select-header">3. Review Unit Data (You shouldn't have to do anything here unless it misread any of the units from the uploaded pdf)</h2>
			<div class="space-between">
				<h3>Units</h3>
				<AddUnitDialog bind:unitData bind:addedUnits bind:issues {selectedRules} {selectedEra} {selectedFaction} />
			</div>
			<table>
				<thead>
					<tr>
						<th>Found</th>
						{#each innerWidth.current! >= 600 ? ["Name", "Skill", "PV", "Rules", "Type", "Abilities", "Available", "Unique"] : ["Name", "Skill"] as header}
							<th>{header}</th>
						{/each}
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each unitData ?? [] as unit, index (unit.id)}
						{@const unitFixed = fixedUnits.find((u) => u.original.id == unit.id) != undefined}
						{@const unitAdded = addedUnits.find((u) => u.id == unit.id) != undefined}
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
								{#if unitFixed}
									<span class="warning"> (Unit modified)</span>
								{/if}
								{#if unitAdded}
									<span class="warning"> (Unit manually added)</span>
								{/if}
							</td>
							{#each innerWidth.current! >= 600 ? [unit.skill, unit.pv, unit.mulData?.rulesLevel, unit.mulData?.subtype, createAbilityLineString(unit.mulData?.abilities ?? []), (unit.mulData?.mulId ?? 0) < 0 ? true : unit.available, unit.unique] : [unit.skill] as data}
								<td>{data ?? "-"}</td>
							{/each}
							<td>
								<FixUnitDialog unitId={unit.id} bind:unitData bind:fixedUnits bind:issues {selectedRules} {selectedEra} {selectedFaction} />
							</td>
						</tr>
					{:else}
						<tr>
							<td colspan="10">Upload a file to display units</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<div class="space-between">
				<h3>Battlefield Support <span class="error">{bfsData.filter((b) => !b.available).length ? "(Not all BFS found, check the selected ruleset)" : ""}</span></h3>
				<AddBFSDialog bind:bfsData {selectedRules} bind:addedBfs />
			</div>
			<div class="bfs-table">
				<div class="bfs-row">
					<p>Found</p>
					<p>Name</p>
					<p>Count</p>
					<p>BSP (Total)</p>
					<p>PV (Total)</p>
					<div></div>
				</div>

				{#each bfsData as bfs, index}
					{@const bfsFixed = fixedBfs.find((b) => b.fixed.id == bfs.id) != undefined}
					{@const bfsAdded = addedBfs.find((b) => b.id == bfs.id) != undefined}
					<div class="bfs-row">
						<div>
							{#if bfs?.available}
								<span class="center" style="color: green; font-weight: bold;">✔</span>
							{:else}
								<span class="center" style="color: red; font-weight: bold;">X</span>
							{/if}
						</div>
						<p>
							{bfs.name}
							{#if bfsFixed}
								<span class="warning"> (BFS modified)</span>
							{/if}
							{#if bfsAdded}
								<span class="warning"> (BFS manually added)</span>
							{/if}
						</p>
						<p>{bfs.count}</p>
						<p>{bfs.bsp ? `${bfs.bsp} (${bfs.bsp * bfs.count})` : "-"}</p>
						<p>{bfs.pv ? `${bfs.pv} (${bfs.pv * bfs.count})` : "-"}</p>
						<div><FixBFSDialog bind:bfsData bfsIndex={index} {selectedRules} bind:fixedBfs /></div>
					</div>
				{/each}
			</div>
		</div>

		<div class={{ section: true, "locked-section": unfoundUnits > 0 || unitData.length == 0 }}>
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
			class={{ section: true, "locked-section": !selectedTournament || issues == undefined || issues?.issueList.size > 0 }}
			enctype="multipart/form-data"
			{...submitList.preflight(SubmitListSchema).enhance(async ({ submit, data }) => {
				console.log(data);
				if (files) {
					toastController.addToast("Submitting list. Please Wait..");
					submitted = true;
					await submit();
					if (submitList.fields.allIssues()?.length) {
						logError(JSON.stringify(submitList.fields.allIssues()?.map((i) => i.message)));
						submitted = false;
					}
					toastController.addToast(submitList.result?.message ?? "Invalid Message Received");
				}
			})}
		>
			<h2>5. Submit your list to the T.O.</h2>

			<label>Player Name: <input type="text" name="playerName" required disabled={issues == undefined || issues?.issueList.size > 0} value="Test" /></label>
			<label>Email address: <input type="email" name="playerEmail" required disabled={issues == undefined || issues?.issueList.size > 0} value="hinujwb@ing.com" /></label>
			<label
				><input type="checkbox" name="permission" bind:checked={submitApproval} required disabled={issues == undefined || issues?.issueList.size > 0} /> By submitting this list, you
				acknowledge your email address and name will be provided to the tournament organizer. Any personal data stored Terminal.tools will be removed after the tournament has completed.</label
			>
			<button class="submit" disabled={!selectedTournament || !submitApproval || issues == undefined || issues?.issueList.size > 0 || submitted}>Submit</button>
			<input type="file" name="listFile" bind:files class="hidden" aria-hidden="true" />
			<input type="hidden" name="tournamentId" value={selectedTournament?.id} />
			<input type="hidden" name="eraId" value={selectedEra} />
			<input type="hidden" name="factionId" value={selectedFaction} />
			{#each unitData as unit}
				<input type="hidden" name="unit[]" value={JSON.stringify({ id: unit.mulData?.mulId, sk: unit.skill })} />
			{/each}
			{#each addedUnits as unit}
				<input type="hidden" name="addedUnits[]" value={JSON.stringify({ id: unit.mulData?.mulId, sk: unit.skill })} />
			{/each}

			{#each fixedUnits as unit}
				<input
					type="hidden"
					name="fixedUnits[]"
					value={JSON.stringify({ original: { id: unit.original.mulData?.mulId, sk: unit.original.skill }, fixed: { id: unit.fixed.mulData?.mulId, sk: unit.fixed.skill } })}
				/>
			{/each}
			{#each bfsData as bfs}
				<input type="hidden" name="bfs[]" value={JSON.stringify({ id: bfs.id, count: bfs.count })} />
			{/each}
			{#each addedBfs as bfs}
				<input type="hidden" name="addedBfs[]" value={JSON.stringify({ id: bfs.id, count: bfs.count })} />
			{/each}
			{#each fixedBfs as bfs}
				<input
					type="hidden"
					name="fixedBfs[]"
					value={JSON.stringify({ original: { id: bfs.original.id, count: bfs.original.count }, fixed: { id: bfs.fixed.id, count: bfs.fixed.count } })}
				/>
			{/each}
			{#each submitList.fields.allIssues() as issue}
				<p>{issue.message}</p>
			{/each}
		</form>
	</div>
</main>

<style>
	.contents {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.section {
		background-color: var(--surface-color);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 16px;
	}
	h2.tournament-select-header {
		margin-bottom: 0px;
	}

	.tournament-select-link {
		margin-bottom: 16px;
		width: max-content;
	}
	select {
		margin-right: 16px;
	}
	main {
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
	h3 {
		margin-bottom: 0px;
		margin-top: 12px;
		font-size: 1rem;
	}
	.locked-section {
		opacity: 0.3;
		pointer-events: none;
	}
	.bfs-table {
		display: grid;
		grid-template-columns: max-content 1fr repeat(4, max-content);
	}
	.bfs-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: 1 / -1;
		align-items: center;
		border: 1px solid var(--border);
	}
	.bfs-row p:not(:last-child),
	.bfs-row div:not(:last-child) {
		border-right: 1px solid var(--border);
	}
	.bfs-row div {
		height: 100%;
	}
	.bfs-row p,
	.bfs-row div {
		padding: 8px 16px;
	}
	.bfs-row p:not(:nth-child(2)) {
		text-align: center;
	}
</style>
