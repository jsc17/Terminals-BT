<svelte:options css="injected" />

<script lang="ts">
	import { aeroTypes, infTypes, mechTypes, typeIncludes, vTypes } from "$lib/playmode/unitcards/utilities/utilities";
	import type { UnitV2 } from "$lib/types";
	import { createSingleAbilityString } from "$lib/utilities/parseAbilities";
	import AeroCritBox from "./critboxes/AeroCritBox.svelte";
	import CvCritBox from "./critboxes/CvCritBox.svelte";
	import MechCritBox from "./critboxes/MechCritBox.svelte";
	import ProtoCritBox from "./critboxes/ProtoCritBox.svelte";

	let { unit, image }: { unit: UnitV2; image: string } = $props();
</script>

<div class="play-unit-card-container">
	<div class="name-container">
		<div class="flex-between">
			<p class="unit-variant">{unit.baseUnit.variant}</p>
			<p class="unit-pv bold">PV: {unit.baseUnit.pv}</p>
		</div>
		<div class="flex-between">
			<p class="unit-name bold">{unit.baseUnit.class}</p>
		</div>
	</div>
	<div class="play-unit-card-body">
		<div class="unit-card-left" class:no-heat={!typeIncludes([...mechTypes, ...aeroTypes], unit.baseUnit)}>
			<div class="unit-card-block unit-stat-block">
				<div class="stat-block-first-row">
					<p>
						TP:
						<span class="bold">{unit.baseUnit?.subtype ?? ""}</span>
					</p>
					<p>SZ: <span class="bold">{unit.baseUnit?.size}</span></p>
					{#if typeIncludes([...aeroTypes], unit.baseUnit)}
						<p>
							THR: <span class="bold">{unit.baseUnit.move![0].speed}{unit.baseUnit.move![0].type}</span>
						</p>
					{:else}
						<p>
							TMM: <span class="bold">{unit.baseUnit.tmm}</span>
						</p>
						<p>
							MV: {#each unit.baseUnit.move ?? [] as { speed, type }, index}
								<span class="bold">{speed}"{type}</span>{#if index + 1 != unit.baseUnit.move?.length}/{/if}
							{/each}
						</p>
					{/if}
				</div>
				<div class="stat-block-second-row">
					<p>Role: <span class="bold">{unit.baseUnit?.role}</span></p>
					<p>
						Skill: <span class="bold">{unit.skill}</span>
					</p>
				</div>
			</div>
			<div class="unit-card-block unit-damage-block">
				<div>
					<p>S (+0)</p>
					<p class="bold damage-value">{unit.baseUnit.damageS}{unit.baseUnit.damageSMin ? "*" : ""}</p>
				</div>
				<div>
					<p>M (+2)</p>
					<p class="bold damage-value">{unit.baseUnit.damageM}{unit.baseUnit.damageMMin ? "*" : ""}</p>
				</div>
				<div>
					<p>L (+4)</p>
					<p class="bold damage-value">{unit.baseUnit.damageL}{unit.baseUnit.damageLMin ? "*" : ""}</p>
				</div>
				{#if typeIncludes([...aeroTypes], unit.baseUnit)}
					<div>
						<p>E (+6)</p>
						<p class="bold damage-value">{unit.baseUnit.damageE}{unit.baseUnit.damageEMin ? "*" : ""}</p>
					</div>
				{/if}
			</div>
			{#if typeIncludes([...mechTypes, ...aeroTypes], unit.baseUnit)}
				<div class="unit-card-block unit-heat-block">
					<p>OV:<span class="bold"> {unit.baseUnit.overheat}</span></p>
					<div class="heatscale">
						<p>Heat Scale:</p>
						<div class="heat-level heat-level-first">1</div>
						<div class="heat-level">2</div>
						<div class="heat-level">3</div>
						<div class="heat-level heat-level-last">S</div>
					</div>
				</div>
			{/if}
			<div class="unit-card-block unit-health-block" class:aero-health-block={typeIncludes([...aeroTypes], unit.baseUnit)}>
				<p class="health-header bold">A({unit.baseUnit?.armor}):</p>
				<div class="health-pips">
					{#each { length: unit.baseUnit?.armor ?? 0 }, index}
						<div class="pip"></div>
					{/each}
				</div>
				{#if typeIncludes([...aeroTypes], unit.baseUnit)}
					<p class="bold threshold">TH</p>
				{/if}
				<p class="health-header bold">
					S({unit.baseUnit?.structure}):
				</p>
				<div class="health-pips">
					{#each { length: unit.baseUnit?.structure ?? 0 }, index}
						<div class="pip"></div>
					{/each}
				</div>
				{#if typeIncludes([...aeroTypes], unit.baseUnit)}
					<p class="bold threshold">{unit.baseUnit?.threshold}</p>
				{/if}
			</div>
			<div class="unit-card-block unit-abilities-block">
				<div class="ability-names">
					{#each unit.baseUnit.abilities ?? [] as ability, index}
						{@const abilityString = createSingleAbilityString($state.snapshot(ability))}
						<div>
							<p class="ability-reference">
								{`${abilityString}${index != unit.baseUnit.abilities.length - 1 ? "," : ""}`}&nbsp;
							</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
		<div class="unit-card-right" class:unit-card-right-inf={typeIncludes(infTypes, unit.baseUnit)}>
			<img src={image} alt="unit" class="unit-image" />
			{#if !typeIncludes(infTypes, unit.baseUnit)}
				<div class="unit-card-block">
					{#if typeIncludes(mechTypes, unit.baseUnit)}
						<MechCritBox></MechCritBox>
					{:else if typeIncludes(aeroTypes, unit.baseUnit)}
						<AeroCritBox></AeroCritBox>
					{:else if typeIncludes(vTypes, unit.baseUnit)}
						<CvCritBox></CvCritBox>
					{:else if unit.baseUnit?.subtype == "PM"}
						<ProtoCritBox></ProtoCritBox>
					{/if}
				</div>
			{/if}
		</div>
	</div>
	<div class="unit-card-block unit-custom-block">
		{#if unit.customization.spa && unit.customization.spa.length}
			<p class="ability-reference"><span class="bold ability-reference">SPA:</span> {unit.customization.spa.join(", ")}</p>
		{/if}
		{#if unit.customization.ammo && unit.customization.ammo.length}
			<p class="ability-reference"><span class="bold ability-reference">Alt. Ammo:</span> {unit.customization.ammo.join(", ")}</p>
		{/if}
	</div>
</div>

<style>
	* {
		padding: 0;
		margin: 0;
		box-sizing: border-box;
	}
	.flex-between {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.bold {
		font-weight: bold;
	}
	.play-unit-card-container {
		padding: 1cqh 1cqw;
		display: grid;
		grid-template-rows: 14.2cqh 63.3cqh 12.5cqh;
		gap: 2cqh;
		max-height: 100%;
		max-width: 100%;
		border: 2cqh solid black;
		background-color: white;
	}
	p,
	span {
		color: black;
		font-size: 4.75cqh;
	}
	.play-unit-card-body {
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: 1cqw;
	}
	.name-container {
		border-radius: 0;
		padding: 0;
		display: grid;
		grid-template-rows: 1fr 1fr;
	}
	.unit-name {
		font-size: 6cqh;
		align-self: center;
	}
	.unit-variant {
		font-size: 5cqh;
		margin-left: 1cqw;
		align-self: center;
	}
	.unit-pv {
		font-size: 5cqh;
	}
	.unit-card-block {
		background-color: rgb(218, 218, 218);
		border: 0.25cqw solid black;
		border-radius: 0.5rem;
		padding: 1cqh 1cqw;
		box-sizing: border-box;
	}
	.unit-card-left {
		display: flex;
		flex-direction: column;
		gap: 1cqh;
	}
	.no-heat {
		gap: 2cqh;
	}
	.unit-card-right {
		display: grid;
		grid-template-rows: 43.3cqh 20cqh;
	}
	.unit-card-right-inf {
		grid-template-rows: 63.3cqh;
	}
	.unit-image {
		max-height: 100%;
		max-width: 100%;
		object-fit: scale-down;
		align-self: center;
		justify-self: center;
	}
	.unit-custom-block {
		display: flex;
		flex-direction: column;
		min-height: 12.5cqh;
		gap: 0.5cqh;
	}
	.unit-stat-block {
		height: 12.5cqh;
		display: grid;
		grid-template-rows: 1fr 1fr;
		align-items: center;
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
		height: 12.5cqh;
		display: flex;
		align-items: center;
		justify-content: space-evenly;
		& p {
			justify-self: center;
		}
	}
	.unit-heat-block {
		height: 8.33cqh;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.unit-health-block {
		min-height: 12.5cqh;
		height: max-content;
		display: grid;
		grid-template-columns: max-content 1fr;
		grid-template-rows: 1fr 1fr;
		align-items: center;
		gap: 0.5cqh 0.5cqw;
	}
	.aero-health-block {
		min-height: 12.5cqh;
		height: max-content;
		grid-template-columns: max-content 1fr max-content;
		& p {
			align-self: center;
		}
	}
	.unit-abilities-block {
		min-height: 12.5cqh;
		flex: 1;
	}
	.heatscale {
		display: flex;
		align-items: center;
	}
	.heat-level {
		background-color: rgb(158, 158, 158);
		border: 0.25cqw solid black;
		width: 5.5cqw;
		display: flex;
		align-items: center;
		justify-content: center;
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
		border-top-left-radius: 0.5rem;
		border-bottom-left-radius: 0.5rem;
	}
	.heat-level-last {
		border-top-right-radius: 0.5rem;
		border-bottom-right-radius: 0.5rem;
	}
	.health-pips {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		row-gap: 0.15cqw;
	}
	.pip {
		background-color: white;
		border: 0.25cqw solid black;
		border-radius: 50%;
		height: 2.25cqmax;
		width: 2.25cqmax;
	}

	.ability-names {
		display: flex;
		flex-wrap: wrap;
	}
	.ability-reference,
	.health-header {
		font-size: 3.5cqh;
	}
	.damage-value {
		text-align: center;
	}
	.threshold {
		font-size: 4cqh;
		align-self: center;
		justify-self: center;
	}
</style>
