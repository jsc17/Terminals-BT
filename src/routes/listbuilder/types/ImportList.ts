import type { FormationV2 } from "$lib/types/formation";

export type ImportList = {
    id: string;
    name: string;
    era: number;
    faction: number;
    units: string[];
    formations: FormationV2[];
    sublists: string[];
    local?: boolean;
    rules: string;
    lcVersion: number;
};