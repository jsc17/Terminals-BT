<script lang="ts">
	import { getContext } from "svelte";
	import type { SublistV2, List, FormationV2 } from "$lib/types/";
	import { exportToJeff } from "../../utilities/export.svelte";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { enhance } from "$app/forms";
	import { Dialog } from "$lib/components/Generic";

	type Props = {
		open: boolean;
		sublist: SublistV2;
		list: List;
	};

	let { open = $bindable(), sublist, list }: Props = $props();

	let exportName = $state("");
	let playerName = $state("");
	let style = $state("detailed");
	let ttsCode = $state("");
	let printName = $state("");

	function onOpenChange() {
		exportName = `${list.details.name} ${sublist.scenario != "-" ? sublist.scenario : "sublist"}`;
		ttsCode = createSublistTTSCode();
		printName = `${list.details.name} ${sublist.scenario} Sublist`;
	}

	function createSublistTTSCode(): string {
		let tempTTSArray: string[] = [];
		sublist.checked.forEach((id) => {
			let unit = list.getUnit(id);
			if (unit && unit.baseUnit.mulId > 0) {
				tempTTSArray.push(`{${unit.baseUnit.mulId},${unit.skill}}`);
			}
		});
		return `{${tempTTSArray.join(",")}}`;
	}
	async function handleForm({ formData }: any) {
		open = false;
		const units = sublist.checked.map((unitId) => {
			return $state.snapshot(list.getUnit(unitId)!);
		});
		const sublistFormation: FormationV2 = {
			id: "temp",
			name: "temp",
			type: "none",
			units: units.map((unit) => {
				return { id: unit.id };
			})
		};
		let body = JSON.stringify({
			units,
			formations: [sublistFormation],
			scas: list.scaList,
			playername: playerName,
			listname: `${list.details.name} ${sublist.scenario != "-" ? sublist.scenario : "sublist"}`,
			eras: list.details.eras,
			factions: list.details.factions,
			general: list.details.general,
			style: style,
			condense: false
		});

		formData.append("body", body);

		toastController.addToast("Generating Sublist PDF. Your download should start momentarily");

		return async ({ result }: any) => {
			const blob = new Blob([new Uint8Array(Object.values(JSON.parse(result.data.pdf)))], { type: "application/pdf" });
			const downloadElement = document.createElement("a");
			downloadElement.download = list.details.name;
			downloadElement.href = URL.createObjectURL(blob);
			downloadElement.click();
		};
	}

	export function exportSublistToJeff() {
		if (sublist.checked.length) {
			const units = sublist.checked.map((unitId) => list.getUnit(unitId)!);
			exportToJeff(exportName, units);
		} else {
			toastController.addToast("Sublist has no selected units");
		}
	}
</script>

<Dialog title="Export / Print Sublist" bind:open {onOpenChange}>
	<div class="export-sublist-dialog-content">
		<fieldset>
			<legend>Print Sublist:</legend>
			<form action="?/printList" method="post" use:enhance={handleForm} class="print-form">
				<div><label for="export-listname">Print title</label><input id="export-listname" bind:value={printName} /></div>
				<div><label for="export-playername">Player Name (optional)</label><input id="export-playername" bind:value={playerName} /></div>
				<h2>Style</h2>
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
				<button class="export-button">Print</button>
			</form>
		</fieldset>
		<fieldset>
			<legend>Export Sublist:</legend>
			<div class="export-bar">
				<label for="print-tts-code">TTS Code: </label><input type="text" name="print-tts-code" id="print-tts-code" disabled value={ttsCode} />
				<button
					onclick={() => {
						navigator.clipboard.writeText(ttsCode!);
						toastController.addToast("code copied to clipboard", 1500);
					}}
				>
					<img src="/icons/content-copy.svg" alt="copy to clipboard" class="button-icon" />
				</button>
			</div>
			<div class="export-bar">
				<label for="jeffs-tools">Jeff's Tools: </label><input type="text" name="jeff-tools" id="jeff's tools" bind:value={list.details.name} />
				<button onclick={exportSublistToJeff}>
					<img src="/icons/download.svg" alt="download to Jeff's Tools" class="button-icon" />
				</button>
			</div>
			<p>
				Note: Everything seems to work from what I've tested, but I can't guarantee they won't change it on their end. I'll try to keep an eye on it, but please let me know if an
				import fails.
			</p>
		</fieldset>
	</div>
</Dialog>

<style>
	h2 {
		font-size: 1.15em;
		margin-bottom: 0;
	}
	p {
		margin: 0;
		color: var(--muted-foreground);
	}
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
	.export-button {
		width: fit-content;
	}
	fieldset {
		border: 1px solid var(--muted);
	}
</style>
