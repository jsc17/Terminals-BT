import { toastController } from "$lib/stores";
import { safeParseJSON } from "$lib/utilities/utilities";
import { nanoid } from "nanoid";
import { getPlayerData, getMatchUnitData, getMatchDetails, getTeamData, getMyData, getMatchList } from "../remote/matchData.remote";
import type { PlayFormation, PlayList, PlayUnit, PlayUnitData } from "../../types/types";
import type { MulUnit } from "$lib/types/listTypes";
import { SvelteMap } from "svelte/reactivity";
import { getMulImage } from "$lib/remote/mulImages.remote";
import { getMULDataFromId } from "$lib/remote/unit.remote";
import type { MatchCrit, MatchFormation, MatchLog, MatchUnit, UsersInMatch, MatchList } from "$lib/generated/prisma/browser";
import { goto } from "$app/navigation";

export function processMessage(
	message: string,
	playerList: { id: number; team?: number; nickname: string; role: string }[],
	matchUnits: SvelteMap<number, PlayUnit>,
	matchLogs: MatchLog[],
	matchLists: PlayList[]
) {
	const update: MatchLog = JSON.parse(message, (key, value) => (key == "updated_at" ? new Date(value) : value));
	matchLogs.push(update);
	switch (update.type) {
		case "PLAYER_JOINED":
			getPlayerData({ playerId: update.submitterId }).then((r) => {
				if (r) playerList.push({ id: r.id, team: r.teamId ?? undefined, nickname: r.playerNickname, role: r.playerRole });
			});
			break;
		case "PLAYER_ADDED_LIST":
			const listId = Number(update.details);
			getMatchList(listId).then(async (r) => {
				if (r) matchLists.push(await initializePlayerList(r, matchUnits));
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
			playerList = playerList.filter((p) => p.id != Number(update.details));
			getMyData(update.matchId).refresh();
			break;
		case "MATCH_END":
			getMatchDetails(update.matchId).refresh();
			break;
		default:
			console.log("Unhandled Event");
	}
}

export async function initializePlayerList(
	list: MatchList & { player: { id: number; playerNickname: string }; formations: (MatchFormation & { units: (MatchUnit & { criticals: MatchCrit[] })[] })[] },
	matchUnits: SvelteMap<number, PlayUnit>
) {
	const playerFormationList: PlayFormation[] = [];
	const duplicateMap = new SvelteMap<string, number[]>();

	for (const formation of list.formations) {
		await Promise.all(
			formation.units.map(async (u) => {
				const unitData: PlayUnitData = {
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
					},
					customization: { spa: u.spas?.split(","), ammo: u.ammo?.split(",") }
				};
				const reference = await getMULDataFromId(u.mulId);
				const image = await getMulImage(reference?.imageLink ?? "");
				matchUnits.set(u.id, { data: unitData, reference, image: image.image, owner: list.player.playerNickname });

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

		duplicateMap.forEach((value) => {
			value.forEach((id, index) => {
				if (value.length > 1) matchUnits.get(id)!.data.number = index + 1;
			});
		});
	}
	const newPlaylist: PlayList = { id: nanoid(10).replaceAll("-", "*"), name: list.name, owner: list.player.id, team: list.teamId, formations: playerFormationList };
	return newPlaylist;
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
