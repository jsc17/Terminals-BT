import { query } from "$app/server";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import type { MulUnit } from "$lib/types/listTypes";
import { handleParse } from "$lib/utilities/abilityUtilities";
import { getRulesByName } from "$lib/rules/rulesets";

export const getMULDataFromId = query.batch(v.number(), async (ids) => {
	const mulData = await prisma.unit.findMany({ where: { mulId: { in: ids } } });
	const lookup = new Map(mulData.map((d) => [d.mulId, d]));

	return (id) => {
		const mulData = lookup.get(id);
		if (mulData) {
			let tempMovement: { speed: number; type: string }[] = [];
			mulData.move.split("/").forEach((movement: string) => {
				let moveSpeed = movement.replaceAll('"', "").match(/\d+/) ?? "0";
				let moveType = movement.replaceAll('"', "").match(/\D+/) ?? "";
				tempMovement.push({ speed: parseInt(moveSpeed[0]), type: moveType[0] });
			});
			if (tempMovement[0].type == "j" && tempMovement.length == 1) {
				tempMovement[0].type = "";
				tempMovement.push({ type: "j", speed: tempMovement[0].speed });
			}
			const reference: MulUnit = {
				id: mulData.id,
				mulId: mulData.mulId,
				name: mulData.name,
				group: mulData.group ?? "",
				class: mulData.class,
				variant: mulData.variant ?? "",
				type: mulData.type,
				subtype: mulData.subtype?.toUpperCase() ?? "",
				pv: mulData.pv,
				cost: mulData.pv,
				skill: 4,
				size: mulData.size,
				move: tempMovement,
				tmm: mulData.tmm,
				health: mulData.armor + mulData.structure,
				armor: mulData.armor,
				structure: mulData.structure,
				damageS: mulData.damage_s,
				damageSMin: mulData.damage_s_min,
				damageM: mulData.damage_m,
				damageMMin: mulData.damage_m_min,
				damageL: mulData.damage_l,
				damageLMin: mulData.damage_l_min,
				damageE: mulData.damage_e,
				damageEMin: mulData.damage_e_min,
				overheat: mulData.overheat,
				abilities: mulData.abilities ? handleParse(mulData.abilities) : [],
				imageLink: mulData.image_url ?? undefined,
				rulesLevel: mulData.rules ?? "",
				tonnage: mulData.tonnage ?? 0,
				date: mulData.date_introduced ?? 0,
				role: mulData.role ?? "",
				availability: undefined,
				threshold: mulData.threshold
			};
			return reference;
		} else return undefined;
	};
});

export const getMULDataFromName = query(v.string(), async (name) => {
	const unit = await prisma.unit.findFirst({ where: { name }, select: { mulId: true } });
	if (unit) return getMULDataFromId(unit.mulId);

	return undefined;
});

export const isUnitUnique = query(v.object({ unitId: v.number(), eras: v.array(v.number()) }), async (data) => {
	const unit = await prisma.unit.findUnique({ where: { id: data.unitId, availability: { some: { era: data.eras.length ? { in: data.eras } : undefined, faction: 4 } } } });
	return unit != null;
});

export const isUnitAvailable = query(v.object({ unitId: v.number(), eras: v.array(v.number()), factions: v.array(v.number()) }), async (data) => {
	const unit = await prisma.unit.findUnique({
		where: {
			id: data.unitId,
			availability: { some: { era: data.eras.length ? { in: data.eras } : undefined, faction: data.factions.length ? { in: data.factions } : undefined } }
		}
	});
	return unit != null;
});

export const getUnitNamesFromIds = query(v.array(v.number()), async (ids) => {
	const results = await prisma.unit.findMany({ where: { mulId: { in: ids } }, select: { name: true, mulId: true } });
	return new Map(results.map((o) => [o.mulId, o.name]));
});

export const getListAvailability = query(v.object({ units: v.array(v.number()), eras: v.array(v.number()), factions: v.array(v.number()) }), async (data) => {
	const promises = data.units.map(async (id) => {
		const exists = await prisma.unit.findUnique({
			where: { mulId: id, availability: { some: { era: { in: data.eras.length ? data.eras : undefined }, faction: { in: data.factions.length ? data.factions : undefined } } } }
		});
		return { id, exists: exists !== null };
	});

	const responseData = new Map<number, boolean>();
	await Promise.allSettled(promises).then((results) => {
		results.forEach((result) => {
			if (result.status == "fulfilled") {
				responseData.set(result.value.id, result.value.exists);
			}
		});
	});

	return responseData;
});

export const getSingleUnitAvailability = query.batch(v.number(), async (ids) => {
	const units = await prisma.unit.findMany({
		where: { id: { in: ids } },
		select: { id: true, availability: { orderBy: { factionAndEra: { era: { order: "asc" } } } } }
	});
	const lookup = new Map<number, { era: number; factions: number[] }[]>();

	for (const unit of units) {
		const availability = new Map<number, number[]>();
		for (const row of unit.availability) {
			if (availability.has(row.era)) {
				availability.get(row.era)!.push(row.faction);
			} else {
				availability.set(row.era, [row.faction]);
			}
		}
		lookup.set(
			unit.id,
			Array.from(availability.entries()).map(([era, factions]) => ({ era, factions }))
		);
	}
	return (id) => lookup.get(id);
});

export const getUnitAvailability = query(v.array(v.number()), async (ids) => {
	const units = await prisma.unit.findMany({ where: { mulId: { in: ids } }, select: { mulId: true, availability: true } });
	return new Map(units.map((u) => [u.mulId, u]));
});

const resultListSchema = v.object({
	factions: v.array(v.number()),
	eras: v.array(v.number()),
	eraSearchType: v.union([v.literal("any"), v.literal("every")]),
	factionSearchType: v.union([v.literal("any"), v.literal("every")])
});
export const getResultList = query(resultListSchema, async ({ eras, eraSearchType, factions, factionSearchType }) => {
	if (!eras.length) eraSearchType = "any";
	if (!factions.length) factionSearchType = "any";

	if (factions.length == 0 && eras.length == 0) return prisma.unit.findMany({ orderBy: [{ tonnage: { sort: "asc", nulls: "last" } }, { name: "asc" }] });

	let searchConditions: any;

	const eraParts = eraSearchType === "every" ? eras.map((era: number) => ({ era })) : [{ era: eras.length ? { in: eras } : undefined }];
	const factionParts = factionSearchType === "every" ? factions.map((faction: number) => ({ faction })) : [{ faction: factions.length ? { in: factions } : undefined }];
	const requirements = eraParts.flatMap((e: any) =>
		factionParts.map((f: any) => ({
			availability: { some: { ...e, ...f } }
		}))
	);

	searchConditions = requirements.length === 1 ? requirements[0] : { AND: requirements };
	return prisma.unit.findMany({
		where: searchConditions,
		orderBy: [{ tonnage: { sort: "asc", nulls: "last" } }, { name: "asc" }]
	});
});

export const getAllUnitNames = query(async () => {
	const units = await prisma.unit.findMany({ orderBy: [{ tonnage: { sort: "asc", nulls: "last" } }, { name: "asc" }], select: { name: true, mulId: true } });
	return units;
});
