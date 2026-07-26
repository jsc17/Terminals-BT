import { getMULDataFromId } from "$lib/remote/unit.remote";
import { prisma } from "$lib/server/prisma";
import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";

export async function getSubmitter(matchId: string, playerId: string) {
	const submitter = await prisma.usersInMatch.findUnique({ where: { match_player: { matchId, playerId } } });
	return submitter;
}

export async function getRoundSummaryTeamStatistics(teamId: number) {
	const data = await prisma.matchTeam.findUnique({
		where: { id: teamId },
		include: { lists: { where: { active: true }, include: { formations: { include: { units: { include: { criticals: true } } } }, battlefieldSupport: true } } }
	});

	if (!data) return undefined;

	let unitCount = 0,
		pv = 0;

	for (const list of data.lists ?? []) {
		for (const formation of list.formations) {
			for (const unit of formation.units) {
				const unitData = await getMULDataFromId(unit.mulId);
				if (!unitData) continue;

				if (unit.currentDamage < (unitData.health ?? 0) && !unit.criticals.find((c) => c.type == "destroyed") && unit.criticals.filter((c) => c.type == "engine").length < 2) {
					unitCount++;
					pv += getNewSkillCost(unit.skill, unitData.pv);
				}
			}
		}
	}

	return { teamId, unitCount, pv };
}
