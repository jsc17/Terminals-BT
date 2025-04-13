<script lang="ts">
	import type { List } from "../../types/list.svelte";
	import type { SublistStats, SublistV2 } from "../../types/sublist";
	import { getRules } from "$lib/types/options";
	import EditSublistModal from "./EditSublistModal.svelte";
	import ExportSublistModal from "./ExportSublistModal.svelte";
    import MobileSublist from "./MobileSublist.svelte";
    import HorizontalSublist from "./HorizontalSublist.svelte";
    import VerticalSublist from "./VerticalSublist.svelte";

	type componentProps = {
		sublist: SublistV2;
		list: List;
		editSublistModal: EditSublistModal | undefined;
		exportSublistModal: ExportSublistModal | undefined;
		unitSortOrder: "name" | "pv";
        layout: "mobile" | "vertical" | "horizontal"
	};

	const { sublist = $bindable(), list, editSublistModal, exportSublistModal, unitSortOrder, layout }: componentProps = $props();

	let sortedUnits = $derived.by(()=>{
		return sublist.checked.map(unitId=>{return list.getUnit(unitId)});
	})

	let unitString = $derived.by(() => {
		return sublist.checked
			.map((unitId) => {
				return `${list.getUnit(unitId)?.baseUnit.name} (${list.getUnit(unitId)?.skill})`;
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
<p>test</p>
<VerticalSublist {sublist} {list} {editSublistModal} {exportSublistModal} {stats} {sublistMaxPv} {sublistMaxUnits} {unitString}></VerticalSublist>
{:else}
<p>Sublist Layout error</p>
	
{/if}