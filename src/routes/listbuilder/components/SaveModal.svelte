<script lang="ts">
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { getContext } from "svelte";
	import { resultList } from "../resultList.svelte";
	import type { Unit } from "$lib/types/unit";
	import { enhance } from "$app/forms";
	import { toastController } from "$lib/stores/toastController.svelte";
	import type { ActionResult } from "@sveltejs/kit";
	import { deserialize } from "$app/forms";
	import { list } from "../list.svelte";

	let user: any = getContext("user");
	let { showSaveModal = $bindable() } = $props();
	let saveDialog: HTMLDialogElement;
	let existingListNames: string[] = [];

	let { listCode, ttsCode } = $derived.by(() => {
		let listCode = "";
		let ttsCode = "";

		listCode += resultList.details.era + ":" + resultList.details.faction;
		list.units.forEach((unit: Unit) => {
			listCode += `:${unit.mulId},${unit.skill}`;
		});
		listCode += "-";
		if (list.sublists) {
			for (const sublist of list.sublists) {
				listCode += `${sublist.toString()}:`;
			}
			listCode = listCode.substring(0, listCode.length - 1);
		}
		ttsCode = "{";
		list.units.forEach((unit: Unit) => {
			ttsCode += `{${unit.mulId},${unit.skill}},`;
		});
		ttsCode = ttsCode.replace(/.$/, "}");

		return { listCode, ttsCode };
	});

	$effect(() => {
		if (showSaveModal == true) {
			saveDialog.showModal();
			getListNames();
		} else {
			saveDialog.close();
		}
	});

	async function getListNames() {
		existingListNames = [];
		const response: any = deserialize(await (await fetch("?/getListNames", { method: "POST", body: "" })).text());
		if (response.status == 200) {
			const responseNames = JSON.parse(response.data.listNames);
			for (const listName of responseNames) {
				existingListNames.push(listName.name.toLowerCase());
			}
		}
	}

	function handleSaveList({ formData, cancel }: any) {
		const saveLocation = formData.get("saveLocation");

		if (list.details.name == "") {
			alert("list must have a name");
			cancel();
		} else if (user.username && saveLocation == "accountSave") {
			const listNameExists = existingListNames.includes(list.details.name.toLowerCase());
			let overwrite = false;
			if (listNameExists) {
				overwrite = confirm("A list with that name already exists. Overwrite it?");
			}
			if (!listNameExists || overwrite) {
				formData.append("name", list.details.name);
				formData.append("era", resultList.details.era);
				formData.append("faction", resultList.details.faction);
				formData.append("rules", resultList.options?.name);
				let units: string[] = [];
				for (const unit of list.units) {
					units.push(`${unit.mulId},${unit.skill}`);
				}
				formData.append("units", units.join(":"));
				let sublistString = "";
				if (list.sublists.length) {
					sublistString = list.sublists.join(":");
				}
				formData.append("sublists", sublistString);
				showSaveModal = false;
			} else {
				cancel();
			}
		} else {
			let listNames = JSON.parse(localStorage.getItem("lists") ?? "[]");
			const listNameExists = listNames.includes(list.details.name.toLowerCase());
			let overwrite = false;
			if (listNameExists) {
				overwrite = confirm("List with that name already exists in local storage. Overwrite it?");
			}
			if (!listNameExists || overwrite) {
				listNames.push(list.details.name.toLowerCase());
				localStorage.setItem("lists", JSON.stringify(listNames));
			}
			localStorage.setItem(list.details.name.toLowerCase(), listCode!);
			cancel();
			showSaveModal = false;
		}
		return async ({ result }: { result: ActionResult }) => {
			if (result.status == 200) {
				toastController.addToast(`${list.details.name} saved successfully`);
			} else {
				toastController.addToast(`${list.details.name} failed to save. Please try again.`);
			}
		};
	}

	function exportToJeff() {
		const jeffList: any = { name: list.details.name, members: [], uuid: crypto.randomUUID(), lastUpdated: new Date().toISOString(), formationBonus: "none", groupLabel: "Lance" };
		for (const unit of list.units) {
			let jumpSpeed = 0;
			if (unit.move) {
				for (const move of unit.move) {
					if (move.type == "j") {
						jumpSpeed = move.speed;
					}
				}
			}
			const member: any = {
				mulID: unit.mulId,
				damage: {
					short: unit.damageS,
					shortMinimal: unit.damageSMin,
					medium: unit.damageM,
					mediumMinimal: unit.damageMMin,
					long: unit.damageL,
					longMinimal: unit.damageLMin,
					extreme: 0
				},
				variant: unit.variant,
				dateIntroduced: unit.date,
				name: unit.name,
				tonnage: unit.tonnage,
				role: unit.role,
				imageURL: unit.imageLink,
				structure: unit.structure,
				armor: unit.armor,
				type: unit.type,
				size: unit.size,
				abilities: unit.abilities.split(",").map((ability: string) => {
					return ability.trim();
				}),
				overheat: unit.overheat,
				basePoints: unit.pv,
				currentSkill: unit.skill,

				showDetails: false,
				tmm: 0,
				uuid: crypto.randomUUID(),

				threshhold: 0,
				move: unit.move,
				jumpMove: jumpSpeed
			};
			jeffList.members.push(member);
		}
		const blob = new Blob([JSON.stringify(jeffList)], { type: "application/json" });
		const downloadElement = document.createElement("a");
		downloadElement.download = `${list.details.name}.json`;
		downloadElement.href = URL.createObjectURL(blob);
		downloadElement.click();
		downloadElement.remove();
	}
