<script lang="ts">
	import { battlefieldSupport, battlefieldSupportGroups, getBSCbyId } from "$lib/data/battlefieldSupport";
	import { Popover, Select } from "$lib/generic";
	import { TrashIcon } from "$lib/icons";
	import type { List } from "$lib/types/list.svelte";
	import { scaReferences } from "$lib/data";

	let { list = $bindable() }: { list: List } = $props();

	let popoverOpen = $state(false);
	let selectedSCA = $state("");
	const skillRatingTable = ["Legendary", "Heroic", "Elite", "Veteran", "Regular", "Green", "Really Green", "Wet Behind the Ears"];

	function handleAddButton() {
		list.addSCA(Number(selectedSCA));
	}
</script>

<Popover triggerClasses="button" bind:open={popoverOpen}>
	{#snippet trigger()}
		SCA
	{/snippet}
	<div class="popover-body">
		<div class="formation-container">
			<div class="formation-header">
				<p>Name</p>
				<div></div>
			</div>
			{#each list.scaList as sca, index}
				<div class="formation-row">
					<p>{sca.name}</p>
					<button class="transparent-button" onclick={() => list.removeSCA(index)}><TrashIcon height="15" width="15" fill="var(--primary)" /></button>
				</div>
			{/each}
			{#if list.scaList.length == 0}
				<p>No SCA's selected</p>
			{/if}
		</div>
		<div class="popover-footer">
			<div class="sca-footer-row">
				<select bind:value={selectedSCA}>
					{#each scaReferences as sca}
						<option value={sca.id}>{sca.name}</option>
					{/each}
				</select> <button onclick={handleAddButton}>Add</button>
			</div>
			<div class="sca-footer-row">
				<p><span class="muted">Force Avg. Skill:</span> {`${Math.round(list.stats.avgSkill)} (${skillRatingTable[Math.round(list.stats.avgSkill)]})`}</p>
				<p><span class="muted">Current SCA count:</span> {list.scaList.length}</p>
			</div>
			<div>
				<p>Official Recommended SCA's by force skill level:</p>
				<ul>
					<li>Low-rated - <span class="muted">Green(5), Very Green(6), Wet Behind the Ears(7)</span>: 0 SCA's</li>
					<li>Middle-grade - <span class="muted">Regular(4)</span>: 1 SCA</li>
					<li>Experienced - <span class="muted">Veteran(3), Elite(2)</span>: 2 SCA's</li>
					<li>Truly Superior - <span class="muted">Heroic(1), Legendary(0)</span>: 3 SCA's</li>
				</ul>
			</div>
		</div>
	</div>
</Popover>

<style>
	.popover-body {
		background-color: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 4px;
		min-width: min(250px, 90dvw);
	}
	.formation-container {
		max-height: 50dvh;
		overflow-y: auto;
		display: grid;
		grid-template-columns: 1fr repeat(3, max-content);
		margin: 8px 0px;
		row-gap: 4px;
	}
	.formation-header {
		padding: 4px;
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 5;
		gap: 16px;
		border-bottom: 1px solid var(--border);
	}
	.formation-row {
		padding: 4px;
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 5;
		gap: 16px;
	}
	.formation-row:nth-child(odd) {
		background-color: var(--surface-color);
	}

	.popover-footer {
		padding: 4px;
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.sca-footer-row {
		display: flex;
		justify-content: space-between;
		gap: 16px;
	}
	.sca-footer-row p {
		font-size: 0.8em;
	}
	ul {
		padding-top: 4px;
		margin: 0px;
	}
</style>
