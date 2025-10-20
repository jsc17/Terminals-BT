import { getFactionName } from "$lib/remote/era-faction.remote";
import { getMULDataFromId } from "$lib/remote/unit.remote";
import type { MulUnit } from "$lib/types/listTypes";
import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
import { type TournamentStatistics } from "./types";

export async function calculateTournamentStatistics(participants: { name: string; units: string; era: string; faction: string }[]): Promise<TournamentStatistics> {
	let unitData: { player: string; data: MulUnit; skill: number; pv: number }[] = [];
	let listCosts: { player: string; pv: number; unitCount: number }[] = [];
	for (const participant of participants) {
		const unitIds = JSON.parse(participant.units).map((s: string) => JSON.parse(s));
		let listPV = 0;
		for (const unit of unitIds) {
			const data = (await getMULDataFromId(unit.id));
			const cost = getNewSkillCost(unit.sk, data!.pv);
			unitData.push({ player: participant.name, data: data!, skill: unit.sk, pv: cost });
			listPV += cost;
		}
		listCosts.push({ player: participant.name, pv: listPV, unitCount: unitIds.length });
	}

	//group units by pv, then sort the groups
	const highestPVUnit = Object.entries(
		Object.groupBy(
			unitData.map((u) => ({ player: u.player, unit: u.data.name, skill: u.skill, pv: u.pv })),
			(u) => u.pv
		)
	).sort((a, b) => {
		return Number(b[0]) - Number(a[0]);
	});

	//lowest cost list
	const lowestPVList = Object.entries(Object.groupBy(listCosts, (l) => l.pv)).sort((a, b) => {
		return Number(a[0]) - Number(b[0]);
	});

	let unitCounts = new Map<string, number>();
	for (const unit of unitData) {
		unitCounts.set(unit.data.name, (unitCounts.get(unit.data.name) ?? 0) + 1);
	}
	const mostCommonUnit = Object.entries(
		Object.groupBy(
			[...unitCounts].map((c) => ({ unit: c[0], count: c[1] })),
			(u) => u.count
		)
	).sort((a, b) => {
		return Number(b[0]) - Number(a[0]);
	});

	const factionList = Object.entries(Object.groupBy(participants, (p) => p.faction)).map((e) => ({ group: e[0], count: e[1]?.length ?? 0 }));
	const eraList = Object.entries(Object.groupBy(participants, (p) => p.era)).map((e) => ({ group: e[0], count: e[1]?.length ?? 0 }));
	const unitTypes = Object.entries(Object.groupBy(unitData, (u) => u.data.type)).map((e) => ({ group: e[0], count: e[1]?.length ?? 0 }));

	let statistics: TournamentStatistics = {
		achievements: {
			highestPVUnit: highestPVUnit.map((g) => [g[0], g[1] ?? []]),
			lowestPVList: lowestPVList.map((g) => [g[0], g[1] ?? []]),
			mostCommonUnit: mostCommonUnit.map((g) => [g[0], g[1] ?? []])
		},
		breakdowns: {
			eraList: eraList.map((d) => ({ group: d.group, value: d.count, percent: d.count / eraList.length })),
			factionList: factionList.map((d) => ({ group: d.group, value: d.count, percent: d.count / factionList.length })),
			unitTypes: unitTypes.map((d) => ({ group: d.group, value: d.count, percent: d.count / unitTypes.length }))
		}
	};

	return statistics;
}
