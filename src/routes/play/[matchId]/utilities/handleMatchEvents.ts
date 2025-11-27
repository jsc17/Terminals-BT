import { toastController } from "$lib/stores";
import { safeParseJSON } from "$lib/utilities/utilities";
import { nanoid } from "nanoid";
import { getPlayerData, getMatchUnitData } from "../remote/matchData.remote";
import type { PlayFormation, PlayList, PlayUnit } from "../../types/types";
import type { MulUnit } from "$lib/types/listTypes";
import { SvelteMap } from "svelte/reactivity";
import { getMulImage } from "$lib/remote/mulImages.remote";
import { getMULDataFromId } from "$lib/remote/unit.remote";
import type { MatchCrit, MatchFormation, MatchUnit, UsersInMatch } from "$lib/generated/prisma/browser";

export async function initializePlayerList(
	playerData: UsersInMatch & { formations: (MatchFormation & { units: (MatchUnit & { criticals: MatchCrit[] })[] })[] },
	matchUnits: SvelteMap<number, { data: PlayUnit; reference?: MulUnit; image?: string }>
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
				matchUnits.set(u.id, { data: unitData, reference, image: image.image });

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
