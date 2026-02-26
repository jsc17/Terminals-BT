<script lang="ts">
	import { deserialize, enhance } from "$app/forms";
	import { calculateTMM } from "$lib/utilities/genericBattletechUtilities";
	import { toastController } from "$lib/stores/toastController.svelte";
	import SendNotification from "./SendNotification.svelte";
	import { cacheImages, uploadAmmo, getImage } from "./admin.remote";
	import { dataInitialized, getResultListLocal, initWorker, workerInitialized } from "$lib/local/sqllite/local-db.svelte";
	import type { MulUnit } from "$lib/types/listTypes";

	async function loadUnits() {
		const links: { type: string; link: string }[] = [];

		links.push({ type: "Battlemech part 1", link: `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=1&MaxPV=35&Types=18` });
		links.push({ type: "Battlemech part 2", link: `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=36&MaxPV=45&Types=18` });
		links.push({ type: "Battlemech part 3", link: `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=46&MaxPV=100&Types=18` });
		links.push({ type: "Aerospace", link: `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=1&MaxPV=100&Types=17` });
		links.push({ type: "Combat Vehicle", link: `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=1&MaxPV=100&Types=19` });
		links.push({ type: "Infantry", link: `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=1&MaxPV=100&Types=21` });
		links.push({ type: "IndustrialMech", link: `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=1&MaxPV=100&Types=20` });
		links.push({ type: "Protomech", link: `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=1&MaxPV=100&Types=23` });
		links.push({ type: "Support Vehicle", link: `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=1&MaxPV=100&Types=24` });

		for (const link of links) {
			let response = await fetch(link.link);
			if (response.ok) {
				const unitList = (await response.json()).Units;
				const formattedList: any[] = [];
				for (const unit of unitList) {
					const formattedUnit = {
						mulId: unit.Id,
						name: unit.Name.trim(),
						group: unit.GroupName,
						class: unit.Class,
						variant: unit.Variant?.trim() == "" ? null : unit.Variant?.trim(),
						tonnage: Number(unit.FormatedTonnage),
						technology: unit.Technology.Name,
						rules: unit.Rules,
						date_introduced: Number(unit.DateIntroduced),
						image_url: unit.ImageUrl,
						role: unit.Role.Name,
						type: unit.Type.Name,
						subtype: unit.BFType?.toUpperCase() ?? "Unknown",
						size: unit.BFSize,
						move: unit.BFMove,
						tmm: calculateTMM(Number(unit.BFMove.split('"')[0])),
						armor: unit.BFArmor,
						structure: unit.BFStructure,
						threshold: unit.BFThreshold,
						damage_s: unit.BFDamageShort,
						damage_s_min: unit.BFDamageShortMin,
						damage_m: unit.BFDamageMedium,
						damage_m_min: unit.BFDamageMediumMin,
						damage_l: unit.BFDamageLong,
						damage_l_min: unit.BFDamageLongMin,
						damage_e: unit.BFDamageExtreme,
						damage_e_min: unit.BFDamageExtemeMin,
						overheat: unit.BFOverheat,
						pv: unit.BFPointValue,
						abilities: unit.BFAbilities
					};
					formattedList.push(formattedUnit);
				}
				const formData = new FormData();
				formData.append("unitList", JSON.stringify(formattedList));
				const result: any = deserialize(await (await fetch("?/uploadUnits", { method: "POST", body: formData })).text());
				if (result.status == 200) {
					console.log(`${link.type} loaded`);
					toastController.addToast(`${link.type} loaded`);
				} else {
					console.log(`${link.type} - ${result.data.message}`);
					toastController.addToast(`${link.type} - ${result.data.message}`);
				}
			}
		}
	}

	async function loadFactions() {
		const result: any = deserialize(await (await fetch("?/uploadFactions", { method: "POST", body: "" })).text());
		if (result.ok) {
			console.log(`factions loaded`);
		} else {
			console.log(`factions failed to load - ${result.data.message}`);
		}
	}

	async function linkUnits() {
		const result: any = deserialize(await (await fetch("?/linkUnits", { method: "POST", body: "" })).text());
		if (result.ok) {
			console.log(`unit availability completed`);
		} else {
			console.log(`unit availability failed - ${result.data.message}`);
		}
	}

	async function sendResetEmail() {
		const result: any = deserialize(await (await fetch("?/sendResetEmail", { method: "POST", body: "" })).text());
	}

	async function uploadCustomUnits() {
		const result: any = deserialize(await (await fetch("?/uploadCustom", { method: "POST", body: "" })).text());
	}

	let imageData = $derived(getImage.result?.image);
	let unitData = $state<Promise<MulUnit[]> | undefined>();
</script>

<main>
	<div class="card">
		<button
			onclick={() => {
				loadFactions();
			}}
		>
			Upload Factions
		</button>
		<button
			onclick={() => {
				loadUnits();
			}}
		>
			Upload Units
		</button>
		<button onclick={linkUnits}>Link Units</button>
		<form method="post" action="?/testUnit" use:enhance>
			<input type="text" name="testId" id="testId" />
			<button>Submit</button>
		</form>
	</div>

	<SendNotification />

	<div class="card">
		<h2>Test SQLite Local DB</h2>
		<div>
			<button onclick={() => initWorker()}>Initialize SQLite</button>
			<div class="inline">
				<p>Worker</p>
				{#await workerInitialized.promise}
					❌
				{:then result}
					✅
				{/await}
			</div>
			<div class="inline">
				<p>Data</p>
				{#await dataInitialized.promise}
					❌
				{:then result}
					✅
				{/await}
			</div>
		</div>
		<div>
			<button onclick={() => (unitData = getResultListLocal({ factions: [], eras: [], eraSearchType: "any", factionSearchType: "any" }))}>Get Result List</button>
			{#if unitData}
				{#await unitData}
					Loading...
				{:then result}
					{result.length}
				{/await}
			{:else}
				Waiting
			{/if}
		</div>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 24px;
		justify-content: flex-start;
		align-items: start;
		padding: var(--responsive-padding);
	}
</style>
