export interface Tournament {
	id: number;
	name: string;
	era: number;
	date: Date;
	email: string;
	organizer: string;
	passed: boolean;
	participants: Participant[];
	tournamentLink: string;
}
export interface Participant {
	id: number;
	name: string;
	email?: string;
	listCode?: ListCode;
}
export interface ListCode {
	id: number;
	valid: boolean;
	message: string;
	dateSubmitted: Date;
	issues: string;
	units: { id: number; skill: number }[];
	era: number;
	faction: number;
}
