import { form, getRequestEvent, query } from "$app/server";
import { prisma } from "$lib/server/prisma";
import * as z from "zod";

export const getTags = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) return [];

	const tags = await prisma.collectionTag.findMany({ where: { OR: [{ userId: null }, { userId: locals.user.id }] }, select: { id: true, label: true, color: true } });
	return tags;
});

export const getUserTags = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) return [];

	const tags = await prisma.collectionTag.findMany({ where: { userId: locals.user.id }, select: { id: true, label: true, color: true } });
	return tags;
});

export const addTag = form(async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const newTag = data.get("newTag")!.toString();
	const color = data.get("tagColor")!.toString();

	const exist = await prisma.collectionTag.findFirst({ where: { label: newTag, userId: locals.user.id } });
	if (exist) return { status: "failed", message: "Tag already exists" };

	await prisma.collectionTag.create({
		data: { label: newTag, color, user: { connect: { id: locals.user.id } } }
	});

	await getTags().refresh();
	await getUserTags().refresh();
	return { status: "success", message: "Tag Added" };
});

export const removeTag = form(async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const tagToRemove = data.get("tagToRemove")?.toString();
	if (tagToRemove == undefined) return { status: "failed", message: "Invalid Tag Id" };
	console.log(tagToRemove);
	await prisma.collectionTag.delete({ where: { id: Number(tagToRemove) } });
	await getTags().refresh();
	await getUserTags().refresh();
	return { status: "success", message: "Tag removed" };
});

export const updateTag = form(async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const tagId = data.get("tagToUpdate")?.toString();
	if (tagId == undefined) return { status: "failed", message: "Invalid Tag Id" };
	const newName = data.get("newName")?.toString();
	if (newName == undefined) return { status: "failed", message: "Invalid Name" };
	const newColor = data.get("tagColor")!.toString();
	if (newColor == undefined) return { status: "failed", message: "Invalid Color" };

	const existing = await prisma.collectionTag.findFirst({ where: { userId: locals.user.id, label: newName } });
	console.log(existing?.id, Number(tagId));
	if (existing != null && existing.id != Number(tagId)) return { status: "failed", message: "Tag already exists" };

	await prisma.collectionTag.update({ where: { id: Number(tagId) }, data: { label: newName, color: newColor } });
	await getTags().refresh();
	await getUserTags().refresh();
	await getTaggedUnits().refresh();
	return { status: "success", message: "Tag updated successfully" };
});

export const addTagToUnit = form(async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const units = data.getAll("unitId").map((value) => Number(value.toString()));
	if (units.length == 0) return { status: "failed", message: "No tags provided" };

	const tags = data.getAll("tag").map((value) => Number(value.toString()));
	if (tags.length == 0) return { status: "failed", message: "No tags provided" };

	await Promise.all(
		units.map(async (id) => {
			const existingTags = (await prisma.collectionModel.findUnique({ where: { id }, select: { unitTags: { select: { tagId: true } } } }))?.unitTags.map((v) => v.tagId);
			return prisma.collectionModel.update({
				where: { id },
				data: { unitTags: { create: tags.filter((t) => !existingTags?.includes(t)).map((id) => ({ tag: { connect: { id } } })) } }
			});
		})
	);

	return { status: "success", message: `${tags.length == 1 ? "Tag" : "Tags"} successfully added to ${units.length == 1 ? "model" : "models"}` };
});

export const removeTagfromUnit = form(async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const id = data.get("unitId")?.toString();
	if (id == undefined) return { status: "failed", message: "Invalid unit id" };

	const tagToRemove = data.get("tagToRemove")?.toString();
	if (tagToRemove == undefined) return { status: "failed", message: "Invalid Tag Id" };

	await prisma.collectionTagsToModels.delete({ where: { modelId_tagId: { modelId: Number(id), tagId: Number(tagToRemove) } } });
	await getTaggedUnits().refresh();
	return { status: "success", message: "Tag successfully removed from unit" };
});

export const addUnitToCollection = form(async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const groupName = data.get("new-unit-name")?.toString();
	if (groupName == undefined) return { status: "failed", message: "Invalid unit" };
	const tags = data.getAll("tag").map((value) => Number(value.toString()));

	await prisma.collectionModel.create({
		data: { label: groupName, user: { connect: { id: locals.user.id } }, unitTags: { create: tags.map((id) => ({ tag: { connect: { id } } })) } }
	});

	await getTaggedUnits().refresh();
	return { status: "success", message: "Model added to collection" };
});

export const removeUnitFromCollection = form(async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const id = data.get("idToRemove")?.toString();
	if (id == undefined) return { status: "failed", message: "Invalid unit" };

	await prisma.collectionModel.delete({ where: { id: Number(id) } });
	return { status: "success", message: "Unit removed from collection" };
});

export const updateQuantity = form(async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const id = data.get("unitId")?.toString();
	if (id == undefined) return { status: "failed", message: "Invalid unit" };

	const newQuantity = data.get("updateQuantity")?.toString();
	if (id == undefined) return { status: "failed", message: "Invalid Quantity" };

	await prisma.collectionModel.update({ where: { id: Number(id) }, data: { quantity: Number(newQuantity) } });
	return { status: "success", message: "Quantity updated" };
});

export const getTaggedUnits = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const units = await prisma.collectionModel.findMany({
		where: { userId: locals.user.id },
		include: { unitTags: { select: { tag: true } } },
		orderBy: { label: "asc" }
	});
	return { status: "success", data: units };
});

export const getUnitGroups = query(async () => {
	const unitList = await prisma.unit.findMany({ select: { class: true, group: true } });
	const groupList = new Set(
		unitList
			.map((unit) => {
				return unit.group != "" && unit.group != null ? unit.group : unit.class;
			})
			.sort()
	);
	return [...groupList];
});

export const getUnitsWithTags = form(async (data) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };
	const tags = data.getAll("tagId").map((v) => Number(v.toString()));
	if (tags.length == 0) return { status: "failed", message: "No tags recieved" };

	const units = await prisma.collectionModel.findMany({ where: { userId: locals.user.id, AND: tags.map((t) => ({ unitTags: { some: { tagId: t } } })) }, select: { label: true } });

	return { status: "success", data: units.map((u) => u.label) };
});
