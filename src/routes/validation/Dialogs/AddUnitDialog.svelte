<script lang="ts">
	import { Dialog } from "$lib/generic";
	import { getAllUnitNames, getMULDataFromId } from "$lib/remote/unit.remote";
	import { getRulesByName } from "$lib/rules/rulesets";
	import { toastController } from "$lib/stores";
	import type { ValidationUnitData } from "../types";
	import { getSingleUnitData } from "../validate.remote";

	type Props = {
		unitData: ValidationUnitData[];
		addedUnits: ValidationUnitData[];
		issues?: { issueList: Map<string, Set<string>> };
		selectedRules: string;
		selectedEra: number;
		selectedFaction: number;
	};

	let { unitData = $bindable(), addedUnits = $bindable(), issues = $bindable(), selectedRules, selectedEra, selectedFaction }: Props = $props();

	let open = $state(false);

	let rulesDetails = $derived(getRulesByName(selectedRules));
	let unitFilter = $state("");
	let unitList = $derived(await getAllUnitNames());
	let filteredUnitList = $derived(unitList.filter((unit) => unit.name.toLowerCase().includes(unitFilter.toLowerCase())));
	let selectedUnitId = $derived<number>(filteredUnitList[0].mulId);
	let selectedUnitDetails = $derived(selectedUnitId ? await getMULDataFromId(selectedUnitId) : undefined);
</script>

<Dialog title="Add Unit" bind:open>
	{#snippet trigger()}
		Add Unit
	{/snippet}
	<div class="add-unit-dialog-body">
		<label for="unitFilter"
			>Filter:
			<input id="unitFilter" bind:value={unitFilter} /></label
		>
		<form
			{...getSingleUnitData.enhance(async ({ submit }) => {
				issues = undefined;
				await submit();
				if (getSingleUnitData.result?.status == "success") {
					unitData.push(getSingleUnitData.result.data!);
					addedUnits.push(getSingleUnitData.result.data!);
					console.log(addedUnits);
					open = false;
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
			<label>Skill:<input {...getSingleUnitData.fields.unitSkill.as("number")} value={4} min={rulesDetails?.minSkill ?? 0} max={rulesDetails?.maxSkill ?? 8} /></label>

			<button>Add</button>
			<input type="hidden" name="eraId" value={selectedEra} />
			<input type="hidden" name="factionId" value={selectedFaction} />
		</form>
	</div>
</Dialog>

<style>
	.add-unit-dialog-body {
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
</style>
