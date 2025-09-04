import { query } from "$app/server";
import * as z from "zod";
import * as v from "valibot";
import { prisma } from "$lib/server/prisma";
import type { MulUnit } from "$lib/types/listTypes";
import { handleParse } from "$lib/utilities/abilityUtilities";

export const getMULDataFromId = query(z.number(), async (id: number) => {
	const mulData = await prisma.unit.findUnique({ where: { mulId: id } });

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
		return { status: "success", data: reference };
	} else return { status: "failed", message: "Unit not found" };
});

export const getMULDataFromName = query(z.string(), async (name) => {
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
