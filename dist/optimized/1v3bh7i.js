import { k } from "../chunks/event-state.js";
import "@sveltejs/kit";
import { f } from "../chunks/form.js";
import { q } from "../chunks/query.js";
import { p } from "../chunks/prisma.js";
import "../chunks/shared.js";
import "../chunks/prerender.js";
const getTags = q(async () => {
  const { locals } = k();
  if (!locals.user) return [];
  const tags = await p.collectionTag.findMany({ where: { OR: [{ userId: null }, { userId: locals.user.id }] }, select: { id: true, label: true, color: true } });
  return tags;
});
const getUserTags = q(async () => {
  const { locals } = k();
  if (!locals.user) return [];
  const tags = await p.collectionTag.findMany({ where: { userId: locals.user.id }, select: { id: true, label: true, color: true } });
  return tags;
});
const addTag = f(async (data) => {
  const { locals } = k();
  if (!locals.user) return { status: "failed", message: "Invalid User" };
  const newTag = data.get("newTag").toString();
  const color = data.get("tagColor").toString();
  const exist = await p.collectionTag.findFirst({ where: { label: newTag, userId: locals.user.id } });
  if (exist) return { status: "failed", message: "Tag already exists" };
  await p.collectionTag.create({
    data: { label: newTag, color, user: { connect: { id: locals.user.id } } }
  });
  return { status: "success", message: "Tag Added" };
});
const removeTag = f(async (data) => {
  var _a;
  const { locals } = k();
  if (!locals.user) return { status: "failed", message: "Invalid User" };
  const tagToRemove = (_a = data.get("tagToRemove")) == null ? void 0 : _a.toString();
  if (tagToRemove == void 0) return { status: "failed", message: "Invalid Tag Id" };
  await p.collectionTag.delete({ where: { id: Number(tagToRemove) } });
  return { status: "success", message: "Tag removed" };
});
const updateTag = f(async (data) => {
  var _a, _b;
  const { locals } = k();
  if (!locals.user) return { status: "failed", message: "Invalid User" };
  const tagId = (_a = data.get("tagToUpdate")) == null ? void 0 : _a.toString();
  if (tagId == void 0) return { status: "failed", message: "Invalid Tag Id" };
  const newName = (_b = data.get("newName")) == null ? void 0 : _b.toString();
  if (newName == void 0) return { status: "failed", message: "Invalid Name" };
  const newColor = data.get("tagColor").toString();
  if (newColor == void 0) return { status: "failed", message: "Invalid Color" };
  const existing = await p.collectionTag.findFirst({ where: { userId: locals.user.id, label: newName } });
  console.log(existing == null ? void 0 : existing.id, Number(tagId));
  if (existing != null && existing.id != Number(tagId)) return { status: "failed", message: "Tag already exists" };
  await p.collectionTag.update({ where: { id: Number(tagId) }, data: { label: newName, color: newColor } });
  return { status: "success", message: "Tag updated successfully" };
});
const addTagToUnit = f(async (data) => {
  const { locals } = k();
  if (!locals.user) return { status: "failed", message: "Invalid User" };
  const units = data.getAll("unitId").map((value) => Number(value.toString()));
  if (units.length == 0) return { status: "failed", message: "No tags provided" };
  const tags = data.getAll("tag").map((value) => Number(value.toString()));
  if (tags.length == 0) return { status: "failed", message: "No tags provided" };
  await Promise.all(
    units.map(async (id) => {
      var _a;
      const existingTags = (_a = await p.collectionModel.findUnique({ where: { id }, select: { unitTags: { select: { tagId: true } } } })) == null ? void 0 : _a.unitTags.map((v) => v.tagId);
      return p.collectionModel.update({
        where: { id },
        data: { unitTags: { create: tags.filter((t) => !(existingTags == null ? void 0 : existingTags.includes(t))).map((id2) => ({ tag: { connect: { id: id2 } } })) } }
      });
    })
  );
  return { status: "success", message: `${tags.length == 1 ? "Tag" : "Tags"} successfully added to ${units.length == 1 ? "model" : "models"}` };
});
const removeTagfromUnit = f(async (data) => {
  var _a, _b;
  const { locals } = k();
  if (!locals.user) return { status: "failed", message: "Invalid User" };
  const id = (_a = data.get("unitId")) == null ? void 0 : _a.toString();
  if (id == void 0) return { status: "failed", message: "Invalid unit id" };
  const tagToRemove = (_b = data.get("tagToRemove")) == null ? void 0 : _b.toString();
  if (tagToRemove == void 0) return { status: "failed", message: "Invalid Tag Id" };
  await p.collectionTagsToModels.delete({ where: { modelId_tagId: { modelId: Number(id), tagId: Number(tagToRemove) } } });
  await getTaggedUnits().refresh();
  return { status: "success", message: "Tag successfully removed from unit" };
});
const addUnitToCollection = f(async (data) => {
  var _a;
  const { locals } = k();
  if (!locals.user) return { status: "failed", message: "Invalid User" };
  const groupName = (_a = data.get("new-unit-name")) == null ? void 0 : _a.toString();
  if (groupName == void 0) return { status: "failed", message: "Invalid unit" };
  const tags = data.getAll("tag").map((value) => Number(value.toString()));
  await p.collectionModel.create({
    data: { label: groupName, user: { connect: { id: locals.user.id } }, unitTags: { create: tags.map((id) => ({ tag: { connect: { id } } })) } }
  });
  await getTaggedUnits().refresh();
  return { status: "success", message: "Model added to collection" };
});
const removeUnitFromCollection = f(async (data) => {
  var _a;
  const { locals } = k();
  if (!locals.user) return { status: "failed", message: "Invalid User" };
  const id = (_a = data.get("idToRemove")) == null ? void 0 : _a.toString();
  if (id == void 0) return { status: "failed", message: "Invalid unit" };
  await p.collectionModel.delete({ where: { id: Number(id) } });
  await getTaggedUnits().refresh();
  return { status: "success", message: "Unit removed from collection" };
});
const updateQuantity = f(async (data) => {
  var _a, _b;
  const { locals } = k();
  if (!locals.user) return { status: "failed", message: "Invalid User" };
  const id = (_a = data.get("unitId")) == null ? void 0 : _a.toString();
  if (id == void 0) return { status: "failed", message: "Invalid unit" };
  const newQuantity = (_b = data.get("updateQuantity")) == null ? void 0 : _b.toString();
  if (id == void 0) return { status: "failed", message: "Invalid Quantity" };
  await p.collectionModel.update({ where: { id: Number(id) }, data: { quantity: Number(newQuantity) } });
  return { status: "success", message: "Quantity updated" };
});
const getTaggedUnits = q(async () => {
  const { locals } = k();
  if (!locals.user) return { status: "failed", message: "Invalid User" };
  const units = await p.collectionModel.findMany({
    where: { userId: locals.user.id },
    include: { unitTags: { select: { tag: true } } },
    orderBy: { label: "asc" }
  });
  return { status: "success", data: units };
});
const getUnitGroups = q(async () => {
  const unitList = await p.unit.findMany({ select: { class: true, group: true } });
  const groupList = new Set(
    unitList.map((unit) => {
      return unit.group != "" && unit.group != null ? unit.group : unit.class;
    }).sort()
  );
  return [...groupList];
});
const getUnitsWithTags = f(async (data) => {
  const { locals } = k();
  if (!locals.user) return { status: "failed", message: "Invalid User" };
  const tags = data.getAll("tagId").map((v) => Number(v.toString()));
  if (tags.length == 0) return { status: "failed", message: "No tags recieved" };
  const units = await p.collectionModel.findMany({ where: { userId: locals.user.id, AND: tags.map((t) => ({ unitTags: { some: { tagId: t } } })) }, select: { label: true } });
  return { status: "success", data: units.map((u) => u.label) };
});
for (const [name, fn] of Object.entries({ addTag, addTagToUnit, addUnitToCollection, getTaggedUnits, getTags, getUnitGroups, getUnitsWithTags, getUserTags, removeTag, removeTagfromUnit, removeUnitFromCollection, updateQuantity, updateTag })) {
  fn.__.id = "1v3bh7i/" + name;
  fn.__.name = name;
}
export {
  addTag,
  addTagToUnit,
  addUnitToCollection,
  getTaggedUnits,
  getTags,
  getUnitGroups,
  getUnitsWithTags,
  getUserTags,
  removeTag,
  removeTagfromUnit,
  removeUnitFromCollection,
  updateQuantity,
  updateTag
};
