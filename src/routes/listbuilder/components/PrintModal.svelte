<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { enhance } from "$app/forms";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { eras, factions } from "$lib/data/erasFactionLookup";
	import type { UnitList } from "$lib/types/list.svelte";
	import { getContext } from "svelte";

	let list: UnitList = getContext("list");

	let { showPrintModal = $bindable() } = $props();
	let printDialog: HTMLDialogElement;
	let playerName = $state("");
	let style = $state("detailed");

	$effect(() => {
		if (showPrintModal == true) {
			printDialog.showModal();
		} else {
			printDialog.close();
		}
	});

	async function handleForm({ formData, cancel, submitter }: any) {
		showPrintModal = false;
		if (submitter.innerText == "Cancel") {
			cancel();
		} else {
			let body = JSON.stringify({
				units: list.items,
				playername: playerName,
				listname: list.details.name,
				era: list.details.era,
				faction: list.details.faction,
				general: list.details.general,
				style: style,
				condense: false
			});

			formData.append("body", body);

			toastController.addToast("Generating PDF. Your download should start momentarily");
		}
		return async ({ result }: any) => {
			const blob = new Blob([new Uint8Array(Object.values(JSON.parse(result.data.pdf)))], { type: "application/pdf" });
			const downloadElement = document.createElement("a");
			downloadElement.download = list.details.name;
			downloadElement.href = URL.createObjectURL(blob);
			downloadElement.click();
		};
	}
</script>

<dialog
	bind:this={printDialog}
	onclose={() => {
		showPrintModal = false;
	}}
	class:dialog-wide={appWindow.isNarrow}
>
	<div class="dialog-body">
		<h2>Print</h2>
		<form action="?/printList" method="post" use:enhance={handleForm} class="print-form">
			<div><label for="listname">List Name</label><input id="listname" bind:value={list.details.name} /></div>
			<div><label for="playername">Player Name (optional)</label><input id="playername" bind:value={playerName} /></div>
			<div>{`${eras.get(list.details.era)} - ${factions.get(list.details.faction)} with ${factions.get(list.details.general)} general list `}</div>
			<h3>Style</h3>
			<div>
				<label for="list-style-mul"
					><input type="radio" name="list-style-mul" id="list-style-mul" value="mul" bind:group={style} />MUL style - Generates a summary page similar to the MUL printout.</label
				>
			</div>
			<div>
				<label for="list-style-detailed"
					><input type="radio" name="list-style-detailed" id="list-style-detailed" value="detailed" bind:group={style} />Detailed - Generates a summary page with more details for
					quick reference.</label
				>
			</div>
			<div><input type="checkbox" name="drawFormations" id="formations" checked /><label for="formations">Print formations?</label></div>

			<div class="print-buttons">
				<button>Submit</button>
				<button>Cancel</button>
			</div>
		</form>
	</div>
</dialog>

<style>
	.print-form {
		div {
			padding-left: 8px;
		}
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	label,
	input {
		height: 1.25em;
	}
	label {
		margin: 0px 4px;
	}
	.print-buttons {
		margin-top: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 24px;
	}
	h2,
	h3 {
		margin: 8px;
	}
</style>
