<script lang="ts">
	import { toastController } from "$lib/stores/toastController.svelte";
	import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
	import type { List } from "$lib/types/list.svelte";
	import { dragHandle } from "svelte-dnd-action";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { DropdownMenu, Popover } from "$lib/components/global/";
	import { UnitCustomizationModal } from "../index";
	import { createAbilityLineString } from "$lib/utilities/abilityUtilities";
	import { getSPAfromId } from "$lib/utilities/listUtilities";
	import type { MenuItem } from "$lib/types/global";

	type Props = {
		unit: { id: string; bonus?: { ind: number; abil: number }[] };
		unitCustomizationModal?: UnitCustomizationModal;
		list: List;
	};

	const { unit, unitCustomizationModal, list }: Props = $props();

	let unitDetails = list.getUnit(unit.id);

	let unitSpas = $derived.by(() => {
		let spas: string[] = [];
		if (unitDetails) {
			spas = spas.concat(unitDetails.customization?.spa ?? []);
			const spasFromFormation = unit.bonus?.map(({ abil }) => `${getSPAfromId(abil)?.name} (Frmn)`) ?? [];
			spas = spas.concat(spasFromFormation);
		}
		return spas.join(", ");
	});

	const unitMenuItems = $derived.by(() => {
		const items: MenuItem[] = [
			{
				type: "item",
				label: "Add Ammo/SPA",
				onSelect: () => {
					unitCustomizationModal?.show(unit.id);
				}
			},
			{
				type: "item",
				label: "Remove Unit",
				onSelect: () => {
					list.removeUnit(unit.id);
					toastController.addToast(`${unitDetails?.baseUnit.name} removed from list`);
				}
			}
		];
		return items;
	});
</script>

<div class="unit-card">
	{#if appWindow.isMobile}
		<div class="drag-handles" use:dragHandle>
			<img class="combobox-img" src="/icons/chevron-updown.svg" alt="expand list chevrons" />
		</div>
	{/if}
	<div class="unit-row-container">
		<div class="unit-name-row">
			<p class="name-row-name" class:invalid-unit={list.issues.issueUnits.has(unitDetails?.id ?? "0")}>{unitDetails?.baseUnit.name}</p>
			<p class="name-row-pv"><span class="muted">PV:</span> {unitDetails?.cost}</p>
			<DropdownMenu items={unitMenuItems}>
				{#snippet trigger()}
					<div class="unit-menu-trigger"><img src="/icons/menu.svg" alt="unit menu" /></div>
				{/snippet}
			</DropdownMenu>
		</div>
		<div class="unit-header-row">
			<div class="unit-header">Type</div>
			{#if unitDetails?.baseUnit.type != "BS"}
				<div class="unit-header">Skill</div>
				<div class="unit-header">Speed</div>
				<div class="unit-header">Damage</div>
				<div class="unit-header">Health</div>
				<div class="unit-header">Size</div>
				<div class="unit-header">Role</div>
			{/if}
		</div>
		<div class="unit-stat-row">
			<div class="unit-stat">{unitDetails?.baseUnit.subtype}</div>
			{#if unitDetails?.baseUnit.type != "BS"}
				<div class="unit-stat">
					{#if unitDetails?.skill != undefined}
						<select
							bind:value={unitDetails.skill}
							onchange={() => {
								unitDetails.cost = getNewSkillCost(unitDetails.skill, unitDetails.baseUnit.pv);
							}}
						>
							{#each [...Array(8).keys()] as skill}
								<option value={skill}>{skill}</option>
							{/each}
						</select>
					{:else}
						-
					{/if}
				</div>
				<div class="unit-stat">
					{#each unitDetails?.baseUnit.move! as movement, index}
						{#if index != 0}
							{"/ "}
						{/if}
						{`${movement.speed}"${movement.type ?? ""}`}
					{/each}
					- TMM {unitDetails?.baseUnit.tmm}
				</div>
				<div class="unit-stat">
					{unitDetails?.baseUnit.damageS}{unitDetails?.baseUnit.damageSMin ? "*" : ""}{"/" + unitDetails?.baseUnit.damageM}{unitDetails?.baseUnit.damageMMin ? "*" : ""}{"/" +
						unitDetails?.baseUnit.damageL}{unitDetails?.baseUnit.damageLMin ? "*" : ""}{" - " + unitDetails?.baseUnit.overheat}
				</div>
				<div class="unit-stat">{unitDetails?.baseUnit.health + " (" + unitDetails?.baseUnit.armor + "+" + unitDetails?.baseUnit.structure + ")"}</div>
				<div class="unit-stat">{unitDetails?.baseUnit.size}</div>
				<div class="unit-stat">{unitDetails?.baseUnit.role}</div>
			{/if}
		</div>
		<div class="unit-ability-row">
			<div class="unit-abilities">
				{#if unitDetails}
					{createAbilityLineString(unitDetails?.baseUnit.abilities)}
				{/if}
			</div>
		</div>
		{#if unitDetails?.customization?.ammo || unitSpas.length}
			<div class="unit-custom-row">
				{#if unitDetails?.customization?.ammo?.length}
					<p class="unit-abilities"><span class="muted-foreground">Alt. Ammo:</span> {unitDetails.customization.ammo?.join(", ")}</p>
				{/if}
				{#if unitSpas.length}
					<p class="unit-abilities">
						<span class="muted-foreground">SPA:</span>
						{unitSpas}
					</p>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.unit-card {
		width: 100%;
		border-bottom: 1px solid var(--border);
		flex: 1;
		min-height: fit-content;
		background-color: var(--card);
		display: flex;
		flex-shrink: 0;
		padding: 0px 4px;
	}
	.unit-card:hover {
		box-shadow: 3px 0px 3px var(--primary) inset;
		cursor: row-resize;
	}
	.drag-handles {
		display: flex;
		align-items: center;
		justify-items: center;
	}
	.unit-row-container {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.unit-name-row {
		display: grid;
		grid-template-columns: 1fr max-content max-content;
		gap: 8px;
		margin: 2px 0px;
	}
	.unit-name-row p {
		align-self: center;
	}
	.unit-header-row,
	.unit-stat-row {
		display: grid;
		grid-template-columns: 10% 10% 22% 20% 15% 8% 15%;
	}
	.unit-header {
		font-size: 0.75em;
		color: var(--muted-foreground);
		align-self: center;
		justify-self: safe center;
	}
	.unit-stat {
		font-size: 0.75em;
		align-self: center;
		justify-self: safe center;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.unit-ability-row {
		margin: 2px 0px;
		justify-content: space-between;
		display: flex;
	}
	.unit-custom-row {
		margin: 2px 0px;
		display: flex;
		column-gap: 16px;
		flex-wrap: wrap;
	}
	.invalid-unit {
		color: var(--error);
	}
	.name-row-name {
		font-size: 0.95em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: 0s white-space;
		transition-behavior: allow-discrete;
	}
	.name-row-name:hover {
		white-space: wrap;
		transition-delay: 0.25s;
	}
	.name-row-pv {
		font-size: 0.9em;
	}
	.unit-abilities {
		font-size: 0.75em;
	}
	.unit-menu-trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
		background-color: var(--primary);
		padding: 0px 16px;
		border-radius: var(--radius);

		& img {
			width: 15px;
			height: 15px;
		}
	}
	.unit-menu-content {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
	}
	.muted-foreground {
		color: var(--muted-foreground);
	}
</style>
