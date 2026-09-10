import { command } from "$app/server";
import { abilityReferences, numberedAbilityReference, weaponAbilityReference, ammoAbility } from "$lib/data/abilities";
import { prisma } from "$lib/server/prisma";
import { handleParse } from "$lib/utilities/abilityUtilities";
import spaReferences from "$lib/spa/spas.json";

export const uploadAbilities = command(async () => {
	await prisma.unitAbility.deleteMany();
	await prisma.abilityData.deleteMany();
	for (const ability of abilityReferences) {
		await prisma.abilityData.create({
			data: {
				abbreviation: ability.abbr,
				name: ability.name,
				page: ability.page,
				numbered: numberedAbilityReference.includes(ability.abbr),
				weapon: weaponAbilityReference.includes(ability.abbr),
				ammo: ammoAbility.includes(ability.abbr)
			}
		});
	}
	const abilityCount = await prisma.abilityData.count();
	console.log(abilityCount + " abilities uploaded");
});

export const uploadSPAs = command(async () => {
	await prisma.specialPilotAbility.deleteMany({});
	for (const spa of spaReferences) {
		await prisma.specialPilotAbility.create({
			data: {
				name: spa.name,
				cost: spa.cost,
				page: spa.page
			}
		});
	}
	const spaCount = await prisma.specialPilotAbility.count();
	console.log(spaCount + " SPAs uploaded");
});

export const linkUnitAbilities = command(async () => {
	console.log("linking unit abilities");
	await prisma.unitAbility.deleteMany({});
	const units = await prisma.unit.findMany({ where: { id: undefined } });

	const abilitiesNotFound = new Set<string>();
	for (const unit of units) {
		const abilities = handleParse(unit.abilities ?? "");
		await prisma.unitAbility.deleteMany({
			where: { unitId: unit.id }
		});
		try {
			await prisma.unit.update({
				where: { id: unit.id },
				data: {
					unitAbilities: {
						create: abilities
							.map((ability) => {
								if (abilityReferences.find((a) => a.abbr === ability.name))
									return {
										ability: { connect: { abbreviation: ability.name } },
										value: ability.v,
										valueMin: ability.vmin,
										short: ability.s,
										shortMin: ability.smin,
										medium: ability.m,
										mediumMin: ability.mmin,
										long: ability.l,
										longMin: ability.lmin,
										extreme: ability.e,
										extremeMin: ability.emin,
										lamData: ability.extracted,
										artilleryType: ability.artType,
										turretAbilities: {
											create: ability.turretAbilities
												?.map((turretAbility) => {
													if (abilityReferences.find((a) => a.abbr === turretAbility.name))
														return {
															unit: { connect: { id: unit.id } },
															ability: { connect: { abbreviation: turretAbility.name } },
															value: turretAbility.v,
															valueMin: turretAbility.vmin,
															short: turretAbility.s,
															shortMin: turretAbility.smin,
															medium: turretAbility.m,
															mediumMin: turretAbility.mmin,
															long: turretAbility.l,
															longMin: turretAbility.lmin,
															extreme: turretAbility.e,
															extremeMin: turretAbility.emin,
															artilleryType: turretAbility.artType
														};
													else {
														console.log(unit.name + " - Turret " + turretAbility.name);
														abilitiesNotFound.add(turretAbility.name);
													}

													return undefined;
												})
												.filter((ability) => ability !== undefined)
										}
									};
								else {
									console.log(unit.name + " - " + ability.name);
									abilitiesNotFound.add(ability.name);
								}
								return undefined;
							})
							.filter((ability) => ability !== undefined)
					}
				}
			});
			if (abilitiesNotFound.size > 0) {
				const spasFound = [...abilitiesNotFound].filter((ability) => spaReferences.find((spa) => spa.name === ability));
				if (spasFound.length) {
					await prisma.unit.update({
						where: { id: unit.id },
						data: {
							unitSpecialPilotAbilities: {
								connect: spasFound.map((spa) => ({
									name: spa
								}))
							}
						}
					});
					console.log("SPAs found: " + spasFound);
					for (const spa of spasFound) {
						abilitiesNotFound.delete(spa);
					}
				}
			}
		} catch (error) {
			console.log("error");
			console.log(abilities);
			console.error(error);
			break;
		}
	}
	console.log(abilitiesNotFound);
	console.log("finished linking unit abilities");
});
