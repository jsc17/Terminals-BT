import { form, getRequestEvent, query } from "$app/server";
import { prisma } from "$lib/server/prisma";
import * as v from "valibot";

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

export const addTag = form(v.object({ newTag: v.string(), tagColor: v.string() }), async ({ newTag, tagColor }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const exist = await prisma.collectionTag.findFirst({ where: { label: newTag, userId: locals.user.id } });
	if (exist) return { status: "failed", message: "Tag already exists" };

	await prisma.collectionTag.create({
		data: { label: newTag, color: tagColor, user: { connect: { id: locals.user.id } } }
	});

	return { status: "success", message: "Tag Added" };
});

export const removeTag = form(v.object({ tagToRemove: v.string() }), async ({ tagToRemove }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	if (tagToRemove == undefined) return { status: "failed", message: "Invalid Tag Id" };
	await prisma.collectionTag.delete({ where: { id: Number(tagToRemove) } });

	return { status: "success", message: "Tag removed" };
});

export const updateTag = form(v.object({ tagToUpdate: v.string(), newName: v.string(), tagColor: v.string() }), async ({ tagToUpdate, newName, tagColor }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const existing = await prisma.collectionTag.findFirst({ where: { userId: locals.user.id, label: newName } });
	console.log(existing?.id, Number(tagToUpdate));
	if (existing != null && existing.id != Number(tagToUpdate)) return { status: "failed", message: "Tag already exists" };

	await prisma.collectionTag.update({ where: { id: Number(tagToUpdate) }, data: { label: newName, color: tagColor } });

	return { status: "success", message: "Tag updated successfully" };
});

export const addTagToUnit = form(
	v.object({ unitId: v.array(v.pipe(v.string(), v.transform(Number))), tag: v.array(v.pipe(v.string(), v.transform(Number))) }),
	async ({ unitId: units, tag: tags }) => {
		const { locals } = getRequestEvent();
		if (!locals.user) return { status: "failed", message: "Invalid User" };

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
	}
);

export const removeTagfromUnit = form(v.object({ unitId: v.string(), tagToRemove: v.string() }), async ({ unitId, tagToRemove }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	await prisma.collectionTagsToModels.delete({ where: { modelId_tagId: { modelId: Number(unitId), tagId: Number(tagToRemove) } } });
	await getTaggedUnits().refresh();
	return { status: "success", message: "Tag successfully removed from unit" };
});

export const addUnitToCollection = form(v.object({ newUnitName: v.string(), tag: v.array(v.pipe(v.string(), v.transform(Number))) }), async ({ newUnitName, tag }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	await prisma.collectionModel.create({
		data: { label: newUnitName, user: { connect: { id: locals.user.id } }, unitTags: { create: tag.map((id) => ({ tag: { connect: { id } } })) } }
	});

	await getTaggedUnits().refresh();
	return { status: "success", message: "Model added to collection" };
});

export const removeUnitFromCollection = form(v.object({ idToRemove: v.string() }), async ({ idToRemove }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	await prisma.collectionModel.delete({ where: { id: Number(idToRemove) } });
	await getTaggedUnits().refresh();

	return { status: "success", message: "Unit removed from collection" };
});

export const updateQuantity = form(v.object({ unitId: v.string(), updateQuantity: v.string() }), async ({ unitId, updateQuantity }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	await prisma.collectionModel.update({ where: { id: Number(unitId) }, data: { quantity: Number(updateQuantity) } });
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

export const getUnitsWithTags = form(v.object({ tagId: v.array(v.pipe(v.string(), v.transform(Number))) }), async ({ tagId }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const units = await prisma.collectionModel.findMany({
		where: { userId: locals.user.id, AND: tagId.map((t) => ({ unitTags: { some: { tagId: t } } })) },
		select: { label: true }
	});

	return { status: "success", data: units.map((u) => u.label) };
});
