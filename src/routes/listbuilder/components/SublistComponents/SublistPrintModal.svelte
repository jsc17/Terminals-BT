<script lang="ts">
	import { enhance } from "$app/forms";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import type { Sublist } from "$lib/types/Sublist.svelte";
	import { toastController } from "$lib/stores/toastController.svelte";
	import type { UnitList } from "../../../../lib/types/list.svelte";
	import { getContext } from "svelte";

	let list: UnitList = getContext("list");
	let { showPrintModal = $bindable() }: { showPrintModal: boolean } = $props();

	let printDialog: HTMLDialogElement;

	$effect(() => {
		if (showPrintModal) {
			printDialog.showModal();
		} else {
			printDialog.close();
		}
	});

	function handlePrintForm({ formData, cancel, submitter }: any) {
		if (submitter.innerText == "Cancel") {
			cancel();
			printDialog.close();
			return;
		}

		let sublistData = [];
		for (const sublist of list.sublists) {
			sublistData.push({ scenario: sublist.scenario, pv: sublist.stats.pv, unitList: $state.snapshot(sublist.unitList) });
		}
		formData.append("sublists", JSON.stringify(sublistData));
		toastController.addToast("Generating sublist printout");
		printDialog.close();

		return async ({ result }: any) => {
			const blob = new Blob([new Uint8Array(Object.values(JSON.parse(result.data.pdf)))], { type: "application/pdf" });
			const downloadElement = document.createElement("a");
			downloadElement.download = `${list.details.name} sublists`;
			downloadElement.href = URL.createObjectURL(blob);
			downloadElement.click();
		};
	}
</script>

<dialog
	bind:this={printDialog}
	class:dialog-wide={appWindow.isNarrow}
	onclose={() => {
		showPrintModal = false;
	}}
>
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
</dialog>
