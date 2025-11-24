import { toastController } from "$lib/stores";
import { safeParseJSON } from "$lib/utilities/utilities";
import { nanoid } from "nanoid";
import { getPlayerData, getMatchUnitData } from "../remote/matchData.remote";
import type { PlayFormation, PlayList, PlayUnit } from "../../types/types";
import type { MulUnit } from "$lib/types/listTypes";
import type { SvelteMap } from "svelte/reactivity";
import { getMulImage } from "$lib/remote/mulImages.remote";
import { getMULDataFromId } from "$lib/remote/unit.remote";
import type { MatchCrit, MatchFormation, MatchUnit, UsersInMatch } from "$lib/generated/prisma/browser";

export function initializePlayerLists(
	playerData: (UsersInMatch & { formations: (MatchFormation & { units: (MatchUnit & { criticals: MatchCrit[] })[] })[] })[],
	matchUnits: SvelteMap<number, { data: PlayUnit; reference?: MulUnit; image?: string }>
) {
	return playerData
		?.filter((p) => p.teamId != null && p.formations.length != 0)
		.sort((a, b) => {
			return a.teamId! - b.teamId!;
		})
		.map((p) => {
			const playerFormationList: PlayFormation[] = [];
			for (const formation of p.formations) {
				formation.units.forEach(async (u) => {
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
					matchUnits.set(u.id, { data: unitData, reference, image: image.image });
				});
				playerFormationList.push({ id: nanoid(6), name: formation.name, type: formation.type, units: formation.units.map((u) => u.id) });
			}
			return { id: nanoid(10), owner: p.playerNickname, team: p.teamId, formations: playerFormationList } as PlayList;
		});
}

export function handlePlayerJoined(matchId: number, data: string, playerLists: PlayList[], matchUnits: SvelteMap<number, { data: PlayUnit; reference?: MulUnit; image?: string }>) {
	const newPlayerData: { nickname: string; teamId: number; playerId: string } = safeParseJSON(data);
	toastController.addToast(`${newPlayerData.nickname} has joined the match on team ${newPlayerData.teamId}`);
	getPlayerData({ playerId: newPlayerData.playerId, matchId: matchId }).then((result) => {
		if (result && result.teamId) {
			const playerFormationList: PlayFormation[] = [];
			for (const formation of result.formations) {
				formation.units.forEach(async (u) => {
					const unitData = {
						id: u.id,
						mulId: u.mulId,
						skill: u.skill,
						pending: { damage: 0, heat: 0, crits: [] },
						current: { damage: 0, heat: 0, crits: [], disabledAbilities: [] }
					};
					const reference = await getMULDataFromId(u.mulId);
					const image = await getMulImage(reference?.imageLink ?? "");
					matchUnits.set(u.id, { data: unitData, reference, image: image.image });
				});
				playerFormationList.push({ id: nanoid(6), name: formation.name, type: formation.type, units: formation.units.map((u) => u.id) });
			}
			playerLists.push({ id: nanoid(10), owner: result.playerNickname, team: result.teamId, formations: playerFormationList });
		}
	});
}

export async function handleUnitUpdate(unitId: number, matchUnits: SvelteMap<number, { data: PlayUnit; reference?: MulUnit; image?: string }>) {
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
