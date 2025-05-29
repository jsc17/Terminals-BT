<script lang="ts">
	import type { List } from "../../../../lib/types/list.svelte";
	import type { SublistStats, SublistV2 } from "../../types/sublist";
	import { getRules } from "$lib/types/options";
	import EditSublistModal from "./EditSublistModal.svelte";
	import ExportSublistModal from "./ExportSublistModal.svelte";
	import MobileSublist from "./MobileSublist.svelte";
	import HorizontalSublist from "./HorizontalSublist.svelte";
	import VerticalSublist from "./VerticalSublist.svelte";
	import type { UnitV2 } from "$lib/types/unit";

	type componentProps = {
		sublist: SublistV2;
		list: List;
		editSublistModal: EditSublistModal | undefined;
		exportSublistModal: ExportSublistModal | undefined;
		unitSortOrder: "name" | "pv";
		layout: "mobile" | "vertical" | "horizontal";
	};

	const { sublist = $bindable(), list, editSublistModal, exportSublistModal, unitSortOrder, layout }: componentProps = $props();

	let sortedUnits: UnitV2[] = $derived.by(() => {
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

	let sublistMaxPv = $derived(getRules(list.rules)?.sublistMaxPv);
	let sublistMaxUnits = $derived(getRules(list.rules)?.sublistMaxUnits);
</script>

{#if layout == "mobile"}
	<MobileSublist {sublist} {list} {editSublistModal} {exportSublistModal} {stats} {sublistMaxPv} {sublistMaxUnits} {unitString}></MobileSublist>
{:else if layout == "horizontal"}
	<HorizontalSublist {sublist} {list} {editSublistModal} {exportSublistModal} {stats} {sublistMaxPv} {sublistMaxUnits} {unitString}></HorizontalSublist>
{:else if layout == "vertical"}
	<VerticalSublist {sublist} {list} {editSublistModal} {exportSublistModal} {stats} {sublistMaxPv} {sublistMaxUnits} {sortedUnits}></VerticalSublist>
{:else}
	<p>Sublist Layout error</p>
{/if}
