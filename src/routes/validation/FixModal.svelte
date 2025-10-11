<script lang="ts">
	import { Dialog } from "$lib/generic";
	import { toastController } from "$lib/stores";
	import type { ValidationUnitData } from "./types";
	import { fixUnitData, getPossibleUnitList } from "./validate.remote";

	type Props = {
		unit: ValidationUnitData;
		era: number;
		faction: number;
		fixedData: boolean;
	};

	let { unit = $bindable(), era, faction, fixedData = $bindable() }: Props = $props();

	let open = $state(false);
</script>

<Dialog title={`Fix ${unit.name}`} bind:open>
	{#snippet trigger()}
		Edit
	{/snippet}
	<div class="fix-dialog-body">
		<p>Name parsed from pdf: <input type="text" value={unit.name} disabled /></p>
		<form {...getPossibleUnitList}>
			<label>Filter: <input type="text" name="searchTerm" id="searchTerm " /></label>
			<button>Search</button>
		</form>
		<form
			class="flex-column"
			{...fixUnitData.enhance(async ({ submit }) => {
				await submit();
				if (fixUnitData.result?.status == "failed") {
					toastController.addToast(fixUnitData.result.message ?? "Invalid Message recieved");
				} else {
					unit = fixUnitData.result!.data!;
					fixedData = true;
					open = false;
				}
			})}
		>
			{#if getPossibleUnitList.result == undefined}
				<p class="muted">Use the search above to</p>
			{/if}
			<label
				>Corrected Unit:
				<select name="selectedUnitId" class="unit-select" disabled={getPossibleUnitList.result == undefined}>
					{#each getPossibleUnitList.result ?? [] as result}
						<option value={result.mulId}>{result.name}</option>
					{/each}
				</select>
			</label>
			<div class="inline">
				<label>Skill: <input name="unitSkill" type="number" min="0" max="7" defaultValue="4" /></label>
				<button>Fix</button>
			</div>
			<input type="hidden" name="eraId" value={era} />
			<input type="hidden" name="factionId" value={faction} />
		</form>
	</div>
</Dialog>

<style>
	.fix-dialog-body {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.unit-select {
		min-width: 200px;
	}
</style>
