<script lang="ts">
	import { type List, type Sublist, type SublistStats, type ListUnit } from "$lib/types/list.svelte";
	import { getRulesByName } from "$lib/types/rulesets";
	import { DropdownMenu, Popover, Separator } from "$lib/generic";
	import { dragHandle } from "svelte-dnd-action";
	import ExportSublistModal from "./ExportSublistModal.svelte";
	import type { MenuItem } from "$lib/generic/types";
	import { List as MenuIcon } from "phosphor-svelte";
	import PlayModal from "../modals/PlayModal.svelte";
	import { toastController } from "$lib/stores";

	type Props = {
		sublist: Sublist;
		list: List;
		scenarioList: string[];
		openSublistEditModal: (id: string, newSublist: boolean) => void;
		unitSortOrder: "name" | "pv";
		layout: string;
		playModal?: PlayModal;
	};

	const { sublist, list, scenarioList, openSublistEditModal, unitSortOrder, layout, playModal }: Props = $props();

	let exportSublistModalOpen = $state(false);

	let sortedUnits: ListUnit[] = $derived.by(() => {
		return sublist.checked
			.map((unitId) => {
				return list.getUnit(unitId);
			})
			.filter((unit) => {
				return unit !== undefined;
			})
			.toSorted((a, b) => {
				if (unitSortOrder == "name") {
					return a.baseUnit.name.localeCompare(b.baseUnit.name);
				} else {
					return b.cost - a.cost;
				}
			});
	});

	let unitString = $derived.by(() => {
		return sortedUnits
			.map((unit) => {
				if (unit) return `${unit.baseUnit.name} (${unit.skill})`;
			})
			.join(", ");
	});

	let stats: SublistStats = $derived.by(() => {
		let pv = 0,
			health = 0,
			short = 0,
			medium = 0,
			long = 0,
			size = 0;
		for (const unitId of sublist.checked) {
			const unit = list.getUnit(unitId);
			pv += unit?.cost ?? 0;
			health += unit?.baseUnit.health ?? 0;
			medium += unit?.baseUnit.damageM ?? 0;
			short += unit?.baseUnit.damageS ?? 0;
			long += unit?.baseUnit.damageL ?? 0;
			size += unit?.baseUnit.size ?? 0;
		}
		return { pv, health, short, medium, long, size };
	});

	let sublistMaxPv = $derived(getRulesByName(list.rules)?.sublistMaxPv);
	let sublistMaxUnits = $derived(getRulesByName(list.rules)?.sublistMaxUnits);

	const dropdownOptions: MenuItem[] = [
		{
			type: "item",
			label: "Edit Sublist",
			onSelect: () => openSublistEditModal(sublist.id, false)
		},
		{
			type: "separator",
			classes: "center"
		},
		{
			type: "item",
			label: "Export / Print Sublist",
			onSelect: () => (exportSublistModalOpen = true)
		},
		{
			type: "item",
			label: "Play Sublist",
			onSelect: () => {
				if (sublist.checked.length) {
					playModal?.open(list, {
						name: `${sublist.scenario != "-" ? `${sublist.scenario} ` : ""}Sublist`,
						type: "none",
						units: sublist.checked
					});
				} else {
					toastController.addToast("Cannot play an empty sublist");
				}
			}
		},
		{
			type: "separator",
			classes: "center"
		},
		{
			type: "item",
			label: "Copy Sublist",
			onSelect: () => list.copySublist(sublist.id)
		},
		{
			type: "item",
			label: "Delete Sublist",
			onSelect: () => list.deleteSublist(sublist.id)
		}
	];
</script>

<div class="sublist-container" class:sublist-container-mobile={layout == "mobile"}>
	{#if layout == "mobile"}
		<div class="mobile-sublist-drag-handle" use:dragHandle>
			<img class="combobox-img" src="/icons/chevron-updown.svg" alt="expand list chevrons" />
		</div>
	{/if}

	<div class="sublist-body">
		<div class="sublist-header">
			<select id={`scenario${sublist.id}`} bind:value={sublist.scenario}>
				{#each scenarioList as scenario}
					<option value={scenario}>{scenario}</option>
				{/each}
			</select>
			{#if layout == "mobile"}
				<div class="mobile-sublist-stats">
					<p><span class="muted">PV:</span> {`${stats.pv ?? 0}`}{sublistMaxPv ? `/${sublistMaxPv}` : ""}</p>
					<p><span class="muted">Units:</span> {`${sublist.checked?.length ?? 0}`}{sublistMaxUnits ? `/${sublistMaxUnits}` : ""}</p>
				</div>
			{/if}
			<div>
				<DropdownMenu items={dropdownOptions}>
					{#snippet trigger()}
						<div class="sublist-menu-button">
							<MenuIcon fill="var(--button-text)" size="16"></MenuIcon>
						</div>
					{/snippet}
				</DropdownMenu>
			</div>
		</div>

		{#if layout == "vertical"}
			<div class="sublist-unit-container">
				<div class="sublist-unit-list">
					{#each sortedUnits as unit}
						<div>{unit.baseUnit.name}</div>
						<div>{unit.skill}</div>
					{/each}
				</div>
			</div>
		{:else}
			<div>{unitString}</div>
		{/if}
		{#if layout == "vertical" || layout == "horizontal"}
			<div class={layout == "vertical" ? "sublist-stats-vertical" : "sublist-stats-horizontal"}>
				<p class="muted">PV:</p>
				<p class:error={sublistMaxPv && stats.pv > sublistMaxPv}>
					{`${stats.pv ?? 0}`}{sublistMaxPv ? `/${sublistMaxPv}` : ``}
				</p>
				<p class="muted">Units:</p>
				<p class:error={sublistMaxUnits && sublist.checked?.length > sublistMaxUnits}>
					{`${sublist.checked?.length ?? 0}`}{sublistMaxUnits ? `/${sublistMaxUnits}` : ``}
				</p>
				<p class="muted">Total Health:</p>
				<p>{stats.health ?? 0}</p>
				<p class="muted">Total Short:</p>
				<p>{stats.short ?? 0}</p>
				<p class="muted">Total Medium:</p>
				<p>{stats.medium ?? 0}</p>
				<p class="muted">Total Long:</p>
				<p>{stats.long ?? 0}</p>
				<p class="muted">Total Size:</p>
				<p>{stats.size ?? 0}</p>
			</div>
		{/if}
	</div>
</div>

<ExportSublistModal {sublist} {list} bind:open={exportSublistModalOpen} />

<style>
	.sublist-container {
		height: 100%;
		width: 100%;
		background-color: var(--surface-color);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: grid;
	}
	.sublist-container-mobile {
		grid-template-columns: max-content 1fr;
	}
	.mobile-sublist-drag-handle {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.sublist-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.sublist-menu-button {
		background-color: var(--primary);
		border-radius: var(--radius);
		padding: 0px 12px;
	}
	.sublist-body {
		display: grid;
		grid-template-rows: max-content 1fr max-content;
		gap: 8px;
		padding: 8px;
	}
	.sublist-unit-list {
		display: grid;
		grid-template-columns: auto max-content;
		gap: 4px;

		div {
			border-bottom: 1px solid var(--border);
			padding: 4px 0px;
		}
	}
	.sublist-stats-vertical {
		display: grid;
		grid-template-columns: max-content 1fr;
		column-gap: 16px;
		row-gap: 4px;
	}
	.sublist-stats-vertical > p:nth-child(odd) {
		text-align: end;
	}
	.sublist-stats-horizontal {
		display: flex;
		gap: 8px;
	}
	.error {
		color: var(--error);
	}
</style>
