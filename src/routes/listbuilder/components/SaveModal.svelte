<script lang="ts">
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { getContext } from "svelte";
	import { resultList } from "../resultList.svelte";
	import type { Unit } from "$lib/types/unit";
	import { enhance } from "$app/forms";

	let user: any = getContext("user");
	let list: any = getContext("list");
	let { showSaveModal = $bindable() } = $props();
	let saveDialog: HTMLDialogElement;

	let { listCode, ttsCode } = $derived.by(() => {
		let listCode = "";
		let ttsCode = "";

		listCode += resultList.details.era + ":" + resultList.details.faction;
		list.units.forEach((unit: Unit) => {
			listCode += `:${unit.id},${unit.skill}`;
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
			ttsCode += `{${unit.id},${unit.skill}},`;
		});
		ttsCode = ttsCode.replace(/.$/, "}");

		return { listCode, ttsCode };
	});

	$effect(() => {
		if (showSaveModal == true) {
			saveDialog.showModal();
		} else {
			saveDialog.close();
		}
	});

	function handleSaveList({ formData, cancel }: any) {
		const saveLocation = formData.get("saveLocation");

		if (list.details.name == "") {
			alert("list must have a name");
			cancel();
		} else if (user.username && saveLocation == "accountSave") {
			formData.append("name", list.details.name);
			formData.append("era", resultList.details.era);
			formData.append("faction", resultList.details.faction);
			formData.append("rules", resultList.options?.name);
			let units: string[] = [];
			for (const unit of list.units) {
				units.push(`${unit.id},${unit.skill}`);
			}
			formData.append("units", units.join(":"));
			let sublistString = "";
			if (list.sublists.length) {
				sublistString = list.sublists.join(":");
			}
			formData.append("sublists", sublistString);
			showSaveModal = false;
		} else {
			let listNames = JSON.parse(localStorage.getItem("lists") ?? "[]");
			let index = listNames.indexOf(list.details.name.toLowerCase());
			if (index != -1) {
				let accept = confirm("List with that name already exists in local storage. Overwrite it?");
				if (!accept) {
					return;
				}
			} else {
				listNames.push(list.details.name.toLowerCase());
				localStorage.setItem("lists", JSON.stringify(listNames));
			}
			localStorage.setItem(list.details.name.toLowerCase(), listCode!);
			cancel();
			showSaveModal = false;
		}
		return async () => {
			console.log("list saved");
		};
	}

	function exportToJeff() {
		const jeffList: any = { name: list.details.name, members: [], uuid: crypto.randomUUID(), lastUpdated: new Date().toISOString(), formationBonus: "none", groupLabel: "Lance" };
		for (const unit of list.units) {
			let jumpSpeed = 0;
			for (const move of unit.move) {
				if (move.type == "j") {
					jumpSpeed = move.speed;
				}
			}

			const member: any = {
				mulID: unit.id,
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
	on:close={() => {
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
				on:click={() => {
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
			<button on:click={()=>{
					navigator.clipboard.writeText(listCode!);
				}}>
				<img src="/icons/content-copy.svg" alt="copy to clipboard" class="button-icon" />
			</button>
		</div>
		<div class="export-bar">
			<label for="tts-code">TTS Code: </label><input type="text" name="tts-code" id="tts-code" disabled value={ttsCode} />
			<button on:click={()=>{
					navigator.clipboard.writeText(ttsCode!);
				}}>
				<img src="/icons/content-copy.svg" alt="copy to clipboard" class="button-icon" />
			</button>
		</div>
		<div class="export-bar">
			<label for="jeffs-tools">Jeff's Tools: </label><input type="text" name="jeff-tools" id="jeff's tools" bind:value={list.details.name} />
			<button
				on:click={() => {
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
