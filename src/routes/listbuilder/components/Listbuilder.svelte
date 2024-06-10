<script lang="ts">
	import { PrintModal, SaveModal, LoadModal, SublistModal, UnitCard } from "./index";
	import { getContext, onMount } from "svelte";
	import { ruleSets } from "../options";
	import { resultList } from "../resultList.svelte";
	import { flip } from "svelte/animate";

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
					<p class:errors={list.units.items.length > list.options.maxUnits}>Units: {list.units.items.length}/{list.options.maxUnits}</p>
				{:else}
					<p>Units: {list.units.items.length}</p>
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
		{#if list.units.items.length == 0}
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
			<div
				class="unit-cards"
				role="list"
				on:drop={() => {
					list.units.handleDrop();
				}}
				on:dragover|preventDefault={(e) => {
					list.units.handleDragOver(e);
				}}>
				{#each list.units.items as unit, index (unit.listId)}
					<div animate:flip={{ duration: 300 }}>
						<UnitCard {unit} {index}></UnitCard>
					</div>
				{/each}
			</div>
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
		display: flex;
		flex-direction: column;
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
	.list-units {
		flex: 1;
	}
	.info {
		padding: 16px;
		display: flex;
		justify-content: space-between;
		flex-direction: column;
		height: 100%;
		gap: 48px;
	}
	.unit-cards {
		display: flex;
		flex-direction: column;
		min-height: 100%;
	}
	input[type="text"] {
		width: 250px;
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
