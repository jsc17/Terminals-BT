import { query } from "$app/server";
import * as z from "zod";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import type { MulUnit } from "$lib/types/listTypes";
import { handleParse } from "$lib/utilities/abilityUtilities";

export const getMULDataFromId = query.batch(z.number(), async (ids) => {
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

export const getCustomUnitData = query.batch(v.number(), async (ids) => {
	const customMulData = await prisma.customCard.findMany({ where: { mulId: { in: ids } } });
	const lookup = new Map(customMulData.map((d) => [d.mulId, d]));

	return (id) => {
		const data = lookup.get(id);
		if (data) {
			return {
				id: data.mulId,
				mulId: data.mulId,
				type: data.type,
				subtype: data.type,
				name: data.name,
				group: "",
				class: data.class,
				variant: data.variant,
				pv: data.pv,
				cost: data.pv,
				abilities: data.abilities ? handleParse(data.abilities) : [],
				rulesLevel: "Standard"
			};
		}
	};
});

export const getMULDataFromName = query(z.string(), async (name) => {
	const custom = await prisma.customCard.findFirst({ where: { name }, select: { mulId: true } });
	if (custom) return getCustomUnitData(custom.mulId);
	const unit = await prisma.unit.findFirst({ where: { name }, select: { mulId: true } });
	if (unit) return getMULDataFromId(unit.mulId);

	return undefined;
});

export const isUnique = query(z.object({ mulId: z.number(), era: z.number() }), async (data) => {
	const unit = await prisma.unit.findUnique({ where: { mulId: data.mulId, availability: { some: { era: data.era, faction: 4 } } } });
	return unit != null;
});

export const isAvailable = query(z.object({ mulId: z.number(), eras: z.number().array(), factions: z.number().array() }), async (data) => {
	const unit = await prisma.unit.findUnique({ where: { mulId: data.mulId, availability: { some: { era: { in: data.eras }, faction: { in: data.factions } } } } });
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

export const getSingleUnitAvailability = query.batch(v.number(), async (mulIds) => {
	const units = await prisma.unit.findMany({ where: { mulId: { in: mulIds } }, select: { mulId: true, availability: { orderBy: { factionAndEra: { era: { order: "asc" } } } } } });
	const lookup = new Map(
		units.map((u) => [
			u.mulId,
			u.availability.reduce((map, { era, faction }) => {
				if (!map.has(era)) map.set(era, []);
				map.get(era)!.push(faction);
				return map;
			}, new Map<number, number[]>())
		])
	);
	return (mulId) => lookup.get(mulId);
});

export const getUnitAvailability = query(v.array(v.number()), async (ids) => {
	const units = await prisma.unit.findMany({ where: { mulId: { in: ids } }, select: { mulId: true, availability: true } });
	return new Map(units.map((u) => [u.mulId, u]));
});
