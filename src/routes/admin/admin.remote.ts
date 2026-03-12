import { query, command, form } from "$app/server";
import { prisma } from "$lib/server/prisma";
import { ammoReferences } from "$lib/data";
import { getMulImage } from "$lib/remote/mulImages.remote";
import * as v from "valibot";
import { getMULDataFromId } from "$lib/remote/unit.remote";

export const uploadAmmo = query(async () => {
	for (const group of ammoReferences) {
		for (const ammo of group.ammoTypes) {
			try {
				await prisma.ammo.create({
					data: { name: ammo.name, requiredSpecial: JSON.stringify(ammo.requiredSpecial), group: group.weaponType, page: `AS:CE pg.${ammo.page}` }
				});
				console.log(`${group.weaponType} - ${ammo.name} created`);
			} catch (error) {
				console.log(error);
			}
		}
	}
});

export const cacheImages = command(async () => {
	console.log("caching images");
	const results = await prisma.unit.findMany({
		distinct: ["image_url"],
		select: { image_url: true }
	});
	console.log(`${results.length} links found`);
	for (const { image_url } of results) {
		if (image_url == null) continue;

		await getMulImage(image_url);
	}
	console.log("complete");
});

export const getImage = form(v.object({ mulId: v.string() }), async (data) => {
	const unit = await getMULDataFromId(Number(data.mulId));
	const image = await getMulImage(unit?.imageLink ?? "");
	return image;
});

export const setCollectionTypes = command(async () => {
	const unitsToUpdate = await prisma.collectionModel.findMany({ where: { type: null } });
	console.log(unitsToUpdate.length);
	for (const unit of unitsToUpdate) {
		const matchingGroups = (await prisma.unit.findMany({ where: { OR: [{ class: unit.label }, { group: unit.label }] }, select: { subtype: true }, distinct: ["subtype"] }))
			.filter((v) => v.subtype != null)
			.map((v) => v.subtype);
		let type = "";
		if (matchingGroups.length == 1) {
			type = matchingGroups[0]!;
		} else {
			if (matchingGroups.includes("BM")) type = "BM";
			else if (matchingGroups.includes("CV")) type = "CV";
			else type = matchingGroups[0]!;
		}
		await prisma.collectionModel.update({
			where: { id: unit.id },
			data: { type: type }
		});
	}
});
