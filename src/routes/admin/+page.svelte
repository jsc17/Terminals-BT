<script lang="ts">
	import eraFactionData from "$lib/data/erasFactionsList.json";
	import { eraLookup, factionLookup } from "$lib/data/erasFactionLookup.js";
	import { getGeneralList } from "$lib/utilities/bt-utils";
	import { deserialize, enhance } from "$app/forms";
	import { calculateTMM } from "$lib/utilities/bt-utils";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { type MulUnit } from "$lib/types/unit";
	import { loadMULUnit } from "$lib/utilities/load";
	import { type UnitAbility } from "$lib/data/abilities";
	import { createAbilityLineString } from "$lib/utilities/parseAbilities";
	import SendNotification from "./SendNotification.svelte";

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

	let mulId = $state("858");
	let reference = $state<MulUnit>();

	async function handleParse() {
		reference = await loadMULUnit(mulId);
	}
</script>

{#snippet abilityString(ability: UnitAbility)}
	<p>{ability.v !== undefined ? `${ability.v}${ability.vmin ? "*" : ""}` : ""}</p>
	<p>{ability.s !== undefined ? `${ability.s != 0 || ability.smin ? ability.s : "-"}${ability.smin ? "*" : ""}` : ""}</p>
	<p>{ability.m !== undefined ? `/${ability.m != 0 || ability.mmin ? ability.m : "-"}${ability.mmin ? "*" : ""}` : ""}</p>
	<p>{ability.l !== undefined ? `/${ability.l != 0 || ability.lmin ? ability.l : "-"}${ability.lmin ? "*" : ""}` : ""}</p>
	<p>{ability.e !== undefined ? `/${ability.e != 0 || ability.emin ? ability.e : "-"}${ability.emin ? "*" : ""}` : ""}</p>
{/snippet}

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
	<div class="card">
		<button onclick={sendResetEmail}>Send Reset</button>
	</div>

	<div class="card">
		<div class="flex-4">
			<input type="text" bind:value={mulId} />
			<button onclick={handleParse}>Submit</button>
			<p>Madcat:</p>
			<button onclick={() => (mulId = "1980")}>1980</button>
			<p>Demolisher II:</p>
			<button onclick={() => (mulId = "865")}>865</button>
			<p>Panther:</p>
			<button onclick={() => (mulId = "8298")}>8298</button>
		</div>
		<div class="flex-4">{reference?.name}</div>
		<div class="flex-4">
			parsed:
			{#each reference?.abilities ?? [] as ability}
				<div class="section">
					{#if ability.name == "TUR"}
						<p>{ability.name}</p>
						<p>(</p>
						{@render abilityString(ability)}
						{#each ability.turretAbilities ?? [] as turretAbility}
							<p>,&nbsp;</p>
							<p>{turretAbility.name}</p>
							<span style="background-color: blue">{@render abilityString(turretAbility)}</span>
						{/each}
						<p>)</p>
					{:else}
						<p>{ability.name}</p>
						<span style="background-color: blue">{@render abilityString(ability)}</span>
					{/if}
				</div>
			{/each}
		</div>
		<div class="flex-4">
			{#if reference}
				<p>{createAbilityLineString(reference?.abilities)}</p>
			{/if}
		</div>
	</div>

	<SendNotification />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 24px;
		justify-content: flex-start;
		align-items: start;
	}
	.section {
		background-color: var(--muted);
		color: var(--muted-foreground);
		padding: 2px 4px;
		display: flex;
	}
</style>
