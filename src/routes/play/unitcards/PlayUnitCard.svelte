<script lang="ts">
	import type { MulUnit, PlayUnit } from "$lib/types/unit";
	import { getContext, onMount } from "svelte";
	import AeroCritBox from "./card-components/AeroCritBox.svelte";
	import CvCritBox from "./card-components/CvCritBox.svelte";
	import MechCritBox from "./card-components/MechCritBox.svelte";
	import ProtoCritBox from "./card-components/ProtoCritBox.svelte";
	import { DamageModal, HeatModal, CritModal } from "./modals";
	import ExpandModal from "./modals/ExpandModal.svelte";
	import { deserialize } from "$app/forms";

	type Props = {
		unit: PlayUnit;
	};

	let { unit }: Props = $props();

	let openDamageModal = $state(false),
		openHeatModal = $state(false),
		openCritModal = $state(false),
		openExpandModal = $state(false);

	let aeroTypes = ["AF", "CF"];

	let reference = $state<MulUnit>();

	let expanded = getContext("expanded");
	let movementString = $derived(
		reference?.move
			?.map((mode: any) => {
				return `${mode.speed}${!aeroTypes.includes(reference?.subtype ?? "" ?? "") ? `"` : ""}${mode.type ?? ""}`;
			})
			.join("/")
	);
	let armorRemaining = $derived((reference?.armor ?? 0) - unit.current.damage);
	let structRemaining = $derived.by(() => {
		if (armorRemaining < 0) {
			return (reference?.structure ?? 0) + armorRemaining;
		} else {
			return reference?.structure ?? 0;
		}
	});

	async function loadreference() {
		let response: any = deserialize(await (await fetch("/?/getUnit", { method: "POST", body: JSON.stringify({ mulId: unit.mulId }) })).text());
		let tempMovement: { speed: number; type: string }[] = [];
		response.data!.unit.move.split("/").forEach((movement: string) => {
			let moveSpeed = movement.replaceAll('"', "").match(/\d+/) ?? "0";
			let moveType = movement.replaceAll('"', "").match(/\D+/) ?? "";
			tempMovement.push({ speed: parseInt(moveSpeed[0]), type: moveType[0] });
		});
		const unitData = response.data!.unit;
		reference = {
			mulId: unitData.mulId,
			name: unitData.name,
			class: unitData.class,
			variant: unitData.variant,
			type: unitData.type,
			subtype: unitData.subtype.toUpperCase(),
			pv: unitData.pv,
			cost: unitData.pv,
			skill: 4,
			size: unitData.size,
			move: tempMovement,
			tmm: unitData.tmm,
			health: unitData.armor + unitData.structure,
			armor: unitData.armor,
			structure: unitData.structure,
			damageS: unitData.damage_s,
			damageSMin: unitData.damage_s_min,
			damageM: unitData.damage_m,
			damageMMin: unitData.damage_m_min,
			damageL: unitData.damage_l,
			damageLMin: unitData.damage_l_min,
			damageE: unitData.damage_e,
			damageEMin: unitData.damage_e_min,
			overheat: unitData.overheat,
			abilities: (unitData.abilities ?? "-").replaceAll(",", ", "),
			imageLink: unitData.image_url,
			rulesLevel: unitData.rules,
			tonnage: unitData.tonnage,
			date: unitData.date_introduced,
			role: unitData.role,
			availability: unitData.availability,
			threshold: unitData.threshold
		};
	}
	function handleHeat() {
		openHeatModal = true;
	}
	function handleDamage() {
		openDamageModal = true;
	}
	function handleCrit() {
		openCritModal = true;
	}
	function handleExpand() {
		if (!expanded) {
			openExpandModal = true;
		}
	}

	onMount(() => {
		loadreference();
	});
</script>

