<script lang="ts">
	import { enhance } from "$app/forms";
	import { toastController } from "$lib/stores/toastController.svelte";
	import type { UnitV2, List } from "$lib/types/";
	import { Dialog } from "$lib/components/Generic";

	type Props = {
		open: boolean;
		list: List;
	};

	let { open = $bindable(), list }: Props = $props();

	function handlePrintForm({ formData, cancel, submitter }: any) {
		if (submitter.innerText == "Cancel") {
			cancel();
			open = false;
			return;
		}

		let sublistData = [];
		for (const sublist of list.sublists) {
			let unitList: UnitV2[] = [];
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
	<form action="?/printSublists" method="post" use:enhance={handlePrintForm} class="padding8">
		<div class="inline column gap8">
			<div class="inline gap8"><input type="radio" name="sublistPrintLayout" id="vertical" value="vertical" checked /><label for="vertical">Vertical</label></div>
			<div class="inline gap8"><input type="radio" name="sublistPrintLayout" id="horizontal" value="horizontal" /><label for="horizontal">Horizontal</label></div>

			<div class="inline gap8"><input type="checkbox" name="sublistPrintGrouping" id="sublistPrintGroup" /><label for="sublistPrintGroup">Group sublists by scenario</label></div>
		</div>
		<div class="center gap8">
			<button>Cancel</button>
			<button>Print</button>
		</div>
	</form>
</Dialog>
