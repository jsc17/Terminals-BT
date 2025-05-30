import { prisma } from "$lib/server/prisma.js";

export async function load(event) {
	let notifications;
	if (event.locals.user?.id) {
		notifications = await prisma.notification.findMany({
			where: {
				userId: event.locals.user.id
			},
			select: { date: true, read: true, message: true, summary: true, type: true },
			orderBy: {
				date: "desc"
			}
		});
	}
	return {
		username: event.locals.user?.username,
		notifications
	};
}
