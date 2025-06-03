<script lang="ts">
	import type { List, SublistV2 } from "$lib/types/";
	import { Dialog } from "$lib/components/Generic";

	type Props = {
		list: List;
		sublist?: SublistV2;
		open: boolean;
		newSublist: boolean;
	};

	let { list, sublist, open = $bindable(), newSublist }: Props = $props();

	let inProgressSublist = $derived($state.snapshot(sublist));

	let pv = $derived.by(() => {
		return inProgressSublist?.checked.reduce((total, unitId) => {
			return (total += list.getUnit(unitId)?.cost ?? 0);
		}, 0);
	});

	function cancelSublist() {
		if (newSublist) {
			list.deleteSublist(inProgressSublist!.id);
		}
		open = false;
	}

	function updateSublist() {
		sublist!.checked = inProgressSublist!.checked;
		open = false;
	}
</script>

<Dialog title="Edit Sublist" bind:open>
	{#if inProgressSublist}
		<div class="edit-sublist-modal-content">
			<div class="edit-sublist-modal-body">
				<div></div>
				<p class="center">Unit</p>
				<p class="center">Skill</p>
				<p class="center">PV</p>
				{#each list.units.toSorted((a, b) => {
					return b.cost - a.cost;
				}) as unit}
					<input
						type="checkbox"
						id={`checkbox${unit.id}`}
						checked={inProgressSublist?.checked.includes(unit.id)}
						onchange={(e) => {
							if ((e.target as HTMLInputElement).checked) {
								inProgressSublist.checked.push(unit.id);
							} else {
								inProgressSublist.checked = inProgressSublist.checked.filter((id) => {
									return id != unit.id;
								});
							}
						}}
					/>
					<label for={`checkbox${unit.id.toString()}`}>{unit.baseUnit.name}</label>
					<p class="center">{unit.skill}</p>
					<p class="center">{unit.cost}</p>
				{/each}
			</div>
			<div class="edit-sublist-stats">
				<p><span class="muted">Units:</span> {`${inProgressSublist.checked.length}${list.options?.sublistMaxUnits ? `/${list.options.sublistMaxUnits}` : ""}`}</p>
				<p><span class="muted">PV:</span> {`${pv}${list.options?.sublistMaxPv ? `/${list.options.sublistMaxPv}` : ""}`}</p>
			</div>
			<div class="edit-sublist-buttons">
				<button class="edit-sublist-button" onclick={cancelSublist}>Cancel</button>
				<button class="edit-sublist-button" onclick={updateSublist}>Save</button>
			</div>
		</div>
	{:else}
		<p class="error">Invalid Sublist, something went wrong</p>
	{/if}
</Dialog>

<style>
	.edit-sublist-modal-content {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.edit-sublist-modal-body {
		display: grid;
		grid-template-columns: max-content 1fr max-content max-content;
		gap: 4px 12px;
	}
	.edit-sublist-stats {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.edit-sublist-buttons {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 32px;
	}
	.edit-sublist-button {
		font-size: 18px;
		padding: 0px 12px;
	}
</style>
