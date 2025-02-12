<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import type { List } from "../../types/list.svelte";
	import type { SublistV2 } from "../../types/sublist";

	let { showEditSublistModal = $bindable(), sublist, list, pv }: { showEditSublistModal: boolean; sublist: SublistV2; list: List; pv: Number } = $props();
	let editSublistDialog: HTMLDialogElement;

	$effect(() => {
		if (showEditSublistModal) {
			editSublistDialog.showModal();
		} else {
			editSublistDialog.close();
		}
	});
</script>

<dialog
	bind:this={editSublistDialog}
	class:dialog-wide={appWindow.isNarrow}
	onclose={() => {
		showEditSublistModal = false;
	}}
>
	<div class="dialog-body">
		<table>
			<thead>
				<tr>
					<th></th>
					<th>Unit</th>
					<th>Skill</th>
					<th>PV</th>
				</tr>
			</thead>
			<tbody>
				{#each list.units as unit}
					<tr>
						<td
							><input
								type="checkbox"
								id={`checkbox${unit.id}`}
								checked={sublist.checked.includes(unit.id)}
								onchange={(e) => {
									if ((e.target as HTMLInputElement).checked) {
										sublist.checked.push(unit.id);
									} else {
										sublist.checked = sublist.checked.filter((id) => {
											return id != unit.id;
										});
									}
								}}
							/></td
						>
						<td><label for={`checkbox${unit.id.toString()}`}>{unit.baseUnit.name}</label></td>
						<td>{unit.skill}</td>
						<td>{unit.cost}</td>
					</tr>
				{/each}
			</tbody>
		</table>
		<!-- <div style:display="flex" style:gap="16px">
			<div>{`Units: ${sublist.checked.length}/10`}</div>
			<div>{`PV: ${sublist.stats.pv}/250`}</div>
		</div> -->
		<div class="dialog-buttons">
			<button
				onclick={() => {
					editSublistDialog.close();
				}}>Save</button
			>
		</div>
	</div>
</dialog>
