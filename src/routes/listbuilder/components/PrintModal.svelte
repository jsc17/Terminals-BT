<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { enhance } from "$app/forms";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { eras, factions } from "$lib/data/erasFactionLookup";
	import { getContext } from "svelte";
	import { type List } from "../types/list.svelte";

	let list: List = getContext("list");

	let printDialog: HTMLDialogElement;
	let playerName = $state("");
	let style = $state("detailed");
	let printName = $state("");

	export function show() {
		printDialog.showModal();
		printName = list.details.name;
	}

	async function handleForm({ formData, cancel, submitter }: any) {
		printDialog.close();
		if (submitter.innerText == "Cancel") {
			cancel();
		} else {
			let body = JSON.stringify({
				units: list.units,
				formations: list.formations,
				playername: playerName,
				listname: printName,
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

<dialog bind:this={printDialog} class:dialog-wide={appWindow.isNarrow}>
	<div class="dialog-body">
		<h2>Print</h2>
		<form action="?/printList" method="post" use:enhance={handleForm} class="print-form">
			<div><label for="print-listname">Print title</label><input id="print-listname" bind:value={printName} /></div>
			<div><label for="print-playername">Player Name (optional)</label><input id="print-playername" bind:value={playerName} /></div>
			<div>{`${eras.get(list.details.era)} - ${factions.get(list.details.faction)} with ${factions.get(list.details.general)} general list `}</div>
			<h3>Style</h3>
			<div>
				<label for="print-list-style-mul"
					><input type="radio" name="print-list-style-mul" id="print-list-style-mul" value="mul" bind:group={style} />MUL style - Generates a summary page similar to the MUL
					printout.</label
				>
			</div>
			<div>
				<label for="print-list-style-detailed"
					><input type="radio" name="print-list-style-detailed" id="print-list-style-detailed" value="detailed" bind:group={style} />Detailed - Generates a summary page with more
					details for quick reference.</label
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
