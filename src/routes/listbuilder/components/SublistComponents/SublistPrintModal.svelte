<script lang="ts">
	import { toastController } from "$lib/stores/toastController.svelte";
	import type { ListUnit, List } from "$lib/types/list.svelte";
	import { Dialog } from "$lib/generic";
	import { getContext } from "svelte";
	import type { SettingsOutput } from "../../types/settings";
	import { printAllSublists } from "$routes/listbuilder/printing/print.remote";
	import { getBfsById } from "$lib/data/battlefieldSupport";

	type Props = {
		open: boolean;
		list: List;
	};

	let { open = $bindable(), list }: Props = $props();

	let settings: SettingsOutput = getContext("listbuilderSettings");

	const sublistDataString = $derived.by(() => {
		let sublistData = [];
		for (const sublist of list.sublists) {
			let unitList: ListUnit[] = [];
			let pv = 0;
			for (const unitId of sublist.checked) {
				const unit = list.getUnit(unitId);
				if (unit) {
					pv += unit.cost;
					unitList.push(unit);
				} else {
					console.error("Sublist contains unit not found on list");
				}
			}
			for (const [bfsId, count] of sublist.checkedBS.entries()) {
				const bfs = getBfsById(bfsId);
				if (bfs) {
					pv += (bfs.pvCost ?? 0) * count;
				} else {
					console.error("Sublist contains BFS not found on list");
				}
			}
			sublistData.push({ scenario: sublist.scenario, pv, unitList, bfs: Array.from(sublist.checkedBS.entries()) });
		}
		return JSON.stringify(sublistData);
	});

	async function enhancePrintSublists({ submit }: any) {
		toastController.addToast("Generating sublist printout");
		await submit();
		if (printAllSublists.result) {
			const blob = new Blob([new Uint8Array(printAllSublists.result)], { type: "application/pdf" });
			const downloadElement = document.createElement("a");
			downloadElement.download = `${list.details.name} sublists`;
			downloadElement.href = URL.createObjectURL(blob);
			downloadElement.click();
			toastController.addToast("PDF Generation Complete");
		}
	}
</script>

<Dialog title="Print Sublists" triggerClasses="transparent-button" bind:open>
	<form {...printAllSublists.enhance(enhancePrintSublists)} class="printAllForm">
		<input {...printAllSublists.fields.sublists.as("hidden", sublistDataString)} />
		<input {...printAllSublists.fields.name.as("hidden", list.details.name)} />

		<fieldset>
			<legend>Style</legend>
			{#each ["vertical", "horizontal"] as layout}
				<div class="inline gap8">
					<input id={layout} {...printAllSublists.fields.layout.as("radio", layout)} bind:group={settings.sublistUI.sublistPrintAllOrientation} />
					<label for={layout}>
						{layout}
					</label>
				</div>
			{/each}
		</fieldset>
		<fieldset>
			<legend>Options</legend>
			<div class="inline gap8">
				<!-- svelte error with remote form fields and bind:checked -->
				<input type="checkbox" {...printAllSublists.fields.grouped.as("checkbox")} bind:checked={settings.sublistUI.sublistPrintAllGroupByScenario} />
				<label for="sublistPrintGroup">Sort sublists by scenario</label>
			</div>
		</fieldset>
		<div class="center gap8">
			<button>Print</button>
		</div>
	</form>
</Dialog>

<style>
	.printAllForm {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 8px;
	}
	fieldset {
		border: 1px solid var(--border);
		display: flex;
		gap: 16px;
	}
	legend {
		color: var(--surface-color-light-text-color);
	}
</style>
