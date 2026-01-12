import type { ListFormation, ListUnit } from "$lib/types/listTypes";
import { getFormationDataFromName } from "$lib/utilities/formationUtilities";
import { nanoid } from "nanoid";
import type { PlayFormation, PlayList, PlayUnit } from "../../types/types";

export async function sendListToPlay(name: string, formations: ListFormation[], units: ListUnit[]) {
	// const playUnits: PlayUnit[] = [];
	// const totalCounts = Map.groupBy(units, ({ baseUnit }) => baseUnit.mulId);
	// const count = new Map<number, ListUnit[]>();
	// for (const unit of units) {
	// 	if (
	// 		formations.find((formation) => {
	// 			return formation.units.find(({ id }) => id == unit.id) || formation.secondary?.units.find(({ id }) => id == unit.id);
	// 		})
	// 	) {
	// 		const mulId = unit.baseUnit.mulId;
	// 		let number: number = 0;
	// 		if ((totalCounts.get(mulId)?.length ?? 0) > 1) {
	// 			if (!count.has(mulId)) count.set(mulId, []);
	// 			number = count.get(mulId)!.push(unit);
	// 		}
	// 		playUnits.push({
	// 			id: unit.id,
	// 			mulId: mulId.toString(),
	// 			skill: unit.skill,
	// 			cost: unit.cost,
	// 			customization: unit.customization,
	// 			number: number != 0 ? number : undefined,
	// 			current: { damage: 0, heat: 0, crits: [], disabledAbilities: [] },
	// 			pending: { damage: 0, heat: 0, crits: [] }
	// 		});
	// 	}
	// }
	// const playFormations: PlayFormation[] = formations
	// 	.filter((formation) => {
	// 		return formation.units.length;
	// 	})
	// 	.map((formation) => {
	// 		const formationDetails = getFormationDataFromName(formation.type);
	// 		return {
	// 			id: formation.id,
	// 			name: formation.name,
	// 			type: formation.type,
	// 			units: formation.units.map(({ id }) => {
	// 				return id;
	// 			}),
	// 			secondary: {
	// 				type: formation.secondary?.type,
	// 				units: formation.secondary?.units.map(({ id }) => {
	// 					return id;
	// 				})
	// 			},
	// 			bonuses: formationDetails?.bonuses
	// 		};
	// 	});
	// const newMatchId = nanoid().toLowerCase();
	// const playList: PlayList = {
	// 	id: newMatchId,
	// 	name,
	// 	formations: playFormations,
	// 	units: playUnits,
	// 	date: new Date().toDateString()
	// };
	// window.open(`/play/${newMatchId}`)?.focus();
}
