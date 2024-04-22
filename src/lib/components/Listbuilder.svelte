<script lang="ts">
	import PrintModal from "$lib/components/modals/PrintModal.svelte";
	import SaveModal from "$lib/components/modals/SaveModal.svelte";
	import LoadModal from "$lib/components/modals/LoadModal.svelte";
	import { getContext } from "svelte";
	import SublistModal from "./modals/SublistModal.svelte";

	let list: any = getContext("list");
	let { status = $bindable(), recentChanges, description }: { status: any; recentChanges: string[]; description: string[] } = $props();
	let errorDialog: HTMLDialogElement;
	let showPrintModal = $state(false);
	let showSaveModal = $state(false);
	let showLoadModal = $state(false);
	let showSublistModal = $state(false);

	function modifySkill(event: Event, index: number, basePV: number) {
		const target = event.target as HTMLInputElement;
		if (target) {
			let skill = parseInt(target.value);
			list.modifySkill(index, skill, basePV);
		}
	}
</script>

<div class="card listBuilder">
	<div class="list-header gap8">
		<div class="list-info">
			<input id="listName" type="text" placeholder="List name" bind:value={list.details.name} />
			<div class="list-buttons">
				<button
					onclick={() => {
						showLoadModal = true;
					}}>
					<img src="/icons/folder-open-outline.svg" alt="load button" class="button-icon" />
				</button>
				<button
					onclick={() => {
						showSaveModal = true;
					}}>
					<img src="/icons/content-save-outline.svg" alt="save button" class="button-icon" />
				</button>
				<button
					onclick={() => {
						showPrintModal = true;
					}}>
					<img src="/icons/printer.svg" alt="print" class="button-icon" />
				</button>
			</div>
		</div>
		<div class="list-info">
			{#if list.validate}
				<div class="list-stats">
					{#if list.valid.pv[0]}
						<p>PV: {list.valid.pv[1]}/350</p>
					{:else}
						<p style="color: red">PV: {list.valid.pv[1]}/350</p>
					{/if}
					{#if list.valid.unitNumber[0]}
						<p>Units: {list.valid.unitNumber[1]}/16</p>
					{:else}
						<p style="color: red">Units: {list.valid.unitNumber[1]}/16</p>
					{/if}
				</div>
				<div class="errors">
					{#if list.issue}
						<img
							class="error-icon button-icon"
							src="/icons/alert-outline.svg"
							alt="Error"
							on:mouseenter={() => {
								errorDialog.show();
							}}
							on:mouseleave={() => {
								errorDialog.close();
							}} />
						<dialog class="error-dialog" bind:this={errorDialog}>
							<ul>
								{#each list.errorList as error}
									<li>{error}</li>
								{/each}
							</ul>
						</dialog>
					{/if}
				</div>
			{:else}
				<div class="list-stats">
					<p>PV: {list.pv}</p>

					<p>Units: {list.units.length}</p>
				</div>
			{/if}

			{#if list.sublist}
				<button
					on:click={() => {
						if (list.units.length) {
							showSublistModal = true;
						} else {
							alert("Please add units to list before creating sublists");
						}
					}}>Generate Sub-lists</button>
			{/if}
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
						<li>Check the changelog button at the top for a complete list of changes and bug fixes.</li>
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
							{#if list.invalidUnits.includes(unit.name) || list.invalidUnits.includes(unit.class)}
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
							<td class="align-center"> <button on:click={() => list.remove(index)}>-</button></td>
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
<LoadModal bind:showLoadModal bind:status></LoadModal>
<SublistModal bind:showSublistModal></SublistModal>

<style>
	.listBuilder {
		position: sticky;
		width: 100%;
		height: 93dvh;
		top: 43px;
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
	.list-buttons {
		display: flex;
		gap: 8px;
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
		width: 35px;
	}
	.error-icon {
		filter: var(--error-filter);
	}
	.error-dialog {
		color: var(--error);
		position: fixed;
		border: 1px solid var(--error);
	}
</style>
