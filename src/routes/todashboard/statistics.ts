import { getMULDataFromId } from "$lib/remote/unit.remote";
import type { MulUnit } from "$lib/types/listTypes";
import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
import { type TournamentStatistics } from "./types";

export async function calculateTournamentStatistics(participants: { name: string; units: string; era: number; faction: number }[]): Promise<TournamentStatistics> {
	let unitData: { player: string; data: MulUnit; skill: number; pv: number }[] = [];
	let listCosts: { player: string; pv: number; unitCount: number }[] = [];
	for (const participant of participants) {
		const unitIds = JSON.parse(participant.units).map((s: string) => JSON.parse(s));
		let listPV = 0;
		for (const unit of unitIds) {
			const data = (await getMULDataFromId(unit.id)).data;
			const cost = getNewSkillCost(unit.sk, data!.pv);
			unitData.push({ player: participant.name, data: data!, skill: unit.sk, pv: cost });
			listPV += cost;
		}
		listCosts.push({ player: participant.name, pv: listPV, unitCount: unitIds.length });
	}

	//group units by pv, then sort the groups
	const highestCostUnit = Object.entries(
		Object.groupBy(
			unitData.map((u) => ({ player: u.player, unit: u.data.name, skill: u.skill, pv: u.pv })),
			(u) => u.pv
		)
	)
		.sort((a, b) => {
			return Number(b[0]) - Number(a[0]);
		})
		.map((g) => g[1]);

	const lowestCostList = Object.entries(Object.groupBy(listCosts, (l) => l.pv))
		.sort((a, b) => {
			return Number(b[0]) - Number(a[0]);
		})
		.map((g) => g[1]);

	let statistics: TournamentStatistics = {
		achievements: {
			highestPVUnit: { first: highestCostUnit[0], second: highestCostUnit[1], third: highestCostUnit[2] },
			lowestPVList: { first: lowestCostList[0], second: lowestCostList[1], third: lowestCostList[2] }
		}
	};
	console.log(statistics);
	return statistics;
}
