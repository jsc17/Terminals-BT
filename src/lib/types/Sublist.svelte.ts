import { isUnit, type Unit } from "$lib/types/unit";
import { deserialize } from "$app/forms";
import { toastController } from "$lib/stores/toastController.svelte";
import type { UnitList } from "$lib/types/list.svelte";

export class Sublist {
	id: number;
	checked = $state<number[]>([]);
	scenario = $state<string>("-");
	list: UnitList;
	unitList = $derived.by(() => {
		const tempUnitList: Unit[] = [];
		for (const unit of this.list.units) {
			if (this.checked.includes(unit.id!)) {
				tempUnitList.push(unit);
			}
		}
		return tempUnitList;
	});

	stats = $derived.by(() => {
		let pv = 0,
			health = 0,
			short = 0,
			medium = 0,
			long = 0,
			size = 0;
		for (const unit of this.unitList) {
			if (this.checked.includes(unit.id!)) {
				pv += unit.cost ?? 0;
				health += unit.health ?? 0;
				short += unit.damageS ?? 0;
				medium += unit.damageM ?? 0;
				long += unit.damageL ?? 0;
				size += unit.size ?? 0;
			}
		}
		return { pv, health, short, medium, long, size };
	});

	constructor(id: number, list: UnitList, scenario: string = "-", checked: number[] = []) {
		this.id = id;
		this.list = list;
		this.scenario = scenario;
		this.checked = checked;
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
			listname: `${this.list.details.name} Sublist`,
			era: this.list.details.era,
			faction: this.list.details.faction,
			general: this.list.details.general,
			style: "detailed",
			condense: condense
		});
		form.append("body", body);
		toastController.addToast("Generating list pdf from the selected sublist");
		let response = deserialize(await (await fetch("?/printList", { method: "POST", body: form })).text());
		//@ts-ignore
		const blob = new Blob([new Uint8Array(Object.values(JSON.parse(response.data.pdf)))], { type: "application/pdf" });
		const downloadElement = document.createElement("a");
		downloadElement.download = this.list.details.name;
		downloadElement.href = URL.createObjectURL(blob);
		downloadElement.click();
	}
}
