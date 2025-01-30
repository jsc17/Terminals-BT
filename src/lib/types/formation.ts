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