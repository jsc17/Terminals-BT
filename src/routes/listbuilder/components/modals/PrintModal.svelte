<script lang="ts">
	import { toastController } from "$lib/stores/toastController.svelte";
	import { type List } from "$lib/types/list.svelte";
	import { Dialog } from "$lib/generic";
	import { getContext } from "svelte";
	import { printList } from "../../printing/print.remote";
	import type { SettingsOutput } from "../../types/settings";
	import type { PrintListOutput } from "../../printing/types";

	type Props = {
		list: List;
	};

	let { list = $bindable() }: Props = $props();

	let settings: SettingsOutput = getContext("listbuilderSettings");

	let openState = $state(false);
	let printName = $derived(list.details.name);

	export function open() {
		openState = true;
	}

	async function handlePrint() {
		let listData: PrintListOutput = {
			name: printName,
			units: list.units.map((u) => ({ id: u.id, mulId: u.baseUnit.mulId, skill: u.skill ?? 4, customization: u.customization })),
			formations: list.formations.map((f) => ({ name: f.name, type: f.type, units: f.units.map((u) => u.id) })),
			scas: list.scaList.map((v) => v.id),
			bs: list.bsList
		};
		toastController.addToast("Generating Pdf for download");
		console.log(settings.print);
		printList({ listData, printOptions: settings.print }).then((pdf) => {
			const blob = new Blob([new Uint8Array(pdf)], { type: "application/pdf" });
			const downloadElement = document.createElement("a");
			downloadElement.download = listData.name;
			downloadElement.href = URL.createObjectURL(blob);
			downloadElement.click();
			toastController.addToast("PDF Generation Complete");
		});

		openState = false;
	}
</script>

<Dialog bind:open={openState} title="Print">
	<div class="dialog-body">
		<div class="print-form">
			<label>List Name <input bind:value={printName} /></label>
			<!-- <div><label for="print-playername">Player Name (optional)</label><input id="print-playername" bind:value={playerName} /></div> -->
			<fieldset>
				<legend>Printing Style</legend>
				<div>
					<label for="print-list-style-mul"
						><input type="radio" name="printStyle" id="print-list-style-mul" value="simple" bind:group={settings.print.printStyle} />MUL style - Generates a summary page similar to
						the MUL printout.</label
					>
				</div>
				<div>
					<label for="print-list-style-detailed"
						><input type="radio" name="printStyle" id="print-list-style-detailed" value="detailed" bind:group={settings.print.printStyle} />Detailed - Generates a summary page with
						more details for quick reference.</label
					>
				</div>
			</fieldset>
			<fieldset>
				<legend>Card Options</legend>
				<div>
					<input type="radio" name="cardStyle" id="card-type-mul" value="mul" bind:group={settings.print.cardStyle} /><label for="card-type-mul"
						>Print cards downloaded from the MUL</label
					>
				</div>
				<div>
					<input type="radio" name="cardStyle" id="card-type-generated" value="generated" bind:group={settings.print.cardStyle} /><label for="card-type-generated"
						>Print generated cards. Required for printing SPA's and Alt. Ammo. May take a few seconds to print.</label
					>
				</div>
			</fieldset>
			<fieldset>
				<legend>Measurement Units</legend>
				<label><input type="radio" name="measurementUnits" value="inches" bind:group={settings.print.measurementUnits} /> Inches</label>
				<label><input type="radio" name="measurementUnits" value="hexes" bind:group={settings.print.measurementUnits} /> Hexes</label>
			</fieldset>
			<fieldset>
				<legend>Formation Options</legend>
				<div class="field-row">
					<input type="checkbox" name="drawFormations" id="formations" bind:checked={settings.print.printFormations} />
					<label for="formations">Print formations?</label>
				</div>
				<div class="field-row">
					<input type="checkbox" name="printUnitsByFormation" id="printUnitsByFormation" bind:checked={settings.print.printCardsByFormation} />
					<label for="printUnitsByFormation">Print Unit Cards by formation?</label>
				</div>
				<div class="field-row">
					<input
						type="checkbox"
						name="printFormationBonuses"
						id="printFormationBonuses"
						bind:checked={settings.print.printFormationBonuses}
						disabled={settings.print.cardStyle != "generated" || true}
					/>
					<label for="printFormationBonuses"><span class="strikethrough">Print formation Bonuses</span> Temporarily disabled while working on an issue</label>
				</div>
				<fieldset class="formation-header-style-group">
					<legend>Formation Header Style:</legend>
					<label for="formationHeaderStyleInline">
						<input type="radio" name="formationHeaderStyle" id="formationHeaderStyleInline" bind:group={settings.print.formationHeaderStyle} value="inline" /> In-line
					</label>
					<label for="formationHeaderStyleSide">
						<input type="radio" name="formationHeaderStyle" id="formationHeaderStyleSide" bind:group={settings.print.formationHeaderStyle} value="side" /> To the side
					</label>
				</fieldset>
			</fieldset>
			<div class="print-buttons">
				<button onclick={() => (openState = false)}>Cancel</button>
				<button onclick={() => handlePrint()}>Print</button>
			</div>
		</div>
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
		display: flex;
		flex-direction: column;
	}
	.field-row {
		display: flex;
		align-items: center;
	}
	legend {
		color: var(--surface-color-light-text-color);
	}
	fieldset label {
		color: var(--surface-color-light-text-color);
	}
	.formation-header-style-group {
		margin-top: 6px;
		display: flex;
		gap: 4px;
	}
</style>
