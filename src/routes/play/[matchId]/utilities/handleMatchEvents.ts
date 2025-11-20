import { toastController } from "$lib/stores";
import { safeParseJSON } from "$lib/utilities/utilities";
import { nanoid } from "nanoid";
import { getPlayerData } from "../../remote/matchData.remote";
import type { PlayFormation, PlayList, PlayUnit } from "../../types/types";

export function handlePlayerJoined(matchId: number, data: string, playerLists: PlayList[]) {
	const newPlayerData: { nickname: string; teamId: number; playerId: string } = safeParseJSON(data);
	toastController.addToast(`${newPlayerData.nickname} has joined the match on team ${newPlayerData.teamId}`);
	getPlayerData({ playerId: newPlayerData.playerId, matchId: matchId }).then((result) => {
		if (result && result.teamId) {
			const playerFormationList: PlayFormation[] = [];
			for (const formation of result.formations) {
				const units: PlayUnit[] = formation.units
					.filter((u) => !u.secondary)
					.map((u) => ({
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
					}));
				const secondaryUnits: PlayUnit[] = formation.units
					.filter((u) => u.secondary)
					.map((u) => ({
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
					}));
				playerFormationList.push({ id: nanoid(6), name: formation.name, type: formation.type, units });
			}
			playerLists.push({ id: nanoid(10), owner: result.playerNickname, team: result.teamId, formations: playerFormationList });
		}
	});
}

export function handleSetDamage(data: string, playerLists: PlayList[]) {
	const damageData: { unitId: number; pendingDamage: number; currentDamage: number } = safeParseJSON(data);
	for (const list of playerLists) {
		for (const formation of list.formations) {
			for (const unit of formation.units) {
				if (unit.id == damageData.unitId) {
					unit.current.damage = damageData.currentDamage;
					unit.pending.damage = damageData.pendingDamage;
					break;
				}
			}
		}
	}
}

export function handleSetHeat(data: string, playerLists: PlayList[]) {
	const heatData: { unitId: number; pendingHeat: number; currentHeat: number } = safeParseJSON(data);
	for (const list of playerLists) {
		for (const formation of list.formations) {
			for (const unit of formation.units) {
				if (unit.id == heatData.unitId) {
					unit.current.heat = heatData.currentHeat;
					unit.pending.heat = heatData.pendingHeat;
					break;
				}
			}
		}
	}
}

export function handleTakeCritical(data: string, playerLists: PlayList[], currentRound: number) {
	const criticalData: { unitId: number; id: number; type: string; pending: boolean; roundsRemaining?: number } = safeParseJSON(data);
	for (const list of playerLists) {
		for (const formation of list.formations) {
			for (const unit of formation.units) {
				if (unit.id == criticalData.unitId) {
					if (criticalData.pending) {
						unit.pending.crits.push({
							id: criticalData.id,
							round: currentRound,
							type: criticalData.type,
							roundsRemaining: criticalData.roundsRemaining
						});
					} else {
						unit.current.crits.push({
							id: criticalData.id,
							round: currentRound,
							type: criticalData.type,
							roundsRemaining: criticalData.roundsRemaining
						});
					}
					break;
				}
			}
		}
	}
}

export function handleRemoveCritical(data: string, playerLists: PlayList[]) {
	const removeCritData: { unitId: number; id: number; pending: boolean } = safeParseJSON(data);
	console.log(removeCritData.id);
	for (const list of playerLists) {
		for (const formation of list.formations) {
			for (const unit of formation.units) {
				if (unit.id == removeCritData.unitId) {
					if (removeCritData.pending) {
						unit.pending.crits = unit.pending.crits.filter((c) => c.id != removeCritData.id);
					} else {
						unit.current.crits = unit.current.crits.filter((c) => c.id != removeCritData.id);
					}
					break;
				}
			}
		}
	}
}

export function handleRoundEnd() {}
