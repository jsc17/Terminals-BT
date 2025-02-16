<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { getContext } from "svelte";
	import type { List } from "../../types/list.svelte";
	import type { SublistV2 } from "../../types/sublist";

	let list: List = getContext("list");
	let editSublistDialog: HTMLDialogElement;
	let sublist: SublistV2;

	export function show(id: string) {
		sublist = list.getSublist(id)!;
		editSublistDialog.showModal();
	}
</script>

<dialog bind:this={editSublistDialog} class:dialog-wide={appWindow.isNarrow}>
	{#if sublist}
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
	{/if}
</dialog>
