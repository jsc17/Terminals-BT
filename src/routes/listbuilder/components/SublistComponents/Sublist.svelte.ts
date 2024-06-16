import { list } from "../../list.svelte";
import { isUnit, type Unit } from "../../unit";

export class Sublist {
	id: number;
	checked = $state<number[]>([]);
	scenario = $state<string>("-");
	unitList = $derived.by(() => {
		const tempUnitList: Unit[] = [];
		for (const item of list.items) {
			if (isUnit(item)) {
				if (this.checked.includes(item.id!)) {
					tempUnitList.push(item);
				}
			} else {
				for (const unit of item.units) {
					if (this.checked.includes(unit.id!)) {
						tempUnitList.push(unit);
					}
				}
			}
		}
		return tempUnitList;
	});

	stats = $derived.by(() => {
		let pv = 0,
			health = 0,
			short = 0,
			medium = 0,
			long = 0;
		let tempTotalSize = 0;
		for (const unit of this.unitList) {
			if (this.checked.includes(unit.id!)) {
				pv += unit.cost;
				health += unit.health ?? 0;
				short += unit.damageS ?? 0;
				medium += unit.damageM ?? 0;
				long += unit.damageL ?? 0;
				tempTotalSize += unit.size ?? 0;
			}
		}
		let size = (tempTotalSize / this.checked.length).toFixed(1);
		return { pv, health, short, medium, long, size };
	});

	constructor(id: number) {
		this.id = id;
	}
}
