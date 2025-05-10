<script lang="ts">
	import { getContext } from "svelte";
	import { scaReferences } from "$lib/data";
	import type { List } from "../types/list.svelte";

	const skillRatingTable = ["Legendary", "Heroic", "Elite", "Veteran", "Regular", "Green", "Really Green", "Wet Behind the Ears"];

	let scaModal = $state<HTMLDialogElement>();
	let list: List = getContext("list");
	let scaToAdd = $state<number>(scaReferences[0].id);

	export function show() {
		scaModal?.showModal();
	}

	function close() {
		scaModal?.close();
	}

	function handleAddButton() {
		list.addSCA(scaToAdd);
	}
</script>

<dialog bind:this={scaModal}>
	<div class="dialog-body">
		<div class="dialog-header">
			<div>Add Special Command Ability</div>
			<button onclick={close}> Close </button>
		</div>
		<p>Official Recommended SCA's by force skill level:</p>
		<ul>
			<li>Low-rated - <span class="muted">Green(5), Very Green(6), Wet Behind the Ears(7)</span>: 0 SCA's</li>
			<li>Middle-grade - <span class="muted">Regular(4)</span>: 1 SCA</li>
			<li>Experienced - <span class="muted">Veteran(3), Elite(2)</span>: 2 SCA's</li>
			<li>Truly Superior - <span class="muted">Heroic(1), Legendary(0)</span>: 3 SCA's</li>
		</ul>
		<div class="sca-add-row">
			<div><span class="muted">Force Avg. Skill:</span> {`${Math.round(list.stats.avgSkill)} (${skillRatingTable[Math.round(list.stats.avgSkill)]})`}</div>
			<div><span class="muted">Current SCA count:</span> {list.scaList.length}</div>
		</div>
		<div class="sca-add-row">
			<select bind:value={scaToAdd}>
				{#each scaReferences as sca}
					<option value={sca.id}>{sca.name}</option>
				{/each}
			</select>
			<button
				onclick={() => {
					handleAddButton();
				}}>Add</button
			>
		</div>
	</div>
</dialog>

<style>
	.dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0px 2px 4px 2px;
		border-bottom: 1px solid var(--border);
	}
	.sca-add-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.muted {
		font-size: 0.75em;
	}
	ul {
		margin: 0px;
	}
</style>
