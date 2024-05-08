import type { Tournament, Participant, ListCode } from "./types";

function createTournamentList() {
	let tournamentList = $state<Tournament[]>([]);
	let selectedTournament = $state<number>(-1);
	let selectedParticipant = $state<number>(-1);
	let selectedUnitList = $state<{ name: string; skill: number; pv: number }[]>([]);
}

export const tournamentList = createTournamentList();
