import { toastController } from "$lib/stores";
import { safeParseJSON } from "$lib/utilities/utilities";
import { nanoid } from "nanoid";
import { getPlayerData, getMatchUnitData, getMatchDetails, getTeamData, getMyData } from "../remote/matchData.remote";
import type { PlayFormation, PlayList, PlayUnit } from "../../types/types";
import type { MulUnit } from "$lib/types/listTypes";
import { SvelteMap } from "svelte/reactivity";
import { getMulImage } from "$lib/remote/mulImages.remote";
import { getMULDataFromId } from "$lib/remote/unit.remote";
import type { MatchCrit, MatchFormation, MatchLog, MatchUnit, UsersInMatch } from "$lib/generated/prisma/browser";
import { goto } from "$app/navigation";

export function processMessage(
	message: string,
	playerList: { id: number; team?: number; nickname: string; list?: PlayList }[],
	matchUnits: SvelteMap<number, PlayUnit>,
	matchLogs: MatchLog[]
) {
	const update: MatchLog = JSON.parse(message);
	matchLogs.push(update);
	switch (update.type) {
		case "PLAYER_JOINED":
			getPlayerData({ playerId: update.submitterId }).then(async (r) => {
				if (r) playerList.push({ id: r.id, team: r.teamId ?? undefined, nickname: r.playerNickname, list: await initializePlayerList(r, matchUnits) });
			});
			break;
		case "MATCH_START":
			getMatchDetails(update.matchId).refresh();
			break;
		case "UNIT_DAMAGE":
		case "UNIT_DAMAGE_REMOVED":
		case "UNIT_HEAT":
		case "UNIT_CRIT":
		case "UNIT_CRIT_REMOVED": {
			const unitId = update.unitId!;
			if (!matchUnits.has(unitId)) console.log("Id not found in existing units");
			handleUnitUpdate(unitId, matchUnits);
			break;
		}
		case "ROUND_END":
			getMatchDetails(update.matchId).refresh();
			getTeamData(update.matchId).refresh();
			matchUnits.forEach((u) => {
				handleUnitUpdate(u.data.id, matchUnits);
			});
			break;
		case "MATCH_UPDATE":
			getMatchDetails(update.matchId).refresh();
			getTeamData(update.matchId).refresh();
			break;
		case "MATCH_DELETE":
			toastController.addToast("Host deleted the match. Redirecting you to match selection.");
			goto("/play");
			break;
		case "REMOVE_PLAYER":
			playerList = playerList.filter((p) => p.id != update.affectedUser!);
			getMyData(update.matchId).refresh();
			break;
		default:
			console.log("Unhandled Event");
	}
}

export async function initializePlayerList(
	playerData: UsersInMatch & { formations: (MatchFormation & { units: (MatchUnit & { criticals: MatchCrit[] })[] })[] },
	matchUnits: SvelteMap<number, PlayUnit>
) {
	const playerFormationList: PlayFormation[] = [];
	const duplicateMap = new SvelteMap<string, number[]>();
	for (const formation of playerData.formations) {
		await Promise.all(
			formation.units.map(async (u) => {
				const unitData = {
					id: u.id,
					mulId: u.mulId,
					skill: u.skill,
					pending: {
						damage: u.pendingDamage,
						heat: u.pendingHeat,
						crits: u.criticals
							.filter((c) => c.pending)
							.map((c) => {
								return { id: c.id, round: c.round, type: c.type, roundsRemaining: c.roundsRemaining ?? undefined };
							})
					},
					current: {
						damage: u.currentDamage,
						heat: u.currentHeat,
						crits: u.criticals
							.filter((c) => !c.pending)
							.map((c) => {
								return { id: c.id, round: c.round, type: c.type, roundsRemaining: c.roundsRemaining ?? undefined };
							}),
						disabledAbilities: []
					}
				};
				const reference = await getMULDataFromId(u.mulId);
				const image = await getMulImage(reference?.imageLink ?? "");
				matchUnits.set(u.id, { data: unitData, reference, image: image.image, owner: playerData.playerNickname });

				if (reference) {
					const key = reference.group != "" ? reference.group : reference.class;
					if (!duplicateMap.has(key)) duplicateMap.set(key, []);
					duplicateMap.get(key)?.push(u.id);
				}
			})
		);
		const secondary = formation.secondaryType ? { type: formation.secondaryType, units: formation.units.filter((u) => u.secondary).map((u) => u.id) } : undefined;
		playerFormationList.push({
			id: nanoid(6),
			name: formation.name,
			type: formation.type,
			units: formation.units.filter((u) => !u.secondary).map((u) => u.id),
			secondary
		});
	}
	duplicateMap.forEach((value) => {
		value.forEach((id, index) => {
			if (value.length > 1) matchUnits.get(id)!.data.number = index + 1;
		});
	});

	return { id: nanoid(10), owner: playerData.playerNickname, team: playerData.teamId, formations: playerFormationList } as PlayList;
}

async function handleUnitUpdate(unitId: number, matchUnits: SvelteMap<number, PlayUnit>) {
	if (!matchUnits.has(unitId)) return;
	const unit = matchUnits.get(unitId)!;

	const matchUnitData = await getMatchUnitData(unitId);
	if (matchUnitData)
		matchUnits.set(unitId, {
			...unit,
			data: {
				...unit?.data,
				current: {
					damage: matchUnitData.currentDamage,
					heat: matchUnitData.currentHeat,
					crits: matchUnitData.criticals
						.filter((c) => !c.pending)
						.map((c) => {
							return { id: c.id, round: c.round, type: c.type, roundsRemaining: c.roundsRemaining ?? undefined };
						}),
					disabledAbilities: []
				},
				pending: {
					damage: matchUnitData.pendingDamage,
					heat: matchUnitData.pendingHeat,
					crits: matchUnitData.criticals
						.filter((c) => c.pending)
						.map((c) => {
							return { id: c.id, round: c.round, type: c.type, roundsRemaining: c.roundsRemaining ?? undefined };
						})
				}
			}
		});
}
