<script lang="ts">
	import type { PlayUnit } from "../../../types/types";
	import { getCritNameFromCode } from "../../utilities/playmodeUtilities";
	import { Dialog } from "$lib/generic/";

	type Props = {
		unit: PlayUnit;
	};

	let { unit }: Props = $props();

	function removeCritical(index: number) {
		if (confirm(`Remove ${getCritNameFromCode(unit.current.crits[index].type)} from the suffered critical list? This cannot be undone.`)) {
			unit.current.crits.splice(index, 1);
		}
	}
</script>

<Dialog title="Remove Critical">
	{#snippet trigger()}
		Remove Criticals
	{/snippet}

	{#snippet description()}
		<p>
			Remove previously suffered criticals. <span class="error"
				>NOTE: critical order can matter, and there is currently no way to readd a critical to the middle of the list. Proceed with caution.</span
			>
		</p>
	{/snippet}

	<div class="critical-list">
		{#if unit.current.crits.length}
			{#each unit.current.crits as critical, index}
				<div class="critical-row">
					<p>{getCritNameFromCode(critical.type)}</p>
					<button class="remove-button" onclick={() => removeCritical(index)}>Remove</button>
				</div>
			{/each}
		{:else}
			<div class="critical-row">
				<p>Unit hasn't suffered any critical hits yet</p>
			</div>
		{/if}
	</div>
</Dialog>

<style>
	.critical-list {
		display: grid;
		grid-template-columns: max-content 1fr;
		column-gap: 24px;
		border: 1px solid var(--border);
	}
	.critical-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 2;
		border-bottom: 1px solid var(--border);
		padding: 8px 24px;
		width: 100%;
	}
	.remove-button {
		color: black;
		background-color: lightcoral;
		width: max-content;
	}
</style>
