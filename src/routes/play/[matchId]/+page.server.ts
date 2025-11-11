export const load = async ({ params }) => {
	let matchId = Number(params.matchId);

	return { matchId };
};
