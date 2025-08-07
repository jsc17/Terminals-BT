<script lang="ts">
	import { getEraName, getEras, getFactionName, getFactionsInEra } from "$lib/remote/era-faction.remote";
	import { ruleSets } from "$lib/types/rulesets";
	import { createAbilityLineString } from "$lib/utilities/abilityUtilities";
	import FixModal from "./FixModal.svelte";
	import { getUnitData } from "./validate.remote";

	let selectedRules = $state(ruleSets[0].name);
	let files = $state<FileList>();

	let eraList = $derived(await getEras());
	let selectedEra = $derived(eraList[0].id);
	let availableFactions = $derived(await getFactionsInEra([selectedEra]));
	let selectedFaction = $derived(availableFactions[0].factionId);
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
			<form class="section" enctype="multipart/form-data" {...getUnitData}>
				<label>
					Era:
					<select name="selectedEra" bind:value={selectedEra}>
						{#each eraList as era}
							<option value={era.id}>{era.name}</option>
						{/each}
					</select>
				</label>
				<label
					>Faction:
					<select name="selectedFaction" bind:value={selectedFaction}>
						{#each availableFactions as faction}
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
							<th>Link</th>
							{#each ["Name", "Skill", "PV", "Rules", "Type", "Abilities", "Available", "Unique"] as header}
								<th>{header}</th>
							{/each}
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each getUnitData.result ?? [] as unit, index (unit.id)}
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
										<FixModal bind:unit={getUnitData.result![index]} />
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
				<button>Validate</button>
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
		border-collapse: collapse;
	}
	td,
	th {
		padding: 8px;
		border: 2px solid var(--border);
	}
</style>
