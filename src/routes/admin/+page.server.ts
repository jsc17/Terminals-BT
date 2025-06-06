import { prisma } from "$lib/server/prisma";
import eraLists from "$lib/data/erasFactionsList.json";
import { fail, redirect } from "@sveltejs/kit";
import { sendResetEmail } from "$lib/server/emails/mailer.server.js";
import fs from "fs/promises";
import { eraLookup as eraLookup, factionLookup as factionLookup } from "$lib/data/erasFactionLookup.js";
import customCards from "$lib/data/customCards.json";

export const load = async ({ locals }) => {
	if (!locals.user || locals.user.username.toLowerCase() != "terminal") {
		redirect(303, "/");
	}
};

export const actions = {
	uploadFactions: async () => {
		for (const era of eraLists) {
			if (era.id == 0) {
				continue;
			}
			for (const { general, factions } of era.lists) {
				for (const faction of factions) {
					try {
						console.log(faction, era.id);
						await prisma.faction.upsert({
							where: {
								id: faction
							},
							create: {
								id: faction,
								name: factionLookup.get(faction)!,
								eras: {
									create: {
										general,
										era: {
											connectOrCreate: {
												where: {
													id: era.id
												},
												create: {
													id: era.id,
													name: eraLookup.get(era.id)!
												}
											}
										}
									}
								}
							},
							update: {
								eras: {
									create: {
										general,
										era: {
											connectOrCreate: {
												where: {
													id: era.id
												},
												create: {
													id: era.id,
													name: eraLookup.get(era.id)!
												}
											}
										}
									}
								}
							}
						});
					} catch (err) {
						console.error(err);
					}
				}
			}
		}
		return { message: "Completed" };
	},
	uploadCustom: async () => {
		try {
			for (const pack of customCards.unitPacks) {
				for (const unit of pack.units) {
					await prisma.customCard.create({
						data: {
							pack: pack.name,
							mulId: unit.id,
							name: unit.name,
							class: unit.class,
							variant: unit.variant,
							type: unit.type,
							pv: unit.pv,
							abilities: unit.abilities
						}
					});
				}
			}
			console.log("Custom cards loaded");
		} catch (error) {
			console.log(error);
		}
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
	sendResetEmail: async ({}) => {
		sendResetEmail("jonathan.cibge@innernwgaw.com", "ASFVA");
	},
	linkUnits: async ({}) => {
		let count = 0;
		let fileList = await fs.readdir("./files/avail-upload");
		for (const filename of fileList) {
			const file = (await fs.readFile(`./files/avail-upload/${filename}`)).toString();
			const [era, faction, ...rest] = filename.split("-");
			count++;
			for (const unit of JSON.parse(file).Units) {
				try {
					await prisma.unit.update({
						where: {
							mulId: unit.Id
						},
						data: {
							availability: {
								create: {
									factionAndEra: {
										connect: {
											eraId_factionId: {
												eraId: Number(era),
												factionId: Number(faction)
											}
										}
									}
								}
							}
						}
					});
				} catch (error) {
					console.log(unit.Name, "failed to load", unit.Id);
				}
			}

			try {
				console.log(count, era, faction);
			} catch (error) {
				console.log("Failed - ", count, era, faction);
				fs.appendFile(`./files/uploadFail.txt`, `${count} failed - ${error} \n`);
			}
		}
		return { message: "success" };
	},
	convertLists: async ({}) => {
		const lists = await prisma.listV2.findMany();
		for (const list of lists) {
			try {
				console.log(`Processing list: ${list.name}`);

				const data = {
					id: crypto.randomUUID(),
					userId: list.userId,
					name: list.name,
					eras: JSON.stringify(list.era == 0 ? [] : [list.era]),
					factions: JSON.stringify(list.faction == 0 ? [] : [list.faction]),
					units: list.units,
					formations: list.formations,
					sublists: list.sublists,
					rules: list.rules,
					lcVersion: 2
				};
				await prisma.listV3.create({ data });
			} catch (error) {
				console.log(`${list.name} error`);
				console.error(error);
			}
		}
	},
	sendNotification: async (event) => {
		let formData = await event.request.formData();
		let message = formData.get("notification-message")?.toString();
		let summary = formData.get("notification-summary")?.toString();
		let type = formData.get("notification-type")?.toString();

		if (message && summary && type) {
			let allUsers = await prisma.user.findMany({ select: { id: true } });

			for (const user of allUsers) {
				await prisma.notification.create({
					data: {
						userId: user.id,
						read: false,
						message,
						summary,
						type
					}
				});
			}
		} else {
			return fail(400);
		}
		return {};
	}
};
