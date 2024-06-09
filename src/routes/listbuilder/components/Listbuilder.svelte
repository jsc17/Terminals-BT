<script lang="ts">
	import { PrintModal, SaveModal, LoadModal, SublistModal } from "./index";
	import { getContext, onMount } from "svelte";
	import { ruleSets } from "../options";
	import { resultList } from "../resultList.svelte";
	import { toastController } from "$lib/stores/toastController.svelte";

	let list: any = getContext("list");
	let {
		status = $bindable(),
		selectedRules = $bindable(),
		recentChanges,
		description
	}: { status: any; recentChanges: string[]; description: string[]; selectedRules: string } = $props();
	let showPrintModal = $state(false);
	let showSaveModal = $state(false);
	let showLoadModal = $state(false);
	let showSublistModal = $state(false);
	let showListMenuDropdown = $state(false);

	function modifySkill(event: Event, index: number, basePV: number) {
		const target = event.target as HTMLInputElement;
		if (target) {
			let skill = parseInt(target.value);
			list.modifySkill(index, skill, basePV);
		}
	}
	onMount(() => {
		selectedRules = list.options?.name;
	});
</script>

<div class="card listBuilder">
	<div class="list-header gap8">
		<div class="list-info">
			<input id="listName" type="text" placeholder="List name" bind:value={list.details.name} />
			<div class="inline">
				<label for="rules">Rules:</label>
				<select
					bind:value={selectedRules}
					on:change={() => {
						list.setOptions(selectedRules);
						resultList.setOptions(list.options.name);
					}}>
					{#each ruleSets as rules}
						<option value={rules.name}>{rules.display}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="list-info">
			<div class="list-stats">
				{#if list.options?.maxPv}
					<p class:errors={list.pv > list.options.maxPv}>PV: {list.pv}/{list.options.maxPv}</p>
				{:else}
					<p>PV: {list.pv}</p>
				{/if}

				{#if list.options?.maxUnits}
					<p class:errors={list.units.length > list.options.maxUnits}>Units: {list.units.length}/{list.options.maxUnits}</p>
				{:else}
					<p>Units: {list.units.length}</p>
				{/if}
			</div>

			<menu
				class="dropdown"
				on:mouseleave={() => {
					showListMenuDropdown = false;
				}}>
				<button
					class="link-button"
					id="nav-links"
					on:click={() => {
						showListMenuDropdown = !showListMenuDropdown;
					}}>
					<img src="/icons/menu.svg" alt="menu" />
				</button>
				<div class="dropdown-content dropdown-right" class:dropdown-hidden={!showListMenuDropdown} class:dropdown-shown={showListMenuDropdown}>
					<button
						class="menu-button"
						on:click={() => {
							showLoadModal = true;
						}}>
						Load List
					</button>
					<button
						class="menu-button"
						on:click={() => {
							showSaveModal = true;
						}}>
						Save/Export List
					</button>
					<button
						class="menu-button"
						on:click={() => {
							showPrintModal = true;
						}}>
						Print List
					</button>
					<button
						class="menu-button"
						on:click={() => {
							showSublistModal = true;
						}}>
						Generate Sublists
					</button>
				</div>
			</menu>
		</div>
	</div>
	<div class="list-units">
		{#if list.units.length == 0}
			<div class="info">
				<div>
					<h1 style:color="var(--primary)">Latest:</h1>
					<ul>
						{#each recentChanges as change}
							<li>{change}</li>
						{/each}
					</ul>
					{#each description as line}
						<p>{line}</p>
						<br />
					{/each}
				</div>
				<p>Mechwarrior, BattleMech, 'Mech and Aerotech are registered trademarks of The Topps Company, Inc. All Rights Reserved.</p>
			</div>
		{:else}
			<table class="unit-list">
				<colgroup>
					<col />
					<col style="width:40%" />
					<col style="width:15%" />
					<col style="width:20%" />
					<col style="width:15%" />
					<col style="width:10%" />
				</colgroup>
				<tbody>
					{#each list.units as unit, index}
						<tr class="unit-row">
							<td>
								{#if index == 0}
									<button class="move-button" on:click={(e) => list.moveUnit(index, index - 1)}><img src="/icons/chevron-up.svg" width="15px" alt="move up" /> </button>
								{:else}
									<button class="move-button" on:click={(e) => list.moveUnit(index, index - 1)}
										><img class="move-arrow" src="/icons/chevron-up.svg" width="15px" alt="move up" />
									</button>
								{/if}
							</td>
							{#if list.invalidUnits?.includes(unit.name) || list.invalidUnits?.includes(unit.class)}
								<td class="invalid-unit">{unit.name}</td>
							{:else}
								<td>{unit.name}</td>
							{/if}

							<td class="align-center">{unit.type}</td>
							<td class="align-center">
								{#if unit.skill == undefined}
									-
								{:else}
									Skill - <input on:change={(e) => modifySkill(e, index, unit.pv)} id={index.toString()} type="number" min="2" max="6" value={unit.skill} />
								{/if}
							</td>
							<td class="align-center">PV - {unit.cost}</td>
							<td class="align-center">
								<button
									on:click={() => {
										list.remove(index);
										toastController.addToast(`${unit.name} removed from list`);
									}}>-</button
								></td>
						</tr>
						<tr class="stat-row">
							<td>
								{#if index == list.units.length - 1}
									<button class="move-button" on:click={(e) => list.moveUnit(index, index + 1)}>
										<img src="/icons/chevron-down.svg" width="15px" alt="move down" />
									</button>
								{:else}
									<button class="move-button" on:click={(e) => list.moveUnit(index, index + 1)}>
										<img class="move-arrow" src="/icons/chevron-down.svg" width="15px" alt="move down" />
									</button>
								{/if}
							</td>
							<td class="abilities border-bottom">{unit.abilities}</td>
							{#if unit.type != "BS"}
								<td class="align-center border-bottom">
									{#each unit.move! as movement, index}
										{#if index != 0}
											{"/ "}
										{/if}
										{`${movement.speed}"${movement.type ?? ""}`}
									{/each}
									- TMM {unit.tmm}</td>
								<td class="align-center border-bottom"
									>{unit.damageS}{unit.damageSMin ? "*" : ""}{"/" + unit.damageM}{unit.damageMMin ? "*" : ""}{"/" + unit.damageL}{unit.damageLMin ? "*" : ""}{" - " +
										unit.overheat}</td>
								<td class="align-center border-bottom">{unit.health + " (" + unit.armor + "+" + unit.structure + ")"}</td>
								<td class="align-center border-bottom">Size - {unit.size}</td>
							{/if}
						</tr>
						<tr class="spacer"></tr>
					{/each}
				</tbody>
			</table>
		{/if}
	</div>
</div>

<PrintModal bind:showPrintModal></PrintModal>
<SaveModal bind:showSaveModal></SaveModal>
<LoadModal bind:showLoadModal bind:status bind:selectedRules></LoadModal>
<SublistModal bind:showSublistModal></SublistModal>

<style>
	.listBuilder {
		position: sticky;
		width: 100%;
		height: 93dvh;
		top: 35px;
		overflow-y: auto;
		z-index: 1;
	}
	.list-header {
		display: flex;
		flex-direction: column;
		border-bottom: 1px solid var(--border);
		padding-bottom: 4px;
	}
	.list-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.list-stats {
		display: flex;
		gap: 16px;
	}
	.info {
		padding: 16px;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		height: 100%;
		gap: 48px;
	}
	table {
		width: 100%;
		border-spacing: 8px;
		border-collapse: collapse;
		gap: 4px;
	}
	.align-center {
		text-align: center;
	}
	.unit-row {
		font-size: 0.95em;
	}
	.stat-row {
		font-size: 0.7em;
	}
	.spacer {
		height: 5px;
	}
	.border-bottom {
		border-bottom: 1px solid var(--border);
	}
	.abilities {
		padding-left: 15px;
	}
	td {
		padding: 3px;
	}
	input[type="text"] {
		width: 250px;
	}
	input[type="number"] {
		width: 40px;
	}
	.move-button {
		background-color: transparent;
	}
	.move-arrow {
		filter: var(--primary-filter);
	}
	.invalid-unit {
		color: var(--error);
	}
	.errors {
		color: var(--error);
	}
	.link-button {
		img {
			height: 20px;
			width: 20px;
			/* filter: var(--primary-filter); */
		}
		background-color: var(--primary);
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--primary);
		font-size: 16px;
	}
	.menu-button {
		background-color: transparent;
		color: var(--primary);
	}
</style>
