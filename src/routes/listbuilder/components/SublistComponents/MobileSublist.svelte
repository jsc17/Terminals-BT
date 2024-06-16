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
		return (
			sublist.unitList
				?.map((unit) => {
					return `${unit.name} (${unit.skill})`;
				})
				.join(", ") ?? ""
		);
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
		<select id={`scenario${sublist.id}`} bind:value={sublist.scenario}>
			{#each ["-", "Bunkers", "Capture the Flag", "Domination", "Headhunter", "Hold the Line", "King of the Hill", "Overrun", "Stand Up Fight"] as scenario}
				<option value={scenario}>{scenario}</option>
			{/each}
		</select>
		<button onclick={() => copySublist(sublist.id)}>Copy</button>
		<button onclick={() => editSublist(sublist.id)}>Edit</button>
	</div>
	<div class="sublist-units-mobile">
		<div>{unitString ?? ""}</div>
	</div>
	<div class="center gap8">
		<button
			onclick={() => {
				printSubList(sublist.id);
			}}>Print Sublist</button>
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
</style>
