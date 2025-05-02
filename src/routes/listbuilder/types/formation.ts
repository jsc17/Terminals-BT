export type FormationV2 = {
	id: string;
	name: string;
	type: string;
	units: { id: string }[];
};

export type FormationType = {
	name: string;
	bonus: string;
	page: string;
	variations?: FormationType[];
	grantedSPAs?: string[];
	grantedSCAs?: string[];
};
