export type Tournament = {
	id: number;
	name: string;
	era: number;
	date: Date;
	email: string;
	organizer: string;
	passed: boolean;
	participants: Participant[];
	tournamentLink: string;
	privateTournament: boolean;
	displayEmail: boolean;
	allowResubmission: boolean;
	requireEmail: boolean;
};
export type Participant = {
	id: number;
	name: string;
	email?: string;
	listCodes: ListCode[];
};
export type ListCode = {
	id: number;
	valid: boolean;
	message: string;
	dateSubmitted: Date;
	issues: string;
	units: { id: number; skill: number }[];
	era: number;
	faction: number;
};
