import { list } from "../../list.svelte";
import { isUnit, type Unit } from "../../unit";
import { deserialize } from "$app/forms";
import { toastController } from "$lib/stores/toastController.svelte";

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

	async print() {
		let form = new FormData();

		let condense = false;
		if (this.checked.length == 9 || this.checked.length == 10) {
			condense = true;
		}

		let body = JSON.stringify({
			units: this.unitList,
			playername: "",
			listname: `${list.details.name} Sublist`,
			era: list.details.era,
			faction: list.details.faction,
			general: list.details.general,
			style: "detailed",
			condense: condense
		});
		form.append("body", body);
		toastController.addToast("Generating list pdf from the selected sublist");
		let response = deserialize(await (await fetch("?/printList", { method: "POST", body: form })).text());
		//@ts-ignore
		const blob = new Blob([new Uint8Array(Object.values(JSON.parse(response.data.pdf)))], { type: "application/pdf" });
		const downloadElement = document.createElement("a");
		downloadElement.download = list.details.name;
		downloadElement.href = URL.createObjectURL(blob);
		downloadElement.click();
	}
}
