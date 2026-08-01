import { command, form, getRequestEvent, query } from "$app/server";
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

	await getTags().refresh();
	await getUserTags().refresh();

	return { status: "success", message: "Tag Added" };
});

export const deleteTag = command(v.number(), async (tagToRemove) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	if (tagToRemove == undefined) return { status: "failed", message: "Invalid Tag Id" };
	await prisma.collectionTag.delete({ where: { id: tagToRemove } });

	await getTags().refresh();
	await getUserTags().refresh();
	await getTaggedUnits().refresh();

	return { status: "success", message: "Tag removed" };
});

export const updateTag = form(v.object({ tagId: v.number(), updatedName: v.string(), updatedColor: v.string() }), async ({ tagId, updatedName, updatedColor }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const existing = await prisma.collectionTag.findFirst({ where: { userId: locals.user.id, label: updatedName } });
	if (existing != null && existing.id != tagId) return { status: "failed", message: "Tag already exists" };

	await prisma.collectionTag.update({ where: { id: tagId }, data: { label: updatedName, color: updatedColor } });

	await getTags().refresh();
	await getUserTags().refresh();

	return { status: "success", message: "Tag updated successfully" };
});

export const addUnitToCollection = form(v.object({ units: v.array(v.string()), tag: v.optional(v.array(v.number()), []) }), async ({ units, tag }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	await Promise.all(
		units.map(async (u) => {
			const { label, type, quantity } = JSON.parse(u);
			await prisma.collectionModel.create({
				data: {
					label,
					type,
					quantity,
					user: { connect: { id: locals.user!.id } },
					unitTags: { create: tag.map((id) => ({ tag: { connect: { id } } })) }
				}
			});
		})
	);

	await getTaggedUnits().refresh();
	return { status: "success", message: "Model added to collection" };
});

export const updateUnit = form(v.object({ unitId: v.number(), tags: v.optional(v.array(v.number())), quantity: v.number() }), async ({ unitId, tags, quantity }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	await prisma.collectionModel.update({
		where: { id: unitId, userId: locals.user.id },
		data: { quantity, unitTags: { deleteMany: {}, create: tags?.map((id) => ({ tag: { connect: { id } } })) } }
	});

	return { status: "success", message: "Unit Successfully Updated" };
});

export const bulkAddTagsToUnits = command(v.object({ unitIds: v.array(v.number()), tagIds: v.array(v.number()) }), async ({ unitIds, tagIds }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const usersModels = await prisma.collectionModel.findMany({ where: { userId: locals.user.id, id: { in: unitIds } }, select: { id: true } });

	await prisma.collectionTagsToModels.createMany({ data: usersModels.flatMap((m) => tagIds.map((t) => ({ modelId: m.id, tagId: t }))), skipDuplicates: true });
	await getTaggedUnits().refresh();

	return { status: "success", message: "Tags successfully added to units" };
});

export const bulkRemoveTagsFromUnits = command(v.object({ unitIds: v.array(v.number()), tagIds: v.array(v.number()) }), async ({ unitIds, tagIds }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const usersModels = await prisma.collectionModel.findMany({ where: { userId: locals.user.id, id: { in: unitIds } }, select: { id: true } });

	await prisma.collectionTagsToModels.deleteMany({ where: { modelId: { in: usersModels.map((m) => m.id) }, tagId: { in: tagIds } } });
	await getTaggedUnits().refresh();

	return { status: "success", message: "Tags successfully added to units" };
});

export const bulkSetTagsOnUnits = command(v.object({ unitIds: v.array(v.number()), tagIds: v.array(v.number()) }), async ({ unitIds, tagIds }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const usersModels = await prisma.collectionModel.findMany({ where: { userId: locals.user.id, id: { in: unitIds } }, select: { id: true } });
	await prisma.collectionTagsToModels.deleteMany({ where: { modelId: { in: usersModels.map((m) => m.id) } } });
	await prisma.collectionTagsToModels.createMany({ data: usersModels.flatMap((m) => tagIds.map((t) => ({ modelId: m.id, tagId: t }))), skipDuplicates: true });

	await getTaggedUnits().refresh();

	return { status: "success", message: "Tags successfully set on units" };
});

export const removeUnitFromCollection = form(v.object({ idToRemove: v.string() }), async ({ idToRemove }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	await prisma.collectionModel.delete({ where: { userId: locals.user.id, id: Number(idToRemove) } });
	await getTaggedUnits().refresh();

	return { status: "success", message: "Unit removed from collection" };
});

export const bulkRemoveUnitsFromCollection = command(v.array(v.number()), async (idsToRemove) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	if (!idsToRemove.length) return { status: "failed", message: "No units selected for removal" };

	await prisma.collectionModel.deleteMany({ where: { userId: locals.user.id, id: { in: idsToRemove } } });
	await getTaggedUnits().refresh();

	return { status: "success", message: "Selected units removed from collection" };
});

export const getTaggedUnits = query(async () => {
	const { locals } = getRequestEvent();
	if (!locals.user) return [];

	const units = await prisma.collectionModel.findMany({
		where: { userId: locals.user.id },
		include: { unitTags: { select: { tag: true } } },
		orderBy: { label: "asc" }
	});
	return units;
});

export const getUnitsWithGroups = query(async () => {
	let unitList = await prisma.unit.findMany({ distinct: ["class", "subtype"], select: { class: true, group: true, subtype: true } });
	return unitList.sort((a, b) => a.class.localeCompare(b.class));
});

export const getUnitsWithTags = form(v.object({ tagId: v.array(v.pipe(v.string(), v.transform(Number))) }), async ({ tagId }) => {
	const { locals } = getRequestEvent();
	if (!locals.user) return { status: "failed", message: "Invalid User" };

	const units = await prisma.collectionModel.findMany({
		where: { userId: locals.user.id, AND: tagId.map((t) => ({ unitTags: { some: { tagId: t } } })) },
		select: { label: true, type: true }
	});

	return { status: "success", data: units.map((u) => ({ group: u.label, type: u.type! })) };
});
