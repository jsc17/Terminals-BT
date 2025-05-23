<script lang="ts">
	import type { MulUnit, PlayUnit } from "$lib/types/unit";
	import { getContext, onMount } from "svelte";
	import AeroCritBox from "./card-components/AeroCritBox.svelte";
	import CvCritBox from "./card-components/CvCritBox.svelte";
	import MechCritBox from "./card-components/MechCritBox.svelte";
	import ProtoCritBox from "./card-components/ProtoCritBox.svelte";
	import { DamageModal, HeatModal, CritModal } from "./modals";
	import ExpandModal from "./modals/ExpandModal.svelte";
	import { loadreference } from "./utilities/loadReference";
	import * as auto from "./utilities/automation";
	import type { Options } from "../types";
	import { infTypes, mechTypes, typeIncludes, vTypes } from "./utilities/utilities";

	type Props = {
		unit: PlayUnit;
		options: Options;
	};

	let { unit, options }: Props = $props();

	let openDamageModal = $state(false),
		openHeatModal = $state(false),
		openCritModal = $state(false),
		openExpandModal = $state(false);

	let aeroTypes = ["AF", "CF"];

	let reference = $state<MulUnit>();

	let expanded = getContext("expanded");
	let critCount = $derived(auto.countCrits(unit));
	let moveSpeeds = $derived(auto.calculateMovement(unit, reference));
	let armorRemaining = $derived(auto.calculateArmor(unit, reference));
	let structRemaining = $derived(auto.calculateStructure(unit, reference));
	let firepowerRemaining = $derived(auto.calculateFirepower(unit, reference));
	let currentSkill = $derived(auto.calculateSkill(unit, critCount.current, reference));
	let physical = $derived(auto.calculatePhysical(moveSpeeds[0].tmm, firepowerRemaining.s, reference));

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
		loadreference(unit.mulId).then((value) => {
			reference = value;
		});
	});
</script>

