import "../chunks/event-state.js";
import "@sveltejs/kit";
import { f } from "../chunks/form.js";
import { q } from "../chunks/query.js";
import { getGeneralId } from "./1dw4xl7.js";
import { getMULDataFromName, isUnique, isAvailable } from "./1bh77am.js";
import { getDocument } from "pdfjs-dist";
import "../chunks/prerender.js";
import "../chunks/prisma.js";
import "zod";
import "../chunks/abilityUtilities.js";
function getUnitDataFromPDF(content) {
  let startingIndex, stepCount, upperlimit;
  if (content.items[0].str == "Master Unit List - Forces") {
    startingIndex = 12;
    stepCount = 9;
    upperlimit = content.items.length - 7;
  } else {
    console.log("Not MUL List");
    startingIndex = content.items.findIndex((value) => {
      return value.str == "";
    });
    stepCount = 1;
    upperlimit = 1;
  }
  const parsedData = [];
  for (let index = startingIndex; index < upperlimit; index += stepCount) {
    let name = content.items[index].str;
    if (content.items[index + 1].str != " ") {
      name += " " + content.items[index + 1].str;
      index++;
    }
    const pv = Number(content.items[index + 6].str);
    const skill = Number(content.items[index + 4].str);
    parsedData.push({ name, pv, skill });
  }
  return parsedData;
}
const getUnitData = f(async (data) => {
  var _a, _b, _c;
  const fileData = data.get("listFile");
  const era = Number((_a = data.get("selectedEra")) == null ? void 0 : _a.toString());
  const faction = Number((_b = data.get("selectedFaction")) == null ? void 0 : _b.toString());
  let unitData = [];
  const buffer = await fileData.arrayBuffer();
  const pdf = await getDocument(buffer).promise;
  const page = await pdf.getPage(1);
  const content = await page.getTextContent();
  const parsedData = getUnitDataFromPDF(content);
  for (const parsedUnit of parsedData) {
    const unit = await getMULDataFromName(parsedUnit.name);
    let unique, available;
    if (unit) {
      unique = await isUnique({ mulId: unit.mulId, era });
      const general = (_c = await getGeneralId({ era, faction })) == null ? void 0 : _c.general;
      available = await isAvailable({ mulId: unit.mulId, eras: [era], factions: [faction, general ?? 0] });
    }
    unitData.push({
      id: crypto.randomUUID(),
      name: parsedUnit.name,
      skill: parsedUnit.skill,
      pv: parsedUnit.pv,
      mulData: unit,
      link: unit ? `http://masterunitlist.info/Unit/Details/${unit.mulId}` : void 0,
      unique,
      available
    });
  }
  await nothing().refresh();
  return unitData;
});
const getPossibleUnitList = f(async (data) => {
  var _a;
  const searchTerm = (_a = data.get("searchTerm")) == null ? void 0 : _a.toString();
  const results = await prisma.unit.findMany({ where: { name: { contains: searchTerm } }, select: { mulId: true, name: true } });
  await nothing().refresh();
  return results;
});
const nothing = q(async () => {
});
for (const [name, fn] of Object.entries({ getPossibleUnitList, getUnitData, nothing })) {
  fn.__.id = "haigrw/" + name;
  fn.__.name = name;
}
export {
  getPossibleUnitList,
  getUnitData,
  nothing
};
