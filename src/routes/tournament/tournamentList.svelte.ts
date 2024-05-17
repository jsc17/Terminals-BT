import type { Tournament, Participant, ListCode } from "./types";
import { deserialize } from "$app/forms";

function createTournamentList() {
	let tournaments = $state<Tournament[]>([]);
	let selectedTournamentIndex = $state<number>(-1);
	let selectedParticipantIndex = $state<number>(-1);
	let selectedUnitList = $state<{ name: string; skill: number; pv: number }[]>([]);

	async function getTournaments() {
		const response: any = deserialize(await (await fetch("?/getTournaments", { method: "POST", body: "" })).text());
		if (response.status == 200) {
			tournaments = [];
			for (const tournament of JSON.parse(response.data!.tournamentList)) {
				let formattedTournament: Tournament = {
					id: tournament.id,
					name: tournament.name,
					era: tournament.era,
					date: new Date(tournament.tournament_date),
					email: tournament.email,
					organizer: tournament.organizer,
					passed: tournament.passed ?? false,
					participants: [],
					tournamentLink: `https://bt.terminl.xyz/350validation?id=${tournament.id}`,
					privateTournament: tournament.private,
					displayEmail: tournament.display_email,
					requireEmail: tournament.require_email,
					allowResubmission: tournament.allow_resubmission
				};
				for (const participant of tournament.participants) {
					const tempCodes: ListCode[] = [];
					for (const code of participant.listCodes!) {
						let tempUnits: { id: number; skill: number }[] = [];
						for (const tempUnit of code.units.split(":")) {
							const unitParts = tempUnit.split(",");
							tempUnits.push({ id: unitParts[0], skill: unitParts[1] });
						}
						const formattedList: ListCode = {
							id: code.id,
							valid: code.valid,
							message: code.message == "" ? "-" : code.message,
							issues: code.issues == "" ? "-" : code.issues,
							dateSubmitted: new Date(code.dateSubmitted),
							era: code.era,
							faction: code.faction,
							units: tempUnits
						};
						tempCodes.push(formattedList);
					}

					let formattedParticipant: Participant = {
						id: participant.id,
						email: participant.email == "" ? "-" : participant.email,
						name: participant.name,
						listCodes: tempCodes
					};
					formattedTournament.participants.push(formattedParticipant);
				}
				tournaments.push(formattedTournament);
			}
			tournaments.sort((a: Tournament, b: Tournament) => {
				return a.date.getTime() - b.date.getTime();
			});
		}
	}
	function clearTournamentList() {
		tournaments = [];
	}
	function clearUnitList() {
		selectedUnitList = [];
	}
	async function deleteParticipant(index: number) {
		const formData = new FormData();
		formData.append("id", tournaments[selectedTournamentIndex].participants[selectedParticipantIndex].id.toString());
		fetch("?/deleteParticipant", { method: "post", body: formData });
		tournaments[selectedTournamentIndex].participants.splice(index, 1);
	}

	return {
		get tournaments() {
			return tournaments;
		},
		get selectedTournament() {
			if (selectedTournamentIndex != -1) {
				return tournaments[selectedTournamentIndex];
			} else {
				return undefined;
			}
		},
		get selectedTournamentIndex() {
			return selectedTournamentIndex;
		},
		get selectedParticipantIndex() {
			return selectedParticipantIndex;
		},
		selectTournament: (index: number) => {
			selectedTournamentIndex = index;
		},
		selectParticipant: (index: number) => {
			selectedParticipantIndex = index;
		},
		get selectedParticipant() {
			if (selectedParticipantIndex != -1) {
				return tournaments[selectedTournamentIndex].participants[selectedParticipantIndex];
			} else {
				return undefined;
			}
		},
		get selectedUnitList() {
			return selectedUnitList;
		},
		getTournaments,
		clearUnitList,
		clearTournamentList,
		deleteParticipant
	};
}

export const tournamentList = createTournamentList();
