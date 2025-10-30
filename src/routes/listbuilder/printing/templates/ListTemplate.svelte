<svelte:options css="injected" />

<script lang="ts">
	import type { MulUnit } from "$lib/types/listTypes";
	import type { PrintListOutput, PrintOptionsOutput } from "../types";
	import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
	import PrintUnitCard from "./PrintUnitCard.svelte";
	import { abilityReferences, spaReferences } from "$lib/data";
	import { getFormationDataFromName } from "$lib/utilities/formationUtilities";
	import { getBSCbyId } from "$lib/data/battlefieldSupport";

	type Props = {
		listData: PrintListOutput;
		printOptions: PrintOptionsOutput;
		mulUnitData: Map<number, MulUnit>;
		ammoReferenceList: string[];
		unitImages?: Map<number, string>;
		unitCardImages?: Map<number, string>;
		bsList: Map<number, number[]>;
		scaList: number[];
	};

	let { listData, printOptions, mulUnitData, ammoReferenceList, unitImages, unitCardImages, bsList, scaList }: Props = $props();

	const unitData = new Map(listData.units.map((u) => [u.id, u]));

	let tableHeaders = $derived(printOptions.printStyle == "simple" ? ["Unit", "Type", "Skill", "PV (Half)"] : ["Unit", "Type", "Move", "Damage", "Health", "Skill", "PV (Half)"]);

	let abilityReferenceList = $derived.by(() => {
		const referenceList: string[] = [];
		abilityReferences.forEach((a) => {
			for (const unit of mulUnitData.values()) {
				if (unit.abilities.find((ua) => ua.name == a.abbr)) {
					referenceList.push(`${a.abbr} (${a.name}, ${a.page})`);
					return;
				}
			}
		});
		return referenceList;
	});
	let formationReferenceList = $derived([...new Set(listData.formations.filter((f) => f.type != "none").map((f) => `${f.type} (${getFormationDataFromName(f.type)?.page})`))]);
	let spaReferenceList = $derived.by(() => {
		const spaList = new Set<string>();
		unitData.values().forEach((u) => u.customization?.spa?.forEach((v) => spaList.add(v)));
		return [...spaList].sort().map((v) => `${v} (${spaReferences.find((r) => r.name == v)?.page})`);
	});
</script>

