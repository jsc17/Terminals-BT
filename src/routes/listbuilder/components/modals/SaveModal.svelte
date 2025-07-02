<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { getContext } from "svelte";
	import { enhance } from "$app/forms";
	import { toastController } from "$lib/stores/toastController.svelte";
	import type { ActionResult } from "@sveltejs/kit";
	import { deserialize } from "$app/forms";
	import { exportToJeff } from "../../utilities/export.svelte";
	import type { List } from "$lib/types/list.svelte";

	let user: any = getContext("user");
	type Props = {
		list: List;
	};

	let { list = $bindable() }: Props = $props();

	let saveDialog = $state<HTMLDialogElement>();
	let existingListNames = $state<{ id: string; name: string }[]>([]);

	let ttsCode = $state("");
	let listCode = $state("");

	export function show() {
		saveDialog?.showModal();
		getListNames();
		ttsCode = list.createTTSCode();
		listCode = list.getListCode();
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
					formData.append("body", list.getListCode());
					saveDialog?.close();
				} else {
					cancel();
				}
			} else {
				list.id = crypto.randomUUID();
				formData.append("body", list.getListCode());
				saveDialog?.close();
			}
		} else {
			let listNames = JSON.parse(localStorage.getItem("lists") ?? "[]");
			const listNameExists = listNames.includes(list.details.name.toLowerCase());
			if (listNameExists) {
				if (confirm("List with that name already exists in local storage. Overwrite it?")) {
					localStorage.setItem(list.details.name.toLowerCase(), list.getListCode());
				}
			} else {
				list.id = crypto.randomUUID();
				listNames.push(list.details.name.toLowerCase());
				localStorage.setItem("lists", JSON.stringify(listNames));
				localStorage.setItem(list.details.name.toLowerCase(), list.getListCode());
			}
			cancel();
			toastController.addToast(`${list.details.name} saved successfully to this device. Consider creating an account to sync lists between devices.`);
			saveDialog?.close();
		}
		return async ({ result }: { result: ActionResult }) => {
			if (result.status == 200) {
				toastController.addToast(`${list.details.name} saved successfully`);
			} else {
				toastController.addToast(`${list.details.name} failed to save. Please try again.`);
			}
		};
	}
</script>

<dialog bind:this={saveDialog} class:dialog-wide={appWindow.isNarrow}>
	<div class="dialog-body">
		<div class="space-between">
			{#if user.username}
				<div></div>
			{:else}
				<p>Login to save lists to account and sync lists between devices</p>
			{/if}
			<button
				class="close-button"
				onclick={() => {
					saveDialog?.close();
				}}>X</button
			>
		</div>

		<form method="post" action="?/saveList" use:enhance={handleSaveList}>
			<div class="inline gap8">
				{#if user.username}
					<input type="radio" name="saveLocation" id="saveToAccount" value="accountSave" checked />
					<label for="saveToAccount">Save to account</label>
					<input type="radio" name="saveLocation" id="localSave" value="localSave" />
					<label for="LocalSave">Save to local device storage</label>
				{:else}
					<input type="radio" name="saveLocation" id="accountSave" value="accountSave" disabled />
					<label for="accountSave" style:color="var(--muted)">Save to account</label>
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
					const text = new ClipboardItem({ "text/plain": list.getListCode() });
					navigator.clipboard.write([text]);
					toastController.addToast("List code copied to clipboard", 1500);
					saveDialog?.close();
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
					saveDialog?.close();
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
		<p>
			Note: Everything seems to work from what I've tested, but I can't guarantee they won't change it on their end. I'll try to keep an eye on it, but please let me know if an
			import fails.
		</p>
	</div>
</dialog>

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
