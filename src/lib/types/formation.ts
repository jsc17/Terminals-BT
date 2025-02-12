import type { UnitV2 } from "./unit";

export type FormationStyles = "ground" | "air" | "unassigned"

export const groundFormationTypes = ["Battle", "Assault", "Striker/Cavalry", "Fire", "Recon", "Pursuit", "Command", "Support", "Transport and Infantry", "Air Lance"];
export const airFormationTypes = ["Interceptor", "Aerospace Superiority", "Fire Support", "Strike", "Electronic Warfare", "Transport"];

export type FormationV2 = {
    id: string;
    name: string;
    type: string;
    units: { id: string }[];
    style: FormationStyles;
}

export function convertOldFormations(items: any): [UnitV2[], FormationV2[]] {
    let units: UnitV2[] = [];
    let formations: FormationV2[] = [];

    console.log(items);

    return [units, formations];
}