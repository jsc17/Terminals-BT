export type FormationV2 = {
	id: string;
	name: string;
	type: string;
	units: { id: string }[];
	secondary?: { type: string; units: { id: string }[] };
};

export type FormationType = {
	name: string;
	bonus: string;
	page: string;
	variations?: FormationType[];
	referencedSPAs?: string[];
	grantedSCAs?: string[];
	ideal?: string;
	requirements?: string[];
	secondary?: boolean;
};

export type PlayFormation = {
	id: string;
	name: string;
	type: string;
	units: string[];
	secondary?: { type?: string; units?: string[] };
};
