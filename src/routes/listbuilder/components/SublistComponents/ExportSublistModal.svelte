<script lang="ts">
	import { getContext } from "svelte";
	import type { SublistV2 } from "../../types/sublist";
	import type { List } from "../../types/list.svelte";
	import { exportToJeff } from "../../utilities/export.svelte";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { eras, factions } from "$lib/data/erasFactionLookup";
	import { enhance } from "$app/forms";

	let list: List = getContext("list");

	let exportDialog: HTMLDialogElement;
	let sublist: SublistV2;
	let exportName = $state("");
	let playerName = $state("");
	let style = $state("detailed");
	let ttsCode = $state("");
	let printName = $state("");

	export function show(id: string) {
		sublist = list.getSublist(id)!;
		exportName = `${list.details.name} ${sublist.scenario != "-" ? sublist.scenario : "sublist"}`;
		exportDialog.showModal();
		ttsCode = list.createTTSCode();
		printName = `${list.details.name} ${sublist.scenario} Sublist`;
	}

	async function handleForm({ formData }: any) {
		exportDialog.close();
		const units = sublist.checked.map((unitId) => {
			return list.getUnit(unitId);
		});
		let body = JSON.stringify({
			units,
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

<dialog bind:this={exportDialog} class:dialog-wide={appWindow.isNarrow}>
	<div class="dialog-body">
		<div class="dialog-header">
			<h1>Print/Export Sublist</h1>
			<button
				class="close-button"
				onclick={() => {
					exportDialog.close();
				}}><img src="/icons/close.svg" alt="close button" /></button
			>
		</div>
		<h2>Print Sublist:</h2>
		<hr />
		<form action="?/printList" method="post" use:enhance={handleForm} class="print-form">
			<div><label for="listname">Print title</label><input id="listname" bind:value={printName} /></div>
			<div><label for="playername">Player Name (optional)</label><input id="playername" bind:value={playerName} /></div>
			<div>{`${eras.get(list.details.era)} - ${factions.get(list.details.faction)} with ${factions.get(list.details.general)} general list `}</div>
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
		<h2>Export Sublist:</h2>
		<hr />
		<div class="export-bar">
			<label for="tts-code">TTS Code: </label><input type="text" name="tts-code" id="tts-code" disabled value={ttsCode} />
			<button
				onclick={() => {
					navigator.clipboard.writeText(ttsCode!);
					toastController.addToast("code copied to clipboard", 1500);
					exportDialog.close();
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
	</div>
</dialog>

<style>
	.dialog-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	h1 {
		font-size: 1.25em;
		margin-right: 3em;
	}
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
	.close-button {
		background-color: transparent;
		img {
			height: 35px;
			width: 35px;
			filter: var(--primary-filter);
		}
	}
	.export-button {
		width: fit-content;
	}
	hr {
		width: 100%;
		border: 1px solid var(--muted);
	}
</style>