</script>

<dialog
	bind:this={saveDialog}
	onclose={() => {
		showSaveModal = false;
	}}
	class:dialog-wide={appWindow.isNarrow}>
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
					showSaveModal = false;
				}}>X</button>
		</div>

		<form method="post" action="/?/saveList" use:enhance={handleSaveList}>
			<div class="inline gap8">
				{#if user.username}
					<input type="radio" name="saveLocation" id="accountSave" value="accountSave" checked />
					<label for="accountSave">Save to account</label>
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
				<label for="save-local">List Name: </label><input type="text" name="save-local" id="save-local" bind:value={list.details.name} />
				<button>
					<img src="/icons/content-save.svg" alt="save" class="button-icon" />
				</button>
			</div>
		</form>
		<h2>Export Codes:</h2>
		<div class="export-bar">
			<label for="list-code">List Code: </label><input type="text" name="list-code" id="list-code" disabled value={listCode} />
			<button onclick={()=>{
					navigator.clipboard.writeText(listCode!);
					toastController.addToast("code copied to clipboard", 1500);
					showSaveModal = false;
				}}>
				<img src="/icons/content-copy.svg" alt="copy to clipboard" class="button-icon" />
			</button>
		</div>
		<div class="export-bar">
			<label for="tts-code">TTS Code: </label><input type="text" name="tts-code" id="tts-code" disabled value={ttsCode} />
			<button onclick={()=>{
					navigator.clipboard.writeText(ttsCode!);
					toastController.addToast("code copied to clipboard", 1500);
					showSaveModal = false;
				}}>
				<img src="/icons/content-copy.svg" alt="copy to clipboard" class="button-icon" />
			</button>
		</div>
		<div class="export-bar">
			<label for="jeffs-tools">Jeff's Tools: </label><input type="text" name="jeff-tools" id="jeff's tools" bind:value={list.details.name} />
			<button
				onclick={() => {
					exportToJeff();
				}}>
				<img src="/icons/download.svg" alt="download to Jeff's Tools" class="button-icon" />
			</button>
		</div>
	</div>
</dialog>

<style>
	h1 {
		font-size: 1.25rem;
	}
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
