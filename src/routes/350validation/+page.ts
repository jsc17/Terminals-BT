export const load = async ({ url, data }) => {
	const tempList = JSON.parse(data.tournamentList);
	const tournamentList: any[] = [];
	for (const tournament of tempList) {
		tournamentList.push({ id: tournament.id, name: tournament.name, organizer: tournament.organizer, era: tournament.era, tournament_date: tournament.tournament_date });
	}
	return {
		id: url.searchParams.get("id"),
		tournamentList
	};
};
