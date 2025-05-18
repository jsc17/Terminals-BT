import type { FormationV2 } from "../../routes/listbuilder/types/formation";
import type { PlayUnit, UnitV2 } from "./unit";

export type PlayList = {
	formations: FormationV2[];
	units: PlayUnit[];
};

export function loadListForPlay(formations: FormationV2[], units: UnitV2[]) {
	console.log("loading list to play");
	const playUnits: PlayUnit[] = [];
	for (const unit of units) {
		playUnits.push({
			...unit,
			pending: { damage: 0, heat: 0, crits: { engine: 0, fireControl: 0, mp: 0, weapon: 0, destroyed: false } },
			current: { damage: 0, heat: 0, crits: { engine: 0, fireControl: 0, mp: 0, weapon: 0, destroyed: false } }
		});
	}
	const playList: PlayList = {
		formations: formations.filter((formation) => {
			return formation.units.length;
		}),
		units: playUnits
	};
	if (localStorage.getItem("playList")) {
		let overwrite = confirm("Game already in progress, do you wish to overwrite the existing list?");
		if (overwrite) {
			localStorage.setItem("playList", JSON.stringify(playList));
			window.location.href = "/play";
		} else {
			let loadGame = confirm("Do you wish to load the game in progress?");
			if (loadGame) {
				window.location.href = "/play";
			}
		}
	} else {
		localStorage.setItem("playList", JSON.stringify(playList));
		window.location.href = "/play";
	}
}