{#if reference}
	<div class="play-unit-card-container">
		<button class="expand-button" onclick={handleExpand}>
			<div class="flex-between">
				<p class="unit-variant">{reference?.variant}</p>
				<p class="unit-pv bold">PV: {unit.cost}</p>
			</div>
			<div class="flex-between">
				<p class="unit-name bold">{reference?.class}</p>
				{#if structRemaining < (reference?.structure ?? 0) / 2}
					<p class="unit-half-pv">Half: {Math.round(unit.cost / 2)}</p>
				{/if}
			</div>
		</button>
		<div class="play-unit-card-body">
			<div class="unit-card-left">
				<div class="unit-card-block unit-stat-block">
					<div class="stat-block-first-row">
						<p>TP: <span class="bold"> {reference?.subtype ?? ""}</span></p>
						<p>SZ: <span class="bold">{reference?.size}</span></p>
						{#if aeroTypes.includes(reference?.subtype ?? "" ?? "")}
							<p>THR: <span class="bold">{movementString}</span></p>
						{:else}
							<p>TMM: <span class="bold">{reference?.tmm}</span></p>
							<p>MV: <span class="bold">{movementString}</span></p>
						{/if}
					</div>
					<div class="stat-block-second-row">
						<p>Role: <span class="bold">{reference?.role}</span></p>
						<p>Skill: <span class="bold">{unit.skill}</span></p>
					</div>
				</div>
				<div class="unit-card-block unit-damage-block">
					<div>
						<p>S (+0)</p>
						<p class="bold damage">{reference?.damageS}{reference?.damageSMin ? "*" : ""}</p>
					</div>
					<div>
						<p>M (+2)</p>
						<p class="bold damage">{reference?.damageM}{reference?.damageMMin ? "*" : ""}</p>
					</div>
					<div>
						<p>L (+4)</p>
						<p class="bold damage">{reference?.damageL}{reference?.damageLMin ? "*" : ""}</p>
					</div>
					{#if aeroTypes.includes(reference?.subtype ?? "")}
						<div>
							<p>E (+6)</p>
							<p class="bold damage">{reference?.damageE}{reference?.damageEMin ? "*" : ""}</p>
						</div>
					{/if}
				</div>
				{#if ["BM", "IM", "AF", "CF"].includes(reference?.subtype ?? "")}
					<button onclick={handleHeat} class="unit-card-block unit-heat-block">
						<div>
							<p>
								OV:
								<span class="bold damage">{reference?.overheat}</span>
							</p>
						</div>
						<div class="heatscale">
							<p>Heat Scale:</p>
							<div class="heat-level heat-level-first" class:heat-level-1={unit.current.heat >= 1}>1</div>
							<div class="heat-level" class:heat-level-2={unit.current.heat >= 2}>2</div>
							<div class="heat-level" class:heat-level-3={unit.current.heat >= 3}>3</div>
							<div class="heat-level heat-level-last" class:heat-level-4={unit.current.heat >= 4}>S</div>
						</div>
					</button>
				{/if}
				<button class="unit-card-block unit-health-block" class:aero-health-block={aeroTypes.includes(reference?.subtype ?? "")} onclick={handleDamage}>
					<p>A ({armorRemaining >= 0 ? armorRemaining : 0}/{reference?.armor}):</p>
					<div class="health-pips">
						{#each { length: reference?.armor ?? 0 }, index}
							<div class="pip" class:damaged={armorRemaining <= index}></div>
						{/each}
					</div>
					{#if aeroTypes.includes(reference?.subtype ?? "")}
						<p class="bold">TH</p>
					{/if}
					<p>
						S ({structRemaining}/{reference?.structure}):
					</p>
					<div class="health-pips">
						{#each { length: reference?.structure ?? 0 }, index}
							<div class="pip" class:damaged={structRemaining <= index}></div>
						{/each}
					</div>
					{#if aeroTypes.includes(reference?.subtype ?? "")}
						<p class="bold">{reference?.threshold}</p>
					{/if}
				</button>
				<div class="unit-card-block unit-abilities-block">
					<p>{reference?.abilities}</p>
				</div>
			</div>
			<div class="unit-card-right">
				<div class="unit-image-block">
					<img src={reference?.imageLink} alt="unit" class="unit-image" />
					{#if structRemaining <= 0 || unit.current.crits.engine >= 2 || unit.current.crits.destroyed}
						<img src="/icons/close.svg" alt="Destroyed" class="destroyed" />
					{/if}
				</div>
				{#if !["BA", "CI"].includes(reference?.subtype ?? "")}
					<button onclick={handleCrit} class="unit-card-block">
						{#if ["BM", "IM"].includes(reference?.subtype ?? "")}
							<MechCritBox {unit}></MechCritBox>
						{:else if aeroTypes.includes(reference?.subtype ?? "")}
							<AeroCritBox {unit}></AeroCritBox>
						{:else if ["CV", "SV"].includes(reference?.subtype ?? "")}
							<CvCritBox {unit}></CvCritBox>
						{:else if reference?.subtype == "PM"}
							<ProtoCritBox {unit}></ProtoCritBox>
						{/if}
					</button>
				{/if}
			</div>
		</div>
		{#if unit.customization?.spa || unit.customization?.ammo}
			<div class="unit-card-block unit-custom-block">
				{#if unit.customization.spa && unit.customization.spa.length}
					<p><span class="bold">SPA:</span> {unit.customization.spa.join(", ")}</p>
				{/if}
				{#if unit.customization.ammo && unit.customization.ammo.length}
					<p><span class="bold">Alt. ammo:</span> {unit.customization.ammo.join(", ")}</p>
				{/if}
			</div>
		{:else}
			<div class="unit-custom-block"></div>
		{/if}
	</div>

	<DamageModal {unit} bind:open={openDamageModal} {reference}></DamageModal>
	<HeatModal {unit} bind:open={openHeatModal} {reference}></HeatModal>
	<CritModal {unit} bind:open={openCritModal} {reference}></CritModal>
	<ExpandModal {unit} bind:open={openExpandModal} {reference}></ExpandModal>
{:else}
	<p>Loading unit card</p>
{/if}

<style>
	.play-unit-card-container {
		background-color: white;
		padding: 1cqw;
		display: flex;
		flex-direction: column;
		gap: 1cqh;
		width: 100%;
		height: 100%;
	}
	p,
	span {
		color: black;
		font-size: 3.5cqmax;
	}
	.play-unit-card-body {
		flex: 1;
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: 1cqh;
	}
	.expand-button {
		border-radius: 0;
		padding: 0;
		background-color: white;
	}
	.unit-name {
		font-size: 5cqw;
	}
	.unit-pv {
		font-size: 4cqw;
	}
	.unit-half-pv {
		font-size: 3cqw;
	}
	.unit-card-block {
		background-color: rgb(218, 218, 218);
		border: 0.25cqw solid black;
		border-radius: var(--radius);
		padding: 0.5cqmax 1cqmax;
	}
	.unit-card-left,
	.unit-card-right {
		display: flex;
		flex-direction: column;
		gap: 2cqh;
	}

	.unit-image-block {
		position: relative;
		width: 100%;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.unit-image {
		height: 100%;
		width: 100%;
		object-fit: cover;
		object-position: 35% 0%;
	}
	.unit-custom-block {
		min-height: 10cqh;
	}
	.stat-block-first-row {
		display: flex;
		gap: 1.5cqw;
	}
	.stat-block-second-row {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 1.5cqw;
	}
	.unit-damage-block {
		display: flex;
		justify-content: space-evenly;
		p {
			justify-self: center;
		}
	}
	.unit-heat-block {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.heatscale {
		display: flex;
		align-items: center;
	}
	.heat-level {
		background-color: rgb(158, 158, 158);
		border: 0.25cqw solid black;
		width: 5.5cqw;
		font-size: 3cqmax;
		font-weight: bold;
		color: white;
		text-shadow:
			-1px -1px 0 black,
			1px -1px 0 black,
			-1px 1px 0 black,
			1px 1px 0 black;
	}
	.heat-level-first {
		margin-left: 1cqw;
		border-top-left-radius: var(--radius);
		border-bottom-left-radius: var(--radius);
	}
	.heat-level-last {
		border-top-right-radius: var(--radius);
		border-bottom-right-radius: var(--radius);
	}
	.heat-level-1 {
		background-color: yellow;
	}
	.heat-level-2 {
		background-color: orange;
	}
	.heat-level-3 {
		background-color: orangered;
	}
	.heat-level-4 {
		background-color: red;
	}
	.unit-health-block {
		display: grid;
		grid-template-columns: max-content 1fr;
		column-gap: 0.5cqw;
	}
	.aero-health-block {
		grid-template-columns: max-content 1fr max-content;
		p {
			align-self: center;
		}
	}
	.health-pips {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.25cqw;
	}
	.pip {
		background-color: white;
		border: 0.25cqw solid black;
		border-radius: 50%;
		height: 3cqmax;
		width: 3cqmax;
	}
	.damaged {
		background-color: red;
	}
	.unit-abilities-block {
		flex: 1;
		p {
			font-size: 3cqmax;
		}
	}

	.destroyed {
		width: 100%;
		height: 100%;
		filter: invert(11%) sepia(73%) saturate(6763%) hue-rotate(3deg) brightness(123%) contrast(120%);
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
