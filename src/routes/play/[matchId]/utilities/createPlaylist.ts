// import { nanoid } from "nanoid";
// import type { PlayFormation, PlayUnit, PlayList } from "../../types/types";
// import { type MatchFormation, type MatchUnit } from "@prisma/client";

// type PlayListData = {
//     formations: {units: MatchUnit[]}
// } & MatchFormation
// export function generatePlayList(){
//     					const playerFormationList: PlayFormation[] = [];
// 					for (const formation of p.formations) {
// 						const units: PlayUnit[] = formation.units
// 							.filter((u) => !u.secondary)
// 							.map((u) => ({
// 								id: u.id,
// 								mulId: u.mulId,
// 								skill: u.skill,
// 								pending: { damage: u.pendingDamage, heat: u.pendingHeat, crits: [] },
// 								current: { damage: u.currentDamage, heat: u.currentHeat, crits: [], disabledAbilities: [] }
// 							}));
// 						const secondaryUnits: PlayUnit[] = formation.units
// 							.filter((u) => u.secondary)
// 							.map((u) => ({
// 								id: u.id,
// 								mulId: u.mulId,
// 								skill: u.skill,
// 								pending: { damage: u.pendingDamage, heat: u.pendingHeat, crits: [] },
// 								current: { damage: u.currentDamage, heat: u.currentHeat, crits: [], disabledAbilities: [] }
// 							}));
// 						playerFormationList.push({ id: nanoid(6), name: formation.name, type: formation.type, units });
// 					}
// 					return { id: nanoid(10), owner: p.playerNickname, team: p.teamId, formations: playerFormationList } as PlayList;
// 				});
// }