{#snippet damageValue(original: number, min: boolean, current: number)}
	{#if options.renderOriginal || options.renderOriginal === undefined}
		<p>
			<span class="bold">{original}{min ? "*" : ""}</span>
			{#if critCount.current.weapon || ((reference?.subtype == "CV" || reference?.subtype == "SV") && critCount.current.engine)}
				(<span class="damaged-stat">{current}</span>)
			{/if}
		</p>
	{:else}
		<p class="bold" class:damaged-stat={critCount.current.weapon}>{current}{min && !critCount.current.weapon ? "*" : ""}</p>
	{/if}
{/snippet}

{#if reference}
	<div class="play-unit-card-container">
		<button class="expand-button" onclick={handleExpand}>
			<div class="flex-between">
				<p class="unit-variant">{reference?.variant}</p>
				<p class="unit-pv bold">PV: {unit.cost}</p>
			</div>
			<div class="flex-between">
				<p class="unit-name bold">{reference?.class}</p>
				{#if structRemaining.current < (reference?.structure ?? 0) / 2}
					<p class="unit-half-pv">Half: {Math.round(unit.cost / 2)}</p>
				{/if}
			</div>
		</button>
		<div class="play-unit-card-body">
			<div class="unit-card-left">
				<div class="unit-card-block unit-stat-block">
					<div class="stat-block-first-row">
						<p>
							TP:
							<span class="bold">{reference?.subtype ?? ""}</span>
						</p>
						<p>SZ: <span class="bold">{reference?.size}</span></p>
						{#if typeIncludes([...aeroTypes], reference)}
							<p>
								THR: <span class="bold" class:damaged-stat={critCount.current.engine}>{moveSpeeds[0].speed}{moveSpeeds[0].type}</span>
							</p>
						{:else}
							<p>
								TMM: {#each moveSpeeds as { tmm, type, damaged }, index}
									{#if index == 0 || (tmm != moveSpeeds[0].tmm && options.showJumpTMM)}
										{#if index != 0}/{/if}<span class="bold" class:damaged-stat={damaged}>{tmm}{type == "j" ? "j" : ""}</span>
									{/if}
								{/each}
							</p>
							<p>
								MV: {#if moveSpeeds[0].type == "I"}<span class="damaged-stat">Immobile</span>{:else}{#each moveSpeeds as { speed, type, damaged }, index}
										<span class="bold" class:damaged-stat={damaged}>{speed}"{type}</span>{#if index + 1 != moveSpeeds.length}/{/if}
									{/each}
								{/if}
							</p>
						{/if}
					</div>
					<div class="stat-block-second-row">
						<p>Role: <span class="bold">{reference?.role}</span></p>
						<p>
							Skill: <span class="bold">{unit.skill}</span>
							{#if unit.current.heat || critCount.current.firecontrol}
								(<span class="damaged-stat">{currentSkill.ranged}</span>)
							{/if}
						</p>
					</div>
				</div>
				<div class="unit-card-block unit-damage-block">
					{#if options.showPhysical && physical.attackTypeCount}
						<div>
							{#if physical.standard && physical.charge !== undefined}
								<p class="damage-header"><span class="small-header">Phy (+0)</span> / <span class="small-header">Chg (+1)</span></p>
								<p class="bold">
									{physical.standard} / <span class:damaged-stat={moveSpeeds[0].damaged}>{physical.charge}</span>
								</p>
							{/if}
							{#if physical.melee && physical.charge !== undefined}
								<p class="damage-header"><span class="small-header">Mel (+0)</span> / <span class="small-header">Chg (+1)</span></p>
								<p class="bold">
									{physical.melee} / <span class:damaged-stat={moveSpeeds[0].damaged}>{physical.charge}</span>
								</p>
							{/if}
							{#if !physical.standard && !physical.melee && physical.charge !== undefined}
								<p>Chg (+1)</p>
								<p class="bold">
									<span class:damaged-stat={moveSpeeds[0].damaged}>{physical.charge}</span>
								</p>
							{/if}
							{#if physical.am !== undefined}
								<p>AM (+1)</p>
								<p class="bold">{physical.am}</p>
							{/if}
						</div>
					{/if}
					<div>
						<p>S (+0)</p>
						{@render damageValue(reference.damageS ?? 0, reference.damageSMin ?? false, firepowerRemaining.s)}
					</div>
					<div>
						<p>M (+2)</p>
						{@render damageValue(reference.damageM ?? 0, reference.damageMMin ?? false, firepowerRemaining.m)}
					</div>
					<div>
						<p>L (+4)</p>
						{@render damageValue(reference.damageL ?? 0, reference.damageLMin ?? false, firepowerRemaining.l)}
					</div>
					{#if typeIncludes([...aeroTypes], reference)}
						<div>
							<p>E (+6)</p>
							{@render damageValue(reference.damageE ?? 0, reference.damageEMin ?? false, firepowerRemaining.e)}
						</div>
					{/if}
				</div>
				{#if typeIncludes([...mechTypes, ...aeroTypes], reference)}
					<button onclick={handleHeat} class="unit-card-block unit-heat-block">
						<div class="flex-4">
							<p>OV:</p>
							{@render damageValue(reference.ov ?? 0, false, firepowerRemaining.ov)}
						</div>
						{unit.current.heat}/{unit.pending.heat}
						<div class="heatscale">
							<p>Heat Scale:</p>
							<div
								class="heat-level heat-level-first"
								class:heat-level-1={unit.current.heat >= 1}
								class:pending-heat={unit.pending.heat >= 1 && unit.current.heat < 1}
								class:pending-cooldown={unit.pending.heat <= 1 && unit.current.heat > 1}
							>
								1
							</div>
							<div
								class="heat-level"
								class:heat-level-2={unit.current.heat >= 2}
								class:pending-heat={unit.pending.heat >= 2 && unit.current.heat < 2}
								class:pending-cooldown={unit.pending.heat <= 1 && unit.current.heat > 1}
							>
								2
							</div>
							<div
								class="heat-level"
								class:heat-level-3={unit.current.heat >= 3}
								class:pending-heat={unit.pending.heat >= 3 && unit.current.heat < 3}
								class:pending-cooldown={unit.pending.heat <= 1 && unit.current.heat > 1}
							>
								3
							</div>
							<div
								class="heat-level heat-level-last"
								class:heat-level-4={unit.current.heat >= 4}
								class:pending-heat={unit.pending.heat >= 4 && unit.current.heat < 4}
								class:pending-cooldown={unit.pending.heat <= 1 && unit.current.heat > 1}
							>
								S
							</div>
						</div>
					</button>
				{/if}
				<button class="unit-card-block unit-health-block" class:aero-health-block={typeIncludes([...aeroTypes], reference)} onclick={handleDamage}>
					<p>A ({armorRemaining.current >= 0 ? armorRemaining.current : 0}/{reference?.armor}):</p>
					<div class="health-pips">
						{#each { length: reference?.armor ?? 0 }, index}
							<div class="pip" class:pending-pip={armorRemaining.pending <= index} class:damaged-pip={armorRemaining.current <= index}></div>
						{/each}
					</div>
					{#if typeIncludes([...aeroTypes], reference)}
						<p class="bold">TH</p>
					{/if}
					<p>
						S ({structRemaining.current}/{reference?.structure}):
					</p>
					<div class="health-pips">
						{#each { length: reference?.structure ?? 0 }, index}
							<div class="pip" class:pending-pip={true && structRemaining.pending <= index} class:damaged-pip={structRemaining.current <= index}></div>
						{/each}
					</div>
					{#if typeIncludes([...aeroTypes], reference)}
						<p class="bold">{reference?.threshold}</p>
					{/if}
				</button>
				<div class="unit-card-block unit-abilities-block">
					{#if reference.abilities != "-"}
						<p>{reference?.abilities}</p>
					{/if}
				</div>
			</div>
			<div class="unit-card-right">
				<div class="unit-image-block" class:unit-crippled={reference.structure && structRemaining.current < reference.structure / 2}>
					<img src={reference?.imageLink} alt="unit" class="unit-image" />
					{#if structRemaining.current <= 0 || critCount.current.engine >= 2 || critCount.current.destroyed}
						<img src="/icons/close.svg" alt="Destroyed" class="destroyed" />
					{/if}
					{#if unit.current.heat >= 4}
						<p class="shutdown-message">Shutdown</p>
					{/if}
				</div>
				{#if !typeIncludes([...infTypes], reference)}
					<button onclick={handleCrit} class="unit-card-block">
						{#if typeIncludes([...mechTypes], reference)}
							<MechCritBox {unit} {critCount}></MechCritBox>
						{:else if typeIncludes([...aeroTypes], reference)}
							<AeroCritBox {unit} {critCount}></AeroCritBox>
						{:else if typeIncludes([...vTypes], reference)}
							<CvCritBox {unit} {critCount}></CvCritBox>
						{:else if reference?.subtype == "PM"}
							<ProtoCritBox {unit} {critCount}></ProtoCritBox>
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
	<ExpandModal {unit} bind:open={openExpandModal} {reference} {options}></ExpandModal>
{:else}
	<p>Loading unit card</p>
{/if}

<style>
	.play-unit-card-container {
		background-color: rgb(255, 255, 255);
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
		font-size: 3.25cqmax;
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
		justify-content: space-between;
	}
	.stat-block-second-row {
		display: grid;
		grid-template-columns: 5fr 4fr;
		gap: 0.5cqw;
	}
	.unit-damage-block {
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		p {
			justify-self: center;
		}
	}
	.damage-header {
		display: flex;
		align-items: center;
	}
	.small-header {
		font-size: 2.5cqmax;
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
		background-color: rgb(255, 255, 1);
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
	@keyframes glowingHot {
		0% {
		}
		50% {
			background-color: darkred;
		}
		100% {
		}
	}
	.pending-heat {
		animation: glowingHot 2000ms infinite;
	}
	@keyframes glowingCool {
		0% {
		}
		50% {
			background-color: skyblue;
		}
		100% {
		}
	}

	.pending-cooldown {
		animation: glowingCool 2000ms infinite;
	}
	.unit-health-block {
		display: grid;
		grid-template-columns: max-content 1fr;
		column-gap: 0.5cqw;
	}
	.unit-crippled {
		border: 1.5cqmax solid white;
		border-image: repeating-linear-gradient(-55deg, #000, #000 20px, #ffb101 20px, #ffb101 40px) 10;
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
	.pending-pip {
		background-color: yellow;
	}
	.damaged-pip {
		background-color: red;
	}
	.damaged-stat {
		color: red;
		font-weight: bold;
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
	.shutdown-message {
		position: absolute;
		color: red;
		font-size: 7cqmax;
		font-weight: bold;
		text-shadow:
			-1px -1px 0 black,
			1px -1px 0 black,
			-1px 1px 0 black,
			1px 1px 0 black;
	}
</style>
