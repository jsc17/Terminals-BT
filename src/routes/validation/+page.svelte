<script lang="ts">
	import { getEras, getFactions, getFactionsInEra, getGeneralId } from "$lib/remote/era-faction.remote";
	import { validateRules } from "$lib/rulesValidation/validateList";
	import { toastController } from "$lib/stores";
	import { ruleSets } from "$lib/types/rulesets";
	import { createAbilityLineString } from "$lib/utilities/abilityUtilities";
	import FixModal from "./FixModal.svelte";
	import { getUnitData } from "./validate.remote";

	let selectedRules = $state("wn350v3");
	let files = $state<FileList>();

	let selectedEra = $state<number>(10);
	let selectedFaction = $state<number>(102);

	let eraList = $derived(getEras());
	let factionList = $derived(await getFactionsInEra([selectedEra]));

	$effect(() => {
		selectedFaction = factionList[0].factionId;
	});

	$effect(() => {
		if (getUnitData.result?.status && getUnitData.result.status == "failed") toastController.addToast(getUnitData.result.message ?? "Error Message missing");
	});

	let issues = $state<{ issueList: Map<string, Set<string>> }>();
	async function handleValidation() {
		if (getUnitData.result?.status == "success") {
			const unitList =
				getUnitData.result.data
					?.filter((res) => {
						return res.mulData != undefined;
					})
					.map((data) => {
						return { id: data.id, skill: data.skill, data: data.mulData! };
					}) ?? [];
			if (unitList?.length == getUnitData.result.data?.length) {
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
			<p>Mul or Terminal PDF's only, others will probably error out. Doesn't support formations from terminals list.</p>
			<form
				class="section"
				enctype="multipart/form-data"
				{...getUnitData.enhance(async ({ submit }) => {
					issues = undefined;
					submit();
				})}
			>
				<label>
					Era:
					<select name="selectedEra" bind:value={selectedEra}>
						{#each await eraList as era}
							<option value={era.id}>{era.name}</option>
						{/each}
					</select>
				</label>
				<label
					>Faction:
					<select name="selectedFaction" bind:value={selectedFaction}>
						{#each await factionList as faction}
							<option value={faction.factionId}>{faction.faction.name}</option>
						{/each}
					</select>
				</label>
				<input type="file" name="listFile" id="listFile" accept="application/pdf" required bind:files />
				<button>Upload</button>
			</form>
			<div class="section">
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
						{#each getUnitData.result?.data ?? [] as unit, index (unit.id)}
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
										<FixModal bind:unit={getUnitData.result!.data![index]} />
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
				<label>
					Rules:
					<select name="selectedRules" bind:value={selectedRules}>
						{#each ruleSets as rules}
							<option value={rules.name}>{rules.display}</option>
						{/each}
					</select>
				</label>
				<button onclick={handleValidation}>Validate</button>
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
						<p>No List issues found!!</p>
					{/if}
				{/if}
			</div>
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
	}
	.card-header {
		margin: 16px 0px;
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
</style>
