<script lang="ts">
	import type { List, Sublist } from "$lib/types/list.svelte";
	import { Dialog } from "$lib/generic";
	import { getBfsById } from "$lib/data/battlefieldSupport";
	import { SvelteMap } from "svelte/reactivity";

	type Props = {
		list: List;
		sublist?: Sublist;
		open: boolean;
	};

	let { list, sublist, open = $bindable() }: Props = $props();

	const tempBFSMap = $derived(new SvelteMap<number, number>([...sublist!.checkedBFS.entries()].map(([k, v]) => [structuredClone(k), structuredClone(v)])));

	const unitPv = $derived(
		sublist!.checked.reduce((total, unitId) => {
			return (total += list.getUnit(unitId)?.cost ?? 0);
		}, 0)
	);
	const bfsPv = $derived(
		tempBFSMap.entries().reduce((total, [id, count]) => {
			return total + (getBfsById(id)?.pvCost ?? 0) * count;
		}, 0)
	);
	let pv = $derived(unitPv + bfsPv);

	let count = $derived.by(() => {
		return sublist?.checked.reduce((total, unitId) => {
			const unit = list.getUnit(unitId);
			if (unit?.baseUnit.mulId && unit?.baseUnit?.mulId > 0) return total + 1;
			return total;
		}, 0);
	});

	function cancelSublist() {
		let existingSublist = list.getSublist(sublist!.id);
		if (existingSublist && existingSublist.checked.length == 0 && existingSublist.checkedBFS.size == 0) {
			list.deleteSublist(existingSublist.id);
		}
		open = false;
	}

	function updateSublist() {
		let existingSublist = list.getSublist(sublist!.id);
		if (existingSublist && sublist) {
			if (sublist?.checked.length == 0 && sublist?.checkedBFS.size == 0) {
				list.deleteSublist(sublist.id);
			} else {
				existingSublist.checked = sublist.checked;
				existingSublist.checkedBFS = tempBFSMap;
			}
		}
		open = false;
	}
</script>

<Dialog title="Edit Sublist" bind:open>
	{#if sublist}
		<div class="edit-sublist-modal-content">
			<div class="edit-sublist-units">
				<div></div>
				<p>Unit</p>
				<p class="center">Skill</p>
				<p class="center">PV</p>
				{#each list.units.toSorted((a, b) => {
					return b.cost - a.cost;
				}) as unit}
					<input
						type="checkbox"
						id={`checkbox${unit.id}`}
						checked={sublist?.checked.includes(unit.id)}
						onchange={(e) => {
							if ((e.target as HTMLInputElement).checked) {
								sublist.checked.push(unit.id);
							} else {
								sublist.checked = sublist.checked.filter((id) => {
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
			<div class="edit-sublists-bs">
				<div></div>
				<p>Battlefield Support</p>
				<p class="center">BSP</p>
				<p class="center">PV</p>
				{#each list.bsList.entries() as [id, count], index}
					{@const bsData = getBfsById(id)}
					<div class="inline">
						<input
							type="number"
							min="0"
							max={count}
							bind:value={
								() => tempBFSMap.get(id) ?? 0,
								(v) => {
									if (v != 0) tempBFSMap.set(id, v);
									else tempBFSMap.delete(id);
								}
							}
						/>
						<p>/{count}x</p>
					</div>
					<label for={`checkbox${index}`}>{bsData?.name}</label>
					{#if bsData?.bspCost}
						<p class="center">{bsData.bspCost}({bsData.bspCost * count})</p>
					{:else}
						<p class="center">-</p>
					{/if}
					{#if bsData?.pvCost}
						<p class="center">{bsData.pvCost}({bsData.pvCost * count})</p>
					{:else}
						<p class="center">-</p>
					{/if}
				{/each}
			</div>
			<div class="edit-sublist-stats">
				<p>
					<span class="muted">Units:</span>
					<span class={{ error: list.options?.sublistMaxUnits && count > list.options.sublistMaxUnits }}>{count}</span
					>{`${list.options?.sublistMaxUnits ? `/${list.options.sublistMaxUnits}` : ""}`}
				</p>
				<p>
					<span class="muted">PV:</span>
					<span class={{ error: list.options?.sublistMaxPv && pv > list.options.sublistMaxPv }}>{pv}</span>{`${list.options?.sublistMaxPv ? `/${list.options.sublistMaxPv}` : ""}`}
				</p>
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
		display: grid;
		grid-template-rows: 1fr max-content max-content;
		gap: 16px;
	}
	.edit-sublist-units,
	.edit-sublists-bs {
		display: grid;
		grid-template-columns: max-content 1fr max-content max-content;
		grid-auto-rows: max-content;
		overflow: auto;
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
