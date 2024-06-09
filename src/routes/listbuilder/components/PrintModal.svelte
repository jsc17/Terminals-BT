<script lang="ts">
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { enhance } from "$app/forms";
	import { getContext } from "svelte";
	import { toastController } from "$lib/stores/toastController.svelte";

	let list: any = getContext("list");
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
				units: list.units,
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
	on:close={() => {
		showPrintModal = false;
	}}
	class:dialog-wide={appWindow.isNarrow}>
	<div class="dialog-body">
		<h2>Print</h2>
		<form action="/?/print" method="post" use:enhance={handleForm} class="print-form">
			<label for="listname">List Name</label><input id="listname" bind:value={list.details.name} />
			<label for="playername">Player Name (optional)</label><input id="playername" bind:value={playerName} />
			<label for="era">Era</label><input id="era" bind:value={list.details.era} disabled />
			<label for="faction">Faction</label><input id="faction" bind:value={list.details.faction} disabled />
			<label for="general">General List</label><input id="general" bind:value={list.details.general} disabled />
			<label for="list-style-mul"><input type="radio" name="list-style-mul" id="list-style-mul" value="mul" bind:group={style} />MUL style</label>
			<p>Generates a list with a summary page similar to the master unit list. Unit name, type, skill, and PV.</p>
			<label for="list-style-detailed"><input type="radio" name="list-style-detailed" id="list-style-detailed" value="detailed" bind:group={style} />Detailed</label>
			<p>Generates a list with a summary page with more detail for quick reference. Includes damage, health, movement, etc.</p>
			<div class="print-buttons">
				<button>Submit</button>
				<button>Cancel</button>
			</div>
		</form>
	</div>
</dialog>

<style>
	.print-form {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 8px;
	}
	h1 {
		margin: 16px;
	}
	label,
	input {
		height: 1.25em;
	}
	p {
		padding-left: 32px;
	}
</style>
