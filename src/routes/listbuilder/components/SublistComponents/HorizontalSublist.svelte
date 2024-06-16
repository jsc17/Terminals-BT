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

	let unitString = $derived.by(() => {
		return sublist.unitList
			.map((unit) => {
				return `${unit.name} (${unit.skill})`;
			})
			.join(", ");
	});

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
		<div class="center gap8">
			<select id={`scenario${sublist.id}`} bind:value={sublist.scenario}>
				{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
					<option value={scenario}>{scenario}</option>
				{/each}
			</select>
			<button onclick={() => copySublist(sublist.id)}>Copy</button>
			<button onclick={() => editSublist(sublist.id)}>Edit</button>
		</div>
		<div class="center gap8">
			<button
				onclick={() => {
					printSubList(sublist.id);
				}}>Print Sublist</button>
			<button onclick={() => deleteSublist(sublist.id)}>Delete</button>
		</div>
	</div>
	<div class="sublist-units-horizontal gap8">
		<div>{unitString}</div>
		<!-- {#each sublist.unitList as unit}
			<div>{`${unit.name} (${unit.skill}),`}</div>
		{/each} -->
	</div>
	<div class="inline gap8">
		<div>PV: {`${sublist.stats?.pv ?? 0}/250`}</div>
		<div>Units: {`${sublist.checked?.length ?? 0}/10`}</div>
		<div>Total Health: {sublist.stats?.health ?? 0}</div>
		<div>Total Short: {sublist.stats?.short ?? 0}</div>
		<div>Total Medium: {sublist.stats?.medium ?? 0}</div>
		<div>Total Long: {sublist.stats?.long ?? 0}</div>
		<div>Avg. Size: {sublist.stats?.size ?? 0}</div>
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
	.sublist-units-horizontal {
		display: flex;
		flex-wrap: wrap;
	}
</style>
