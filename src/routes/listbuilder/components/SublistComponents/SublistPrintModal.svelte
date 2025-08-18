<script lang="ts">
	import { enhance } from "$app/forms";
	import { toastController } from "$lib/stores/toastController.svelte";
	import type { ListUnit, List } from "$lib/types/list.svelte";
	import { Dialog } from "$lib/generic";
	import { getContext } from "svelte";

	type Props = {
		open: boolean;
		list: List;
	};

	let { open = $bindable(), list }: Props = $props();

	let settings: Settings = getContext("listbuilderSettings");

	function handlePrintForm({ formData, cancel, submitter }: any) {
		if (submitter.innerText == "Cancel") {
			cancel();
			open = false;
			return;
		}

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
			sublistData.push({ scenario: sublist.scenario, pv, unitList });
		}
		formData.append("sublists", JSON.stringify(sublistData));
		formData.append("name", list.details.name);
		toastController.addToast("Generating sublist printout");
		open = false;

		return async ({ result }: any) => {
			const blob = new Blob([new Uint8Array(Object.values(JSON.parse(result.data.pdf)))], { type: "application/pdf" });
			const downloadElement = document.createElement("a");
			downloadElement.download = `${list.details.name} sublists`;
			downloadElement.href = URL.createObjectURL(blob);
			downloadElement.click();
		};
	}
</script>

<Dialog title="Print Sublists" triggerClasses="transparent-button" bind:open>
	<form action="?/printSublists" method="post" use:enhance={handlePrintForm} class="printAllForm">
		<fieldset>
			<legend>Style</legend>
			<div class="inline gap8">
				<input type="radio" name="sublistPrintLayout" id="vertical" value="vertical" bind:group={settings.sublistUI.sublistPrintAllOrientation} /><label for="vertical"
					>Vertical</label
				>
			</div>
			<div class="inline gap8">
				<input type="radio" name="sublistPrintLayout" id="horizontal" value="horizontal" bind:group={settings.sublistUI.sublistPrintAllOrientation} /><label for="horizontal"
					>Horizontal</label
				>
			</div>
		</fieldset>

		<div class="inline gap8">
			<input type="checkbox" name="sublistPrintGrouping" id="sublistPrintGroup" bind:checked={settings.sublistUI.sublistPrintAllGroupByScenario} /><label for="sublistPrintGroup"
				>Group sublists by scenario</label
			>
		</div>

		<div class="center gap8">
			<button>Cancel</button>
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
		color: var(--muted-foreground);
	}
</style>
