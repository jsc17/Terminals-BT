import "../chunks/event-state.js";
import "@sveltejs/kit";
import { q } from "../chunks/query.js";
import * as z from "zod";
import { p } from "../chunks/prisma.js";
import { h } from "../chunks/abilityUtilities.js";
import "../chunks/form.js";
import "../chunks/prerender.js";
const getMULDataFromId = q(z.number(), async (id) => {
  var _a;
  const mulData = await p.unit.findUnique({ where: { mulId: id } });
  if (mulData) {
    let tempMovement = [];
    mulData.move.split("/").forEach((movement) => {
      let moveSpeed = movement.replaceAll('"', "").match(/\d+/) ?? "0";
      let moveType = movement.replaceAll('"', "").match(/\D+/) ?? "";
      tempMovement.push({ speed: parseInt(moveSpeed[0]), type: moveType[0] });
    });
    if (tempMovement[0].type == "j" && tempMovement.length == 1) {
      tempMovement[0].type = "";
      tempMovement.push({ type: "j", speed: tempMovement[0].speed });
    }
    const reference = {
      id: mulData.id,
      mulId: mulData.mulId,
      name: mulData.name,
      group: mulData.group ?? "",
      class: mulData.class,
      variant: mulData.variant ?? "",
      type: mulData.type,
      subtype: ((_a = mulData.subtype) == null ? void 0 : _a.toUpperCase()) ?? "",
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
      abilities: mulData.abilities ? h(mulData.abilities) : [],
      imageLink: mulData.image_url ?? void 0,
      rulesLevel: mulData.rules ?? "",
      tonnage: mulData.tonnage ?? 0,
      date: mulData.date_introduced ?? 0,
      role: mulData.role ?? "",
      availability: void 0,
      threshold: mulData.threshold
    };
    return reference;
  } else return void 0;
});
const getMULDataFromName = q(z.string(), async (name) => {
  const unit = await p.unit.findFirst({ where: { name }, select: { mulId: true } });
  if (unit) return getMULDataFromId(unit.mulId);
  return void 0;
});
const isUnique = q(z.object({ mulId: z.number(), era: z.number() }), async (data) => {
  const unit = await p.unit.findUnique({ where: { mulId: data.mulId, availability: { some: { era: data.era, faction: 4 } } } });
  return unit != null;
});
const isAvailable = q(z.object({ mulId: z.number(), eras: z.number().array(), factions: z.number().array() }), async (data) => {
  const unit = await p.unit.findUnique({ where: { mulId: data.mulId, availability: { some: { era: { in: data.eras }, faction: { in: data.factions } } } } });
  return unit != null;
});
for (const [name, fn] of Object.entries({ getMULDataFromId, getMULDataFromName, isAvailable, isUnique })) {
  fn.__.id = "1bh77am/" + name;
  fn.__.name = name;
}
export {
  getMULDataFromId,
  getMULDataFromName,
  isAvailable,
  isUnique
};
