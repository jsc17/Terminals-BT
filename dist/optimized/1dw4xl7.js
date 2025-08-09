import "../chunks/event-state.js";
import "@sveltejs/kit";
import { p } from "../chunks/prerender.js";
import { q } from "../chunks/query.js";
import { p as p$1 } from "../chunks/prisma.js";
import * as z from "zod";
import "../chunks/form.js";
p(async () => {
  const eras = await p$1.era.findMany({ select: { id: true, name: true }, orderBy: { order: "asc" } });
  return eras;
});
p(async () => {
  const factions = await p$1.faction.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  return factions;
});
const getFactionsInEra = q(z.number().array(), async (eras) => {
  const factionList = await p$1.factionInEra.findMany({
    where: {
      eraId: { in: eras }
    },
    include: {
      faction: {
        select: { name: true }
      }
    },
    orderBy: {
      faction: {
        name: "asc"
      }
    }
  });
  return factionList;
});
const getGeneralId = q(z.object({ era: z.number(), faction: z.number() }), async (data) => {
  const id = await p$1.factionInEra.findFirst({
    where: { eraId: data.era, factionId: data.faction },
    select: {
      general: true
    }
  });
  return id;
});
const getEraName = q(z.number(), async (idToFind) => {
  const result = await p$1.era.findUnique({ where: { id: idToFind }, select: { name: true } });
  return (result == null ? void 0 : result.name) ?? "Not Found";
});
const getFactionName = q(z.number(), async (idToFind) => {
  const result = await p$1.faction.findUnique({ where: { id: idToFind }, select: { name: true } });
  return (result == null ? void 0 : result.name) ?? "Not Found";
});
const getEras = p("unchecked", () => {
  throw new Error("Unexpectedly called prerender function. Did you forget to set { dynamic: true } ?");
});
const getFactions = p("unchecked", () => {
  throw new Error("Unexpectedly called prerender function. Did you forget to set { dynamic: true } ?");
});
for (const [name, fn] of Object.entries({ getEraName, getEras, getFactionName, getFactions, getFactionsInEra, getGeneralId })) {
  fn.__.id = "1dw4xl7/" + name;
  fn.__.name = name;
}
export {
  getEraName,
  getEras,
  getFactionName,
  getFactions,
  getFactionsInEra,
  getGeneralId
};
