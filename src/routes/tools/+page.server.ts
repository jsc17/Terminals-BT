import { prisma } from "$lib/server/prisma";
import eraLists from "$lib/data/erasFactionsList.json";
import fs from "fs/promises";
import { calculateTMM } from "$lib/utilities/bt-utils.js";

export const actions = {
	upload: async () => {
		for (const era of eraLists) {
			for (const factionList of era.factions) {
				for (const faction of factionList[1] as number[]) {
					await prisma.faction.create({
						data: {
							era: era.id,
							faction: Number(faction),
							general: Number(factionList[0])
						}
					});
				}
			}
		}
	},
	uploadUnits: async () => {
		const fileList = await fs.readdir("./files/cached");
		let index = 0;
		for (const file of fileList) {
			index++;
			console.log(index);
			const data = JSON.parse((await fs.readFile(`./files/cached/${file}`)).toString());
			for (const unit of data.Units) {
				try {
					const formattedUnit = {
						mulID: unit.Id,
						name: unit.Name.trim(),
						class: unit.Class,
						variant: unit.Variant?.trim() == "" ? null : unit.Variant?.trim(),
						tonnage: unit.FormatedTonnage,
						technology: unit.Technology.Name,
						rules: unit.Rules,
						date_introduced: Number(unit.DateIntroduced),
						image_url: unit.ImageUrl,
						role: unit.Role.Name,
						type: unit.BFType ?? "Unknown",
						size: unit.BFSize,
						move: unit.BFMove,
						tmm: calculateTMM(Number(unit.BFMove.split('"')[0])),
						armor: unit.BFArmor,
						structure: unit.BFStructure,
						threshold: unit.BFThreshold,
						damage_s: unit.BFDamageShort,
						damage_s_min: unit.BFDamageShortMin,
						damage_m: unit.BFDamageMedium,
						damage_m_min: unit.BFDamageMediumMin,
						damage_l: unit.BFDamageLong,
						damage_l_min: unit.BFDamageLongMin,
						damage_e: unit.BFDamageExtreme,
						damage_e_min: unit.BFDamageExtemeMin,
						overheat: unit.BFOverheat,
						pv: unit.BFPointValue,
						abilites: unit.BFAbilities
					};
					const existing = await prisma.unit.findFirst({
						where: {
							mulID: formattedUnit.mulID
						}
					});
					if (!existing) {
						await prisma.unit.create({
							data: formattedUnit
						});
					}
				} catch (error) {
					console.log(error);
				}
			}
		}
	}
};
