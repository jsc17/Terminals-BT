<script lang="ts">
	import { Dialog } from "$lib/generic";
	import { getAllUnitNames, getMULDataFromId } from "$lib/remote/unit.remote";
	import { getRulesByName } from "$lib/rules/rulesets";
	import { toastController } from "$lib/stores";
	import type { ValidationUnitData } from "../types";
	import { getSingleUnitData } from "../validate.remote";

	type Props = {
		unitId: string;
		unitData: ValidationUnitData[];
		fixedUnits: { fixed: ValidationUnitData; original: ValidationUnitData }[];
		issues?: { issueList: Map<string, Set<string>> };
		selectedRules: string;
		selectedEra: number;
		selectedFaction: number;
		index: number;
	};

	let { unitId, unitData = $bindable(), fixedUnits = $bindable(), issues = $bindable(), selectedRules, selectedEra, selectedFaction, index }: Props = $props();

	let open = $state(false);

	const parsedUnit = $derived(unitData.find((unit) => unit.id == unitId));
	const existingFixedUnitIndex = $derived(fixedUnits.findIndex((f) => f.original.id == unitId));
	let rulesDetails = $derived(getRulesByName(selectedRules));
	let unitFilter = $state("");
	let unitList = $derived(await getAllUnitNames());
	let filteredUnitList = $derived(unitList.filter((unit) => unit.name.toLowerCase().includes(unitFilter.toLowerCase())));
	let selectedUnitId = $derived<number>(filteredUnitList[0].mulId);
	let selectedUnitDetails = $derived(selectedUnitId ? await getMULDataFromId(selectedUnitId) : undefined);
	let newSkill = $derived(parsedUnit?.skill ?? 4);
</script>

<Dialog title="Fix Unit" bind:open>
	{#snippet trigger()}
		Edit
	{/snippet}
	{#snippet description()}
		Used to edit the selected unit or skill if it's not detected from the pdf correctly. If the pdf was parsed correctly, but you wish to make changes, please create a new pdf.
	{/snippet}
	<div class="add-unit-dialog-body">
		<fieldset>
			<p>Detected Unit Name: {parsedUnit?.name}</p>
			<label for="unitFilter"
				>Filter:
				<input id="unitFilter" bind:value={unitFilter} /></label
			>
			<form
				{...getSingleUnitData.enhance(async ({ submit }) => {
					issues = undefined;
					await submit();
					if (getSingleUnitData.result?.status == "success") {
						if (existingFixedUnitIndex == -1) fixedUnits.push({ fixed: getSingleUnitData.result.data!, original: unitData[index] });
						else fixedUnits[existingFixedUnitIndex].fixed = getSingleUnitData.result.data!;
						unitData[index] = getSingleUnitData.result.data!;
					} else {
						toastController.addToast(getSingleUnitData.result?.message ?? "Invalid message recieved");
					}
				})}
			>
				<select {...getSingleUnitData.fields.mulId.as("select")} bind:value={selectedUnitId}>
					{#each filteredUnitList as unit}
						<option value={unit.mulId}>{unit.name}</option>
					{/each}
				</select>
				{#if selectedUnitDetails}
					<div class="unit-details">
						<p>Name:</p>
						<p>{selectedUnitDetails.name}</p>
						<p>PV:</p>
						<p>{selectedUnitDetails.pv}</p>
						<p>Type:</p>
						<p>{selectedUnitDetails.subtype}</p>
						<p>Speed:</p>
						<p>{selectedUnitDetails.move?.map((move) => `${move.speed}${move.type}`).join("/")}</p>
						<p>Health:</p>
						<p>{selectedUnitDetails.armor}a + {selectedUnitDetails.structure}s</p>
						<p>Damage:</p>
						<p>
							{selectedUnitDetails.damageS}{selectedUnitDetails.damageSMin ? "*" : ""}/{selectedUnitDetails.damageM}{selectedUnitDetails.damageMMin
								? "*"
								: ""}/{selectedUnitDetails.damageL}{selectedUnitDetails.damageLMin ? "*" : ""} - {selectedUnitDetails.overheat}
						</p>
					</div>
				{/if}
				<button>Edit Unit</button>
				<input type="hidden" name="id" value={unitId} />
				<input {...getSingleUnitData.fields.unitSkill.as("hidden", parsedUnit?.skill ?? 4)} />
				<input type="hidden" name="eraId" value={selectedEra} />
				<input type="hidden" name="factionId" value={selectedFaction} />
			</form>
		</fieldset>

		<fieldset>
			<p>Detected Skill: {parsedUnit?.skill}</p>
			<label>Skill:<input {...getSingleUnitData.fields.unitSkill.as("number")} bind:value={newSkill} min={rulesDetails?.minSkill ?? 0} max={rulesDetails?.maxSkill ?? 8} /></label>
			<button
				onclick={() => {
					if (existingFixedUnitIndex == -1) fixedUnits.push({ fixed: { ...unitData[index], skill: newSkill }, original: unitData[index] });
					else fixedUnits[existingFixedUnitIndex].fixed = { ...unitData[index], skill: newSkill };
					unitData[index].skill = newSkill;
				}}>Edit Skill</button
			>
		</fieldset>
		<button onclick={() => (open = false)}>Close</button>
	</div>
</Dialog>

<style>
	.add-unit-dialog-body,
	fieldset {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.unit-details {
		display: grid;
		grid-template-columns: max-content 1fr;
	}
	.unit-details p {
		border: 1px solid var(--border);
		padding: 6px;
	}
	button {
		align-self: flex-end;
	}
</style>
