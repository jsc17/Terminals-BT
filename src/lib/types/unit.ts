export type MulUnit = {
    [key: string]: any;
    mulId: number;
    name: string;
    class: string;
    variant: string;
    type: string;
    subtype: string;
    pv: number;
    size?: number;
    move?: { speed: number; type: string }[];
    tmm?: number;
    health?: number;
    armor?: number;
    structure?: number;
    damageS?: number;
    damageSMin?: boolean;
    damageM?: number;
    damageMMin?: boolean;
    damageL?: number;
    damageLMin?: boolean;
    damageE?: number;
    damageEMin?: boolean;
    overheat?: number;
    abilities: string;
    imageLink?: string;
    rulesLevel: string;
    tonnage?: number;
    date?: number;
    role?: string;
    technology?: string;
    availability?: { era: number; faction: number }[];
}

export type UnitCustomization = {
    spa?: string[];
    ammo?: string[];
    //eventually I might add the ability to customize stats on units
    custom?: string[];
}

export type UnitV2 = {
    id: string;
    baseUnit: MulUnit;
    skill: number;
    cost: number;
    customization: UnitCustomization;
}