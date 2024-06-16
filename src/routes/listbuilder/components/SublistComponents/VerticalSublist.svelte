<script lang="ts">
	import type { Sublist } from "./Sublist.svelte";
	import { list } from "../../list.svelte";
	import { deserialize } from "$app/forms";

	type componentProps = {
		sublist: Sublist;
		editSublist: any;
		deleteSublist: any;
		copySublist: any;
	};

	const { sublist = $bindable(), editSublist, deleteSublist, copySublist }: componentProps = $props();

	async function printSubList(id: number) {
		let form = new FormData();

		let condense = false;
		if (sublist.checked.length == 9 || sublist.checked.length == 10) {
			condense = true;
		}

		let body = JSON.stringify({
			units: sublist.unitList,
			playername: "",
			listname: list.details.name,
			era: list.details.era,
			faction: list.details.faction,
			general: list.details.general,
			style: "detailed",
			condense: condense
		});
		form.append("body", body);
		let response = deserialize(await (await fetch("/?/print", { method: "POST", body: form })).text());
		//@ts-ignore
		const blob = new Blob([new Uint8Array(Object.values(JSON.parse(response.data.pdf)))], { type: "application/pdf" });
		const downloadElement = document.createElement("a");
		downloadElement.download = list.details.name;
		downloadElement.href = URL.createObjectURL(blob);
		downloadElement.click();
	}
</script>

<main>
	<div class="space-between">
		<select id={`scenario${sublist.id}`} bind:value={sublist.scenario}>
			{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
				<option value={scenario}>{scenario}</option>
			{/each}
		</select>
		<button onclick={() => editSublist(sublist.id)}>Edit</button>
	</div>
	<div class="sublist-body">
		<table>
			<tbody>
				{#each sublist.unitList as unit}
					<tr>
						<td>{unit.name}</td>
						<td>{unit.skill}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div class="sublist-stats">
		<p>PV:</p>
		<p>{`${sublist.stats?.pv ?? 0}/250`}</p>
		<p>Units:</p>
		<p>{`${sublist.checked?.length ?? 0}/10`}</p>
		<p>Total Health:</p>
		<p>{sublist.stats?.health ?? 0}</p>
		<p>Total Short:</p>
		<p>{sublist.stats?.short ?? 0}</p>
		<p>Total Medium:</p>
		<p>{sublist.stats?.medium ?? 0}</p>
		<p>Total Long:</p>
		<p>{sublist.stats?.long ?? 0}</p>
		<p>Avg. Size:</p>
		<p>{sublist.stats?.size ?? 0}</p>
	</div>
	<div class="space-between">
		<button
			onclick={() => {
				printSubList(sublist.id);
			}}>Print Sublist</button>
		<button onclick={() => copySublist(sublist.id)}>Copy</button>
		<button onclick={() => deleteSublist(sublist.id)}>Delete</button>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		background-color: var(--card);
		color: var(--card-foreground);
		border: 1px solid var(--border);
		padding: 8px;
		gap: 16px;
		height: 100%;
		width: 100%;
	}
	.sublist-body {
		flex: 1;
	}
	.sublist-stats {
		display: grid;
		grid-template-columns: max-content 1fr;
		flex-direction: column;
		justify-content: end;
		column-gap: 16px;
		row-gap: 4px;
	}
	.sublist-stats > p:nth-child(odd) {
		text-align: end;
	}
</style>
