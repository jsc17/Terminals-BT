import { prisma } from "$lib/server/prisma";
import eraLists from "$lib/data/erasFactionsList.json";
import { fail, redirect } from "@sveltejs/kit";
import { sendResetEmail } from "$lib/emails/mailer.server.js";
import type { PageServerLoad } from "../$types.js";
import fs from "fs/promises";
import { calculateTMM } from "$lib/utilities/bt-utils.js";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.username != "terminal") {
		redirect(302, "/");
	}
};

export const actions = {
	uploadFactions: async () => {
		for (const era of eraLists) {
			if (era.id == 0) {
				continue;
			}
			for (const [general, factionList] of era.factions) {
				if (general != -1) {
					try {
						await prisma.faction.create({
							data: {
								id: `${era.id}-${general}`,
								era: era.id,
								faction: general as number,
								general: -1
							}
						});
					} catch (error) {
						console.log(era.id, general);
					}
				}
				for (const faction of factionList as number[]) {
					try {
						await prisma.faction.create({
							data: {
								id: `${era.id}-${faction}`,
								era: era.id,
								faction: faction,
								general: general as number
							}
						});
					} catch (error) {
						console.log(era.id, faction);
					}
				}
			}
		}
		return { message: "Completed" };
	},
	uploadUnits: async ({ request }) => {
		const unitList = JSON.parse((await request.formData()).get("unitList")!.toString());

		for (const unit of unitList) {
			try {
				await prisma.unit.upsert({
					where: {
						mulId: unit.mulId
					},
					update: {
						mulId: unit.mulId,
						name: unit.name,
						class: unit.class,
						variant: unit.variant,
						tonnage: unit.tonnage,
						technology: unit.technology,
						rules: unit.rules,
						date_introduced: unit.date_introduced,
						image_url: unit.image_url,
						role: unit.role,
						type: unit.type,
						subtype: unit.subtype,
						size: unit.size,
						move: unit.move,
						tmm: unit.tmm,
						armor: unit.armor,
						structure: unit.structure,
						threshold: unit.threshold,
						damage_s: unit.damage_s,
						damage_s_min: unit.damage_s_min,
						damage_m: unit.damage_m,
						damage_m_min: unit.damage_m_min,
						damage_l: unit.damage_l,
						damage_l_min: unit.damage_l_min,
						damage_e: unit.damage_e,
						damage_e_min: unit.damage_e_min,
						overheat: unit.overheat,
						pv: unit.pv,
						abilities: unit.abilities
					},
					create: {
						mulId: unit.mulId,
						name: unit.name,
						class: unit.class,
						variant: unit.variant,
						tonnage: unit.tonnage,
						technology: unit.technology,
						rules: unit.rules,
						date_introduced: unit.date_introduced,
						image_url: unit.image_url,
						role: unit.role,
						type: unit.type,
						subtype: unit.subtype,
						size: unit.size,
						move: unit.move,
						tmm: unit.tmm,
						armor: unit.armor,
						structure: unit.structure,
						threshold: unit.threshold,
						damage_s: unit.damage_s,
						damage_s_min: unit.damage_s_min,
						damage_m: unit.damage_m,
						damage_m_min: unit.damage_m_min,
						damage_l: unit.damage_l,
						damage_l_min: unit.damage_l_min,
						damage_e: unit.damage_e,
						damage_e_min: unit.damage_e_min,
						overheat: unit.overheat,
						pv: unit.pv,
						abilities: unit.abilities
					}
				});
			} catch (error) {
				console.log(unit.name);
				console.log(error);
				return fail(400, { message: error });
			}
		}
		return { message: "Load Complete" };
	},
	testUnit: async ({ request }) => {
		const mulId = (await request.formData()).get("testId");
		console.log(mulId);
		const existing = await prisma.unit.findUnique({
			where: {
				mulId: Number(mulId)
			},
			include: {
				factions: {
					select: {
						id: true
					}
				}
			}
		});
		if (existing) {
			console.log(existing);
			return { exists: true, existing };
		} else {
			console.log("doesn't exist");
			return { exists: false };
		}
	},
	sendResetEmail: async ({}) => {
		sendResetEmail("jonathan.cibge@innernwgaw.com", "ASFVA");
	},
	linkUnits: async ({}) => {
		let count = 0;
		let unitCount = 0;
		let fileList = await fs.readdir("./files/avail-upload");
		for (const filename of fileList) {
			const file = (await fs.readFile(`./files/avail-upload/${filename}`)).toString();
			const [era, faction, ...rest] = filename.split("-");
			const unitList = [];
			count++;
			for (const unit of JSON.parse(file).Units) {
				unitCount++;
				if (unit.Id) {
					unitList.push({
						where: { mulId: unit.Id },
						create: {
							mulId: unit.Id,
							name: unit.Name.trim(),
							class: unit.Class,
							variant: unit.Variant?.trim() == "" ? null : unit.Variant?.trim(),
							tonnage: Number(unit.FormatedTonnage),
							technology: unit.Technology.Name,
							rules: unit.Rules,
							date_introduced: Number(unit.DateIntroduced),
							image_url: unit.ImageUrl,
							role: unit.Role.Name,
							type: unit.Type.Name,
							subtype: unit.BFType?.toUpperCase() ?? "Unknown",
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
							abilities: unit.BFAbilities
						}
					});
				}
			}

			try {
				console.log(count, era, faction);
				await prisma.faction.update({
					where: {
						id: `${era}-${faction}`
					},
					data: {
						units: {
							connectOrCreate: unitList
						}
					}
				});
			} catch (error) {
				console.log("Failed - ", count, era, faction);
				fs.appendFile(`./files/uploadFail.txt`, `${count} failed - ${error} \n`);
			}
		}
		console.log(unitCount);
		return { message: "success" };
	}
};
