<script lang="ts">
	import { enhance } from "$app/forms";
	import { toastController } from "$lib/global/stores/toastController.svelte";
	import { type List } from "$lib/types/";
	import { Dialog } from "$lib/global/components";

	type Props = {
		list: List;
	};

	let { list = $bindable() }: Props = $props();

	let openState = $state(false);
	let playerName = $state("");
	let printName = $state("");

	export function open() {
		printName = list.details.name;
		openState = true;
	}

	async function handleForm({ formData, cancel, submitter }: any) {
		openState = false;
		if (submitter.innerText == "Cancel") {
			cancel();
		} else {
			let body = JSON.stringify({
				units: list.units,
				formations: list.formations,
				scas: list.scaList,
				playername: playerName,
				listname: printName,
				eras: list.details.eras,
				factions: list.details.factions,
				general: list.details.general,
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

<Dialog bind:open={openState} title="Print">
	<div class="dialog-body">
		<form action="?/printList" method="post" use:enhance={handleForm} class="print-form">
			<div><label for="print-listname">List Name</label><input id="print-listname" bind:value={printName} /></div>
			<div><label for="print-playername">Player Name (optional)</label><input id="print-playername" bind:value={playerName} /></div>
			<fieldset>
				<legend>Printing Style</legend>
				<div>
					<label for="print-list-style-mul"
						><input type="radio" name="printStyle" id="print-list-style-mul" value="mul" />MUL style - Generates a summary page similar to the MUL printout.</label
					>
				</div>
				<div>
					<label for="print-list-style-detailed"
						><input type="radio" name="printStyle" id="print-list-style-detailed" value="detailed" checked />Detailed - Generates a summary page with more details for quick
						reference.</label
					>
				</div>
			</fieldset>

			<fieldset>
				<legend>Formation Options</legend>
				<div><input type="checkbox" name="drawFormations" id="formations" checked /><label for="formations">Print formations?</label></div>
				<div><input type="checkbox" name="printUnitsByFormation" id="printUnitsByFormation" /><label for="printUnitsByFormation">Print Unit Cards by formation?</label></div>
			</fieldset>
			<fieldset>
				<legend>Card Options</legend>
				<div><input type="radio" name="cardStyle" id="card-type-mul" value="mul" checked /><label for="card-type-mul">Print cards downloaded from the MUL</label></div>
				<div>
					<input type="radio" name="cardStyle" id="card-type-generated" value="generated" /><label for="card-type-generated"
						>Print generated cards. Required for printing SCA's and Alt. Ammo. May take a few seconds to print.</label
					>
				</div>
			</fieldset>
			<div class="print-buttons">
				<button>Cancel</button>
				<button>Print</button>
			</div>
		</form>
	</div>
</Dialog>

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
	fieldset {
		border: 2px solid var(--border);
	}
	legend {
		color: var(--muted-foreground);
	}
	fieldset label {
		color: var(--muted-foreground);
	}
</style>
