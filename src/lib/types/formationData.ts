type SizeRequirement = {
	type: "Size";
	description: string;
	size: number;
	limit: "equal" | "equalOrGreater" | "equalOrLess";
	amount: number;
	flatAmount: boolean;
};

type RoleRequirement = {
	type: "Role";
	description: string;
	roles: string[];
	amount: number;
	flatAmount: boolean;
	alternateDescription?: string;
	alternateRoles?: string[];
	alternateAmount?: number;
	alternateFlatAmount?: boolean;
};

type ArmorRequirement = {
	type: "Armor";
	description: string;
	armor: number;
	amount: number;
	flatAmount: boolean;
};

type DamageRequirement = {
	type: "Damage";
	description: string;
	range: "short" | "medium" | "long" | "all";
	damage: number;
	limit: "equal" | "equalOrGreater" | "equalOrLess";
	amount: number;
	flatAmount: boolean;
};

type MovementRequirement = {
	type: "Movement";
	description: string;
	speed: number;
	jumpException?: number;
	amount: number;
	flatAmount: boolean;
};

type AbilityRequirement = {
	type: "Ability";
	description: string;
	abilities: string[];
	value?: number;
	amount: number;
	flatAmount: boolean;
};

type UnitTypeRequirement = {
	type: "Types";
	description: string;
	allowedTypes: string[];
};

type FactionRequirement = {
	type: "Faction";
	description: string;
	allowedFactions: number;
};

type UniqueRequirement = {
	type: "Commander" | "Transport" | "AerospacePair" | "SameModel";
	description: string;
};

export type Requirement =
	| SizeRequirement
	| RoleRequirement
	| ArmorRequirement
	| DamageRequirement
	| MovementRequirement
	| AbilityRequirement
	| UnitTypeRequirement
	| FactionRequirement
	| UniqueRequirement;

//timing: start of play, start of turn, at will
//ability granted: does it grant a set ability, or something that is chosen?
//amount: set number, portion of units, entire formation, all units of role
//uses: does the ability have a set number of uses?

type UniqueFormation = {
	type: "Unique";
	description: string;
};

type FormationWideBonus = {
	type: "FormationWide";
	abilityType: "SPA" | "SCA" | "Unique";
	grantedAbility: string[];
	uses?: { plus?: number };
};

export type AssignedBonus = {
	type: "Assigned";
	abilityType: "SPA" | "SCA" | "Unique";
	grantedAbility: string[];
	sameAbility?: boolean;
	assignedNumber: { flat?: number; plus?: number; portion?: number };
	assignmentTiming?: "playStart" | "turnStart";
};

export type FormationBonus = UniqueFormation | FormationWideBonus | AssignedBonus;

export type FormationData = {
	id: number;
	name: string;
	description?: string;
	ideal?: string;
	minimumUnits?: number;
	maximumUnits?: number;
	requirements?: Requirement[];
	page?: string;
	variations?: FormationData[];
	referencedSPAs?: string[];
	referencedSCAs?: string[];
	secondary?: boolean;
	bonuses: FormationBonus[];
};