{#snippet referenceList(title: string, references: string[])}
	<h3>{title}</h3>
	<div class="reference-list">
		<ul>
			{#each references.slice(0, Math.ceil(references.length / 2)) as reference}
				<li class="reference">{reference}</li>
			{/each}
		</ul>
		<ul>
			{#each references.slice(Math.ceil(references.length / 2)) as reference}
				<li class="reference">{reference}</li>
			{/each}
		</ul>
	</div>
{/snippet}

<div class="body">
	<div class="reference-page">
		<h1>{listData.name}</h1>
		<table>
			<thead>
				<tr>
					{#each tableHeaders as header}
						<th>{header}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each listData.formations as formation}
					{@const formationPv = formation.units.reduce((a, v) => (a += getNewSkillCost(unitData.get(v)!.skill, mulUnitData.get(unitData.get(v)!.mulId)!.pv)), 0)}
					{#if printOptions.printFormations && formation.type != "none"}
						<tr>
							<td class="formation-line" colspan={printOptions.printStyle == "simple" ? 4 : 7}>
								{`${formation.name} - ${formation.type} - ${formation.units.length} Units - ${formationPv} PV`}
							</td>
						</tr>
					{/if}
					{#each formation.units as unitId}
						{@const unit = unitData.get(unitId)}
						{@const mulData = mulUnitData.get(unit!.mulId)}
						{@const unitCost = getNewSkillCost(unit!.skill, mulData!.pv)}
						{@const stats =
							printOptions.printStyle == "simple"
								? [mulData!.name, mulData!.subtype, unit!.skill, getNewSkillCost(unit!.skill, mulData!.pv)]
								: [
										mulData!.name,
										mulData!.subtype,
										`${mulData!.move?.map((m) => (printOptions.measurementUnits == "inches" ? `${m.speed}"${m.type ?? ""}` : `${m.speed / 2}⬢${m.type ?? ""}`)).join("/") ?? "-"} `,
										`${mulData!.damageS == undefined ? "-" : `${mulData!.damageS}/${mulData!.damageM}/${mulData!.damageL}`}`,
										`${mulData!.health == undefined ? "-" : `${mulData!.health} (${mulData!.armor}a+${mulData?.structure}s)`}`,
										unit!.skill,
										`${unitCost} (${unitCost / 2})`
									]}
						<tr>
							{#each stats as stat}
								<td class="unit-stat">{stat}</td>
							{/each}
						</tr>
					{/each}
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan={printOptions.printStyle == "simple" ? 3 : 6}>{listData.units.length} Units</td>
					<td>{listData.units.reduce((a, v) => a + getNewSkillCost(v.skill, mulUnitData.get(v.mulId)!.pv), 0)}</td>
				</tr>
			</tfoot>
		</table>
		{#if bsList.size > 0}
			<table class="bs-container">
				<thead>
					<tr>
						<th>Battlefield Support</th>
						<th>Uses</th>
						<th>Total BSP Cost</th>
					</tr>
				</thead>
				<tbody>
					{#each bsList.entries() as [key, value]}
						{@const bspData = getBSCbyId(key)}
						<tr>
							<td>{bspData?.name} ({bspData?.source})</td>
							<td>
								<div class="inline">
									{#each { length: value.length }}
										<div class="pip"></div>
									{/each}
								</div>
							</td>
							<td>{(bspData?.bspCost ?? 0) * value.length}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/if}
		<div>
			{#if printOptions.printReferences}
				<h2>References:</h2>
				{#if printOptions.printReferences}
					{@render referenceList("Abilities:", abilityReferenceList)}
				{/if}
				{#if spaReferenceList.length != 0}
					{@render referenceList("SPAs:", spaReferenceList)}
				{/if}
				{#if ammoReferenceList.length != 0}
					{@render referenceList("Alternate Munitions:", ammoReferenceList)}
				{/if}
				{#if printOptions.printFormations && formationReferenceList.length}
					{@render referenceList("Formations:", formationReferenceList)}
				{/if}
			{/if}
		</div>
	</div>
	<div class="formation-container">
		{#if printOptions.printCardsByFormation}
			{#each listData.formations as formation}
				{@const formationPv = formation.units.reduce((a, v) => (a += getNewSkillCost(unitData.get(v)!.skill, mulUnitData.get(unitData.get(v)!.mulId)!.pv)), 0)}
				<div class={{ formation: true, "formation-side": printOptions.formationHeaderStyle == "side" }}>
					{#if printOptions.formationHeaderStyle == "inline" && formation.type != "none"}
						<h2 class="formation-header-inline">
							{`${formation.name} - ${formation.type} Formation - ${formation.units.length} Units - ${formationPv}pv`}
						</h2>
					{:else if formation.type != "none"}
						<div>
							<h2 class="formation-header-side">
								{`${formation.name} - ${formation.type} Formation`} <br />
								{`${formation.units.length} Units - ${formationPv}pv`}
							</h2>
						</div>
					{:else}
						<div></div>
					{/if}
					<div class="unit-card-container">
						{#each formation.units as unitId}
							{@const unit = unitData.get(unitId)}
							{@const mulData = mulUnitData.get(unit!.mulId)}
							{#if printOptions.cardStyle == "mul" || unit!.mulId < 0}
								<img src={unitCardImages?.get(unit!.mulId)} class="unit-card" alt="unit card" />
							{:else}
								<PrintUnitCard
									unit={{ id: unit!.id, baseUnit: mulData!, skill: unit!.skill, cost: getNewSkillCost(unit!.skill, mulData!.pv), customization: unit!.customization }}
									image={unitImages?.get(mulData!.mulId) ?? ""}
									formationSPAs={[]}
									measurementUnits={printOptions.measurementUnits}
								/>
							{/if}
						{/each}
					</div>
				</div>
			{/each}
		{:else}
			<div class="unit-card-container">
				{#each listData.formations.flatMap((f) => f.units) as unitId}
					{@const unit = unitData.get(unitId)}
					{@const mulData = mulUnitData.get(unit!.mulId)}
					{#if printOptions.cardStyle == "mul" || unit!.mulId < 0}
						<img src={unitCardImages?.get(unit!.mulId)} class="unit-card" alt="unit card" />
					{:else}
						<PrintUnitCard
							unit={{ id: unit!.id, baseUnit: mulData!, skill: unit!.skill, cost: getNewSkillCost(unit!.skill, mulData!.pv), customization: unit!.customization }}
							image={unitImages?.get(mulData!.mulId) ?? ""}
							formationSPAs={[]}
							measurementUnits={printOptions.measurementUnits}
						/>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	h1 {
		color: black;
		font-size: 16pt;
	}
	h2 {
		color: black;
		font-size: 14pt;
		margin-bottom: 0;
	}
	h3 {
		color: black;
		font-size: 8pt;
		margin-top: 4pt;
		margin-bottom: 0;
	}
	h2.formation-header-inline {
		margin: 0;
		padding: 0;
		font-size: 12pt;
		grid-column: span 2;
		margin-bottom: 3pt;
	}
	h2.formation-header-side {
		writing-mode: sideways-lr;
		text-align: end;
		padding-top: 6pt;
	}
	.body {
		background-color: white;
		width: 612pt;
	}
	table {
		border-collapse: collapse;
		width: 100%;
	}
	th {
		border: 1px solid black;
		color: black;
		font-size: 8pt;
		background-color: rgb(170, 170, 170);
	}
	th:first-child {
		text-align: start;
		padding-left: 4px;
	}
	td {
		border: 1px solid black;
		color: black;
		font-size: 8pt;
		text-align: center;
		padding: 2px 0px;
	}
	.unit-stat:first-child {
		text-align: start;
		padding-left: 12px;
	}
	.formation-line {
		text-align: start;
		padding-left: 6px;
		background-color: rgb(230, 230, 230);
	}
	tfoot td {
		background-color: rgb(170, 170, 170);
		font-weight: bold;
	}
	tfoot td:first-child {
		text-align: start;
		padding-left: 4px;
	}
	.reference-page {
		padding: 0pt 30pt;
		break-after: page;
		display: flex;
		flex-direction: column;
		gap: 8pt;
	}
	.formation-container {
		display: flex;
		flex-direction: column;
		gap: 5pt;
	}
	.formation {
		break-inside: avoid;
	}
	.formation-side {
		display: grid;
		grid-template-columns: 0.95in 7.05in;
		margin-bottom: 15pt;
	}
	.formation-line {
		font-weight: bold;
	}
	.unit-card-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.05in;
	}
	.unit-card {
		aspect-ratio: 7/ 5;
		width: 271pt;
	}
	ul {
		margin: 2pt;
		padding: 2px;
		list-style-position: inside;
	}
	.reference-list {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4px;
	}
	.reference {
		color: black;
		font-size: 8pt;
	}
	.bs-container td:first-child {
		text-align: start;
		padding-left: 4px;
	}
	.inline {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 3pt;
	}
	.pip {
		background-color: white;
		border: 1pt solid black;
		border-radius: 50%;
		height: 7pt;
		aspect-ratio: 1/1;
	}
</style>
