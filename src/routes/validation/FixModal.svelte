<script lang="ts">
	import { Dialog } from "$lib/components/global";
	import { type ValidationUnitData, getPossibleUnitList } from "./validate.remote";

	type Props = {
		unit: ValidationUnitData;
	};

	let { unit = $bindable() }: Props = $props();

	let selectedUnitId = $derived(getPossibleUnitList.result?.[0].mulId);
</script>

<Dialog title={`Fix ${unit.name}`}>
	{#snippet trigger()}
		Fix
	{/snippet}
	<p>Parsed Name: {unit.name}</p>
	<form {...getPossibleUnitList}>
		<input type="text" name="searchTerm" id="searchTerm " />
		<button>Search</button>
	</form>
	<select bind:value={selectedUnitId}>
		{#each getPossibleUnitList.result ?? [] as result}
			<option value={result.mulId}>{result.name}</option>
		{/each}
	</select>
</Dialog>
