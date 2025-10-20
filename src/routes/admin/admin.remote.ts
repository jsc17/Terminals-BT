import { query } from "$app/server";
import { prisma } from "$lib/server/prisma";
import { ammoReferences } from "$lib/data";

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
