<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { getContext } from "svelte";
	import { enhance } from "$app/forms";
	import { toastController } from "$lib/stores/toastController.svelte";
	import type { ActionResult } from "@sveltejs/kit";
	import { deserialize } from "$app/forms";
	import { exportToJeff } from "../../utilities/export.svelte";
	import type { List } from "$lib/types/list.svelte";
	import { Dialog } from "$lib/generic";

	let user: any = getContext("user");
	type Props = {
		list: List;
	};

	let { list = $bindable() }: Props = $props();

	let existingListNames = $state<{ id: string; name: string }[]>([]);

	let ttsCode = $state("");
	let listCode = $state("");

	export function show() {
		open = true;
		getListNames();
		ttsCode = list.createTTSCode();
		listCode = JSON.stringify(list.getListCode());
	}

	async function getListNames() {
		existingListNames = [];
		const response: any = deserialize(await (await fetch("?/getListNames", { method: "POST", body: "" })).text());
		if (response.status == 200) {
			const lists = JSON.parse(response.data.listNames);
			for (const savedList of lists) {
				existingListNames.push({ id: savedList.id, name: savedList.name.toLowerCase() });
			}
		}
	}

	function handleSaveList({ formData, cancel }: any) {
		const saveLocation = formData.get("saveLocation");

		if (list.details.name == "") {
			alert("list must have a name");
			cancel();
		} else if (user.username && saveLocation == "accountSave") {
			const listNameExists = existingListNames.find((existingList) => {
				return existingList.name == list.details.name.toLowerCase();
			});

			if (listNameExists) {
				if (confirm("A list with that name already exists. Overwrite it?")) {
					formData.append("body", JSON.stringify(list.getListCode()));
					open = false;
				} else {
					cancel();
				}
			} else {
				list.id = crypto.randomUUID();
				formData.append("body", JSON.stringify(list.getListCode()));
				open = false;
			}
		} else {
			let listNames = JSON.parse(localStorage.getItem("lists") ?? "[]");
			const listNameExists = listNames.includes(list.details.name.toLowerCase());
			if (listNameExists) {
				if (confirm("List with that name already exists in local storage. Overwrite it?")) {
					localStorage.setItem(list.details.name.toLowerCase(), JSON.stringify(list.getListCode()));
				}
			} else {
				list.id = crypto.randomUUID();
				listNames.push(list.details.name.toLowerCase());
				localStorage.setItem("lists", JSON.stringify(listNames));
				localStorage.setItem(list.details.name.toLowerCase(), JSON.stringify(list.getListCode()));
			}
			cancel();
			toastController.addToast(`${list.details.name} saved successfully to this device. Consider creating an account to sync lists between devices.`);
			open = false;
		}
		return async ({ result }: { result: ActionResult }) => {
			if (result.status == 200) {
				toastController.addToast(`${list.details.name} saved successfully`);
			} else {
				toastController.addToast(`${list.details.name} failed to save. Please try again.`);
			}
		};
	}

	let open = $state(false);
</script>

<Dialog title="Save List" bind:open>
	{#snippet description()}
		{#if !user.username}
			<p class="error">Login to save lists to account and sync lists between devices</p>
		{/if}
	{/snippet}
	<div class="dialog-body">
		<form method="post" action="?/saveList" use:enhance={handleSaveList}>
			<div class="inline gap8">
				{#if user.username}
					<input type="radio" name="saveLocation" id="saveToAccount" value="accountSave" checked />
					<label for="saveToAccount">Save to account</label>
					<input type="radio" name="saveLocation" id="localSave" value="localSave" />
					<label for="LocalSave">Save to local device storage</label>
				{:else}
					<input type="radio" name="saveLocation" id="accountSave" value="accountSave" disabled />
					<label for="accountSave" style:color="var(--surface-color-light)">Save to account</label>
					<input type="radio" name="saveLocation" id="localSave" value="localSave" checked />
					<label for="LocalSave">Save to local device storage</label>
				{/if}
			</div>
			<div class="export-bar">
				<label for="saveDialogListName">List Name: </label><input type="text" id="saveDialogListName" bind:value={list.details.name} />
				<button>
					<img src="/icons/content-save.svg" alt="save" class="button-icon" />
				</button>
			</div>
		</form>
		<h2>Export Codes:</h2>
		<div class="export-bar">
			<label for="list-code">List Code: </label><input type="text" name="list-code" id="list-code" disabled value={listCode} />
			<button
				onclick={() => {
					const text = new ClipboardItem({ "text/plain": JSON.stringify(list.getListCode()) });
					navigator.clipboard.write([text]);
					toastController.addToast("List code copied to clipboard", 1500);
					open = false;
				}}
			>
				<img src="/icons/content-copy.svg" alt="copy to clipboard" class="button-icon" />
			</button>
		</div>
		<div class="export-bar">
			<label for="save-tts-code">TTS Code: </label><input type="text" name="save-tts-code" id="save-tts-code" disabled value={ttsCode} />
			<button
				onclick={() => {
					const text = new ClipboardItem({ "text/plain": ttsCode });
					navigator.clipboard.write([text]);
					toastController.addToast("code copied to clipboard", 1500);
					open = false;
				}}
			>
				<img src="/icons/content-copy.svg" alt="copy to clipboard" class="button-icon" />
			</button>
		</div>
		<div class="export-bar">
			<label for="save-modal-jeffs-tools">Jeff's Tools: </label><input type="text" name="jeff-tools" id="save-modal-jeffs-tools" bind:value={list.details.name} />
			<button
				onclick={() => {
					if (list.unitCount == 0) {
						toastController.addToast("List is empty");
					} else {
						exportToJeff(list.details.name, list.units);
					}
				}}
			>
				<img src="/icons/download.svg" alt="download to Jeff's Tools" class="button-icon" />
			</button>
		</div>
	</div>
</Dialog>

<style>
	.export-bar {
		display: flex;
		gap: 8px;
		justify-content: center;
		align-items: center;
	}
	input[type="text"] {
		width: 75%;
	}
	.export-bar > button {
		height: 25px;
		width: 25px;
	}
</style>
