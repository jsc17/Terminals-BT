import { query, command } from "$app/server";
import { prisma } from "$lib/server/prisma";
import { ammoReferences } from "$lib/data";
import { getMulImage } from "../listbuilder/printing/mulImages.remote";

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
});
