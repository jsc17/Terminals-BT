import { prisma } from "$lib/server/prisma";
import eraLists from "$lib/data/erasFactionsList.json";
import { fail, redirect } from "@sveltejs/kit";
import { sendResetEmail } from "$lib/emails/mailer.server.js";
import type { PageServerLoad } from "../$types.js";
import fs from "fs/promises";

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user || locals.user.username != "terminal") {
		redirect(302, "/");
	}
};

export const actions = {
	uploadFactions: async () => {
		for (const era of eraLists) {
			for (const [general, factionList] of era.factions) {
				if (general != -1) {
					await prisma.faction.create({
						data: {
							era: era.id,
							faction: general as number,
							general: -1
						}
					});
				}
				for (const faction of factionList as number[]) {
					await prisma.faction.create({
						data: {
							era: era.id,
							faction: faction,
							general: general as number
						}
					});
				}
			}
			return { message: "Completed" };
		}
	},
	uploadUnits: async ({ request }) => {
		const unitList = JSON.parse((await request.formData()).get("unitList")!.toString());
		let index = 0;

		for (const unit of unitList) {
			index++;
			console.log(index);
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
		const mulId = (await request.formData()).get("mulId");
		const existing = await prisma.unit.findFirst({
			where: {
				mulId: Number(mulId)
			}
		});
		if (existing) {
			return { exists: true };
		} else {
			return { exists: false };
		}
	},
	sendResetEmail: async ({}) => {
		sendResetEmail("jonathan.cibge@innernwgaw.com", "ASFVA");
	},
	linkUnits: async ({}) => {
		try {
			let fileList = await fs.readdir("./files/avail-upload");
			for (const filename of fileList) {
				const file = (await fs.readFile(`./files/avail-upload/${filename}`)).toString();
				const [era, faction, ...rest] = filename.split("-");
				const unitList = [];
				for (const unit of JSON.parse(file).Units) {
					unitList.push(unit.Id);
				}
				console.log(era, faction, unitList);
			}
		} catch (error) {
			return fail(400, { message: error });
		}
		return { message: "success" };
	}
};
