<script lang="ts">
	import eraFactionData from "$lib/data/erasFactionsList.json";
	import { eras, factions } from "$lib/data/erasFactionLookup.js";
	import { getGeneralList } from "$lib/utilities/bt-utils";
	import { deserialize, enhance } from "$app/forms";
	import { calculateTMM } from "$lib/utilities/bt-utils";
	import { toastController } from "$lib/stores/toastController.svelte";

	let searchButton: HTMLButtonElement;
	let selectedEra = $state(-1);
	let selectedFaction = $state(-1);

	let allowedFactions = $derived.by(() => {
		let allowed: number[] = [];
		eraFactionData.forEach((era) => {
			if (era.id == selectedEra) {
				era.factions.forEach((faction) => {
					allowed = allowed.concat(faction[1]);
				});
			}
		});
		allowed.sort((a, b) => {
			return factions.get(a)! > factions.get(b)! ? 1 : -1;
		});
		return allowed;
	});
	let general = $derived(getGeneralList(selectedEra, selectedFaction));
	let link = $state("press search");

	function createLink() {
		link = `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=1&MaxPV=100`;
		if (general != undefined && general != -1) {
			link += `&Factions=${general}`;
		}
		if (selectedFaction != undefined) {
			link += `&Factions=${selectedFaction}`;
		}
		if (selectedEra != undefined) {
			link += `&AvailableEras=${selectedEra}`;
		}
	}

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
						class: unit.Class,
						variant: unit.Variant?.trim() == "" ? null : unit.Variant?.trim(),
						tonnage: unit.FormatedTonnage,
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

	//Combobox stuff
	const eraList = eraFactionData.map((era) => {
		return { value: era.id, label: eras.get(era.id)! };
	});

	let inputValue = $state("");
	let touchedInput = $state(false);

	let filteredFruits = $derived.by(() => {
		return inputValue && touchedInput ? eraList.filter((era) => era.label.toLowerCase().includes(inputValue.toLowerCase())) : eraList;
	});
</script>

<main>
	<div class="card">
		<form class="parameters">
			<label for="eraParameter">Era:</label>
			<select bind:value={selectedEra} id="eraParameter">
				{#each eraFactionData as era}
					<option value={era.id}>{eras.get(era.id)}</option>
				{/each}
			</select>
			<label for="factionParameter">Faction:</label>
			{#if selectedEra == -1}
				<select id="factionParameter" disabled> </select>
			{:else}
				<select id="factionParameter" bind:value={selectedFaction}>
					{#each allowedFactions as faction}
						<option value={faction}>{factions.get(faction)}</option>
					{/each}
				</select>
			{/if}
			<div class="parameter">
				<p>General:</p>
				<a href={`http://masterunitlist.info/Era/FactionEraDetails?FactionId=${selectedFaction}&EraId=${selectedEra}`}>{factions.get(general)}</a>
			</div>
			<button id="getData" bind:this={searchButton} onclick={createLink}>Search</button>
		</form>
		<a href={link} target="_blank">{link}</a>
	</div>
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
	<div class="card">
		<button onclick={sendResetEmail}>Send Reset</button>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 24px;
		justify-content: flex-start;
		align-items: start;
	}
	.parameter {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.parameters {
		display: flex;
		align-items: center;
		gap: 16px;
		width: 100%;
	}
	select {
		width: min(100%, 240px);
	}
	select:not([disabled]) {
		border-color: var(--ring);
	}
	a {
		width: 240px;
	}
</style>
