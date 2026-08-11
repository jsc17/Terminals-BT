import { json, type RequestEvent } from "@sveltejs/kit";
import { getAllPlayerData, getMatchDetails, getTeamData } from "../../remote/matchData.remote";
import { error } from "console";
import type { MatchUnit } from "$lib/generated/prisma/browser";
import { getMULDataFromId } from "$lib/remote/unit.remote";
import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
import { initializePlayerList } from "../../utilities/handleMatchEvents";
import type { PlayUnitData } from "$routes/play/types/types";
import { calculateCrippled, calculateFirepower, calculateHealth, calculateMovement, countCrits } from "../../utilities/playmodeAutomation";

export async function GET(event: RequestEvent): Promise<Response> {
	if (!event.params.matchId) error(500);

	const matchDetails = await getMatchDetails(event.params.matchId!);
	if (!matchDetails) return json({ error: "match id not found in existing matches" });
	const teamData = await getTeamData(event.params.matchId!);
	const playerData = await getAllPlayerData(event.params.matchId!);

	const teamUnits = new Map<number, { id: number; name: string; type: string; status: string; skill: number; pv: number }[]>();
	const pvRemaining = new Map<number, number>();
	for (const team of teamData) {
		teamUnits.set(team.id, []);
		pvRemaining.set(team.id, 0);
		for (const player of playerData) {
			for (const list of player.lists) {
				if (list.teamId == team.id)
					for (const formation of list.formations)
						for (const unit of formation.units) {
							const unitData: PlayUnitData = {
								id: unit.id,
								mulId: unit.mulId,
								skill: unit.skill,
								pending: {
									damage: unit.pendingDamage,
									heat: unit.pendingHeat,
									crits: unit.criticals
										.filter((c) => c.pending)
										.map((c) => {
											return { id: c.id, round: c.round, type: c.type, roundsRemaining: c.roundsRemaining ?? undefined };
										})
								},
								current: {
									damage: unit.currentDamage,
									heat: unit.currentHeat,
									crits: unit.criticals
										.filter((c) => !c.pending)
										.map((c) => {
											return { id: c.id, round: c.round, type: c.type, roundsRemaining: c.roundsRemaining ?? undefined };
										}),
									disabledAbilities: []
								},
								customization: { spa: unit.spas?.split(","), ammo: unit.ammo?.split(",") }
							};
							const mulData = await getMULDataFromId(unit.mulId)!;
							const moveSpeeds = calculateMovement(unitData, "inches", mulData);
							const health = calculateHealth(unitData, mulData);
							const firepower = calculateFirepower(unitData, mulData);
							const crippled = calculateCrippled(moveSpeeds, firepower, health.armorRemaining, health.structRemaining, mulData!);
							const critCount = countCrits(unitData);
							const unitPv = getNewSkillCost(unit.skill, mulData?.pv ?? 0);
							const destroyed =
								health.structRemaining.pending == 0 ||
								health.structRemaining.current == 0 ||
								critCount.current.destroyed > 0 ||
								critCount.pending.destroyed > 0 ||
								critCount.current.engine + critCount.pending.engine > 2;
							const data = {
								id: unit.id,
								name: mulData?.name ?? `${unit.mulId} not found`,
								type: mulData?.type ?? `${unit.mulId} not found`,
								status: destroyed ? "destroyed" : crippled.current || crippled.pending ? "critical" : "normal",
								skill: unit.skill,
								pv: unitPv
							};
							teamUnits.get(team.id)?.push(data);
							const mov = destroyed ? 0 : crippled.current ? Math.floor(unitPv / 2) : unitPv;
							pvRemaining.set(team.id, pvRemaining.get(team.id)! + mov);
						}
			}
		}
	}
	return json({
		id: matchDetails?.id,
		name: matchDetails?.name,
		status: matchDetails?.gameCompleted ? "ended" : "active",
		round: matchDetails?.currentRound,
		scenario: matchDetails.scenario ?? undefined,
		teams: teamData.map((t) => {
			return {
				id: t.id,
				name: t.name,
				score: t.objectivePoints,
				mov: matchDetails.maxPv ? matchDetails.maxPv - pvRemaining.get(pvRemaining.keys().find((k) => k != t.id)!)! : undefined,
				units: teamUnits.get(t.id)
			};
		})
	});
}
