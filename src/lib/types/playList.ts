import type { FormationV2, PlayFormation } from "./formation";
import type { PlayUnit, UnitCustomization, UnitV2 } from "./unit";

export type PlayList = {
	formations: PlayFormation[];
	units: PlayUnit[];
};

export function sendListToPlay(formations: FormationV2[], units: UnitV2[]) {
	const playUnits: PlayUnit[] = [];
	for (const unit of units) {
		if (
			formations.find((formation) => {
				return formation.units.find(({ id }) => id == unit.id) || formation.secondary?.units.find(({ id }) => id == unit.id);
			})
		) {
			playUnits.push({
				id: unit.id,
				mulId: unit.baseUnit.mulId.toString(),
				skill: unit.skill,
				cost: unit.cost,
				customization: unit.customization,
				current: { damage: 0, heat: 0, crits: [] },
				pending: { damage: 0, heat: 0, crits: [] }
			});
		}
	}
	const playFormations: PlayFormation[] = formations
		.filter((formation) => {
			return formation.units.length;
		})
		.map((formation) => {
			return {
				id: formation.id,
				name: formation.name,
				type: formation.type,
				units: formation.units.map(({ id }) => {
					return id;
				}),
				secondary: {
					type: formation.secondary?.type,
					units: formation.secondary?.units.map(({ id }) => {
						return id;
					})
				}
			};
		});
	const playList: PlayList = {
		formations: playFormations,
		units: playUnits
	};

	if (localStorage.getItem("playList")) {
		let overwrite = confirm("Game already in progress, do you wish to overwrite the existing list?");
		if (overwrite) {
			localStorage.setItem("playList", JSON.stringify(playList));
			localStorage.removeItem("playCurrentRound");
			window.open("/play", "_blank")?.focus();
		} else {
			let loadGame = confirm("Do you wish to load the game in progress?");
			if (loadGame) {
				window.open("/play", "_blank")?.focus();
			}
		}
	} else {
		localStorage.setItem("playList", JSON.stringify(playList));
		window.open("/play", "_blank")?.focus();
	}
}
