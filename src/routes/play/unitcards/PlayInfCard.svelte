<script lang="ts">
	import type { PlayUnit } from "$lib/types/unit";
	import { DamageModal } from "../modals";

	type Props = {
		unit: PlayUnit;
	};

	let { unit }: Props = $props();

	let openDamageModal = $state(false);

	let movementString = $derived(
		unit.baseUnit.move
			?.map((mode) => {
				return `${mode.speed}"${mode.type ?? ""}`;
			})
			.join("/")
	);
	let armorRemaining = $derived((unit.baseUnit.armor ?? 0) - unit.current.damage);
	let structRemaining = $derived.by(() => {
		if (armorRemaining < 0) {
			return (unit.baseUnit.structure ?? 0) + armorRemaining;
		} else {
			return unit.baseUnit.structure ?? 0;
		}
	});

	function handleDamage() {
		openDamageModal = true;
	}
</script>

<div class="play-unit-card">
	<div class="variant-line">
		<p class="unit-variant">{unit.baseUnit.variant}</p>
		<p class="unit-pv bold">PV: {unit.cost}</p>
	</div>
	<div class="name-line">
		<p class="unit-name bold">{unit.baseUnit.class}</p>
		{#if structRemaining < (unit.baseUnit.structure ?? 0) / 2}
			<p class="unit-half-pv">Half: {Math.round(unit.cost / 2)}</p>
		{/if}
	</div>
	<div class="play-unit-card-body">
		<div class="unit-card-left">
			<div class="unit-card-block unit-stat-block">
				<div class="stat-block-first-row">
					<p>TP: <span class="bold"> {unit.baseUnit.subtype}</span></p>
					<p>SZ: <span class="bold">{unit.baseUnit.size}</span></p>
					<p>TMM: <span class="bold">{unit.baseUnit.tmm}</span></p>
					<p>MV: <span class="bold">{movementString}</span></p>
				</div>
				<div class="stat-block-second-row">
					<p>Role: <span class="bold">{unit.baseUnit.role}</span></p>
					<p>Skill: <span class="bold">{unit.skill}</span></p>
				</div>
			</div>
			<div class="unit-card-block unit-damage-block">
				<div>
					<p>S (+0)</p>
					<p class="bold damage">{unit.baseUnit.damageS}{unit.baseUnit.damageSMin ? "*" : ""}</p>
				</div>
				<div>
					<p>M (+2)</p>
					<p class="bold damage">{unit.baseUnit.damageM}{unit.baseUnit.damageMMin ? "*" : ""}</p>
				</div>
				<div>
					<p>L (+4)</p>
					<p class="bold damage">{unit.baseUnit.damageL}{unit.baseUnit.damageLMin ? "*" : ""}</p>
				</div>
			</div>
			<button class="unit-card-block unit-health-block" onclick={handleDamage}>
				<p>A ({armorRemaining >= 0 ? armorRemaining : 0}/{unit.baseUnit.armor}):</p>
				<div class="health-pips">
					{#each { length: unit.baseUnit.armor ?? 0 }, index}
						<div class="pip" class:damaged={armorRemaining <= index}></div>
					{/each}
				</div>

				<p>
					S ({structRemaining}/{unit.baseUnit.structure}):
				</p>
				<div class="health-pips">
					{#each { length: unit.baseUnit.structure ?? 0 }, index}
						<div class="pip" class:damaged={structRemaining <= index}></div>
					{/each}
				</div>
			</button>
			<div class="unit-card-block unit-abilities-block">
				<p>{unit.baseUnit.abilities}</p>
			</div>
		</div>
		<div class="unit-card-right">
			<div class="unit-image-block">
				<img src={unit.baseUnit.imageLink} alt="unit" class="unit-image" />
				{#if structRemaining <= 0 || unit.current.crits.engine >= 2 || unit.current.crits.destroyed}
					<img src="/icons/close.svg" alt="Destroyed" class="destroyed" />
				{/if}
			</div>
		</div>
	</div>
	{#if unit.customization.spa || unit.customization.ammo}
		<div class="unit-card-block unit-custom-block">
			{#if unit.customization.spa && unit.customization.spa.length}
				<p><span class="bold">SPA:</span> {unit.customization.spa.join(", ")}</p>
			{/if}
			{#if unit.customization.ammo && unit.customization.ammo.length}
				<p><span class="bold">Alt. ammo:</span> {unit.customization.ammo.join(", ")}</p>
			{/if}
		</div>
	{:else}
		<div class="bottom-spacer"></div>
	{/if}
</div>

<DamageModal {unit} bind:open={openDamageModal}></DamageModal>

<style>
	.play-unit-card {
		width: 400px;
		height: 286px;
		background-color: white;
		padding: 4px;
		display: flex;
		flex-direction: column;
	}
	button,
	span,
	p,
	div {
		font-size: 14px;
		color: black;
	}

	.variant-line,
	.name-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.play-unit-card-body {
		flex: 1;
		display: grid;
		grid-template-columns: 3fr 2fr;
		gap: 4px;
	}
	.unit-card-left,
	.unit-card-right {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.unit-card-block {
		background-color: rgb(218, 218, 218);
		border: 1px solid black;
		border-radius: var(--radius);
		padding: 1px 4px;
	}
	.stat-block-first-row {
		display: grid;
		grid-template-columns: repeat(3, max-content) 1fr;
		gap: 6px;
	}
	.stat-block-second-row {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 4px;
	}
	.unit-damage-block {
		display: grid;
		grid-template-columns: repeat(3, 1fr);

		p {
			justify-self: center;
		}
	}
	.unit-health-block {
		display: grid;
		grid-template-columns: max-content 1fr;
		column-gap: 2px;
		min-height: 25px;

		p {
			font-size: 0.8em;
			align-self: center;
		}
	}
	.health-pips {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 1px;
	}
	.pip {
		background-color: white;
		border: 1px solid black;
		border-radius: 50%;
		height: 0.65em;
		width: 0.65em;
	}
	.damaged {
		background-color: red;
	}
	.unit-abilities-block {
		flex: 1;
		p {
			font-size: 0.8em;
		}
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
		object-position: 50% 30%;
	}
	.destroyed {
		width: 100%;
		height: 100%;
		filter: invert(11%) sepia(73%) saturate(6763%) hue-rotate(3deg) brightness(123%) contrast(120%);
		position: absolute;
		top: 0;
		left: 0;
	}
	.unit-custom-block {
		margin-top: 4px;
		min-height: 3em;
		p {
			font-size: 0.85em;
		}
	}
	.bottom-spacer {
		min-height: 20px;
	}
	.unit-name {
		font-size: 1.25em;
	}
	.unit-half-pv {
		font-size: 0.75em;
	}
	.bold {
		font-weight: bold;
	}
</style>
