import { type Requirement } from "$lib/types/formationRequirementTypes";

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
	bonus: string;
};

export const formationDataList: { type: string; formations: FormationData[] }[] = [
	{
		type: "",
		formations: [
			{
				id: 0,
				name: "Combat Group",
				page: "N/A",
				minimumUnits: 0,
				bonus: "No bonus abilities. Just used for force organization."
			}
		]
	},
	{
		type: "Ground Formations",
		formations: [
			{
				id: 1,
				name: "Battle",
				ideal: "Brawler",
				requirements: [
					{ type: "Size", description: "50% of the Battle Formation must be Size 3 or higher", size: 3, limit: "equalOrGreater", amount: 0.5, flatAmount: false },
					{
						type: "Role",
						description: "At least 3 units must be any combination of the Brawler, Sniper and/or Skirmisher roles",
						roles: ["Brawler", "Sniper", "Skirmisher"],
						amount: 3,
						flatAmount: true
					}
				],
				page: "AS:CE pg.117",
				bonus:
					"The Battle Lance formation receives the equivalent of a Lucky Special Pilot Ability (see p . 97) as a level of the number of units in the formation at Setup plus two",
				referencedSPAs: ["Lucky"],
				variations: [
					{
						id: 2,
						name: "Light Battle",
						requirements: [
							{ type: "Size", description: "At least 75% of units must be Size 1", size: 1, limit: "equal", amount: 0.75, flatAmount: false },
							{ type: "Size", description: "No units may be Size 4 or greater", size: 3, limit: "equalOrLess", amount: 1, flatAmount: false },
							{ type: "Role", description: "At least 1 unit must have the Scout role", roles: ["Scout"], amount: 1, flatAmount: true }
						],
						page: "AS:CE pg.117",
						bonus:
							"The Battle Lance formation receives the equivalent of a Lucky Special Pilot Ability (see p . 97) as a level of the number of units in the formation at Setup plus two",
						referencedSPAs: ["Lucky"]
					},
					{
						id: 3,
						name: "Medium Battle",
						requirements: [
							{ type: "Size", description: "At least 50% of units must be Size 2", size: 2, limit: "equal", amount: 0.5, flatAmount: false },
							{ type: "Size", description: "No units may be Size 4 or greater", size: 3, limit: "equalOrLess", amount: 1, flatAmount: false }
						],
						page: "AS:CE pg.117",
						bonus:
							"The Battle Lance formation receives the equivalent of a Lucky Special Pilot Ability (see p . 97) as a level of the number of units in the formation at Setup plus two",
						referencedSPAs: ["Lucky"]
					},
					{
						id: 4,
						name: "Heavy Battle",
						requirements: [
							{ type: "Size", description: "At least 50% of units must be Size 3 or greater", size: 3, limit: "equalOrGreater", amount: 0.5, flatAmount: false },
							{ type: "Size", description: "No units may be Size 1", size: 2, limit: "equalOrGreater", amount: 1, flatAmount: false }
						],
						page: "AS:CE pg.117",
						bonus:
							"The Battle Lance formation receives the equivalent of a Lucky Special Pilot Ability (see p . 97) as a level of the number of units in the formation at Setup plus two",
						referencedSPAs: ["Lucky"]
					}
				]
			},
			{
				id: 5,
				name: "Assault",
				ideal: "Juggernaut",
				requirements: [
					{ type: "Size", description: "At least 3 units must be Size 3 or greater", size: 3, limit: "equalOrGreater", amount: 3, flatAmount: true },
					{ type: "Size", description: "No units may be Size 1", size: 2, limit: "equalOrGreater", amount: 1, flatAmount: false },
					{ type: "Armor", description: "All units must have an Armor value of 5 or greater", armor: 5, amount: 1, flatAmount: false },
					{
						type: "Damage",
						description: "At least 75% of units must have a Medium-range damage value of 3 or greater",
						range: "medium",
						damage: 3,
						limit: "equalOrGreater",
						amount: 0.75,
						flatAmount: false
					},
					{
						type: "Role",
						description: "At least 1 unit must have the Juggernaut role or at least 2 must have the Sniper role",
						roles: ["Juggernaut"],
						amount: 1,
						flatAmount: true,
						alternateRoles: ["Sniper"],
						alternateAmount: 2,
						alternateFlatAmount: true
					}
				],
				page: "AS:CE pg.118",
				bonus:
					"At the beginning of play, the Assault Lance's controlling player must choose either the Demoralizer or the Multi-Tasker SPAs (see pp . 93 and 98, respectively) . When each turn of game play begins, the player may designate up to half the units in the Assault Lance (rounded down) to receive the chosen ability for the duration of the turn . Destroyed or withdrawn units do not count towards the current number of units in the formation",
				referencedSPAs: ["Demoralizer", "Multi-Tasker"],
				variations: [
					{
						id: 6,
						name: "Fast Assault",
						requirements: [
							{ type: "Size", description: "At least 3 units must be Size 3 or greater", size: 3, limit: "equalOrGreater", amount: 3, flatAmount: true },
							{ type: "Size", description: "No units may be Size 1", size: 2, limit: "equalOrGreater", amount: 1, flatAmount: false },
							{ type: "Armor", description: "All units must have an Armor value of 5 or greater", armor: 5, amount: 1, flatAmount: false },
							{
								type: "Damage",
								description: "At least 75% of units must have a Medium-range damage value of 3 or greater",
								range: "medium",
								damage: 3,
								limit: "equalOrGreater",
								amount: 0.75,
								flatAmount: false
							},
							{
								type: "Role",
								description: "At least 1 unit must have the Juggernaut role or at least 2 must have the Sniper role",
								roles: ["Juggernaut"],
								amount: 1,
								flatAmount: true,
								alternateRoles: ["Sniper"],
								alternateAmount: 2,
								alternateFlatAmount: true
							},
							{
								type: "Movement",
								description: 'All units must have a minimum ground-based Move of 10" or possess the ability to jump',
								speed: 10,
								jumpException: 0,
								amount: 1,
								flatAmount: false
							}
						],
						page: "AS:CE pg.118",
						bonus:
							"At the beginning of play, the Assault Lance's controlling player must choose either the Demoralizer or the Multi-Tasker SPAs (see pp . 93 and 98, respectively) . When each turn of game play begins, the player may designate up to half the units in the Assault Lance (rounded down) to receive the chosen ability for the duration of the turn . Destroyed or withdrawn units do not count towards the current number of units in the formation. In Addition, up to 2 units may also recieve the Stand Aside SPA per turn. These units need not be the same ones granted the Demoralizer or Multi-Tasker abilities",

						referencedSPAs: ["Demoralizer", "Multi-Tasker", "Stand Aside"]
					}
				]
			},
			{
				id: 7,
				name: "Striker/Cavalry",
				ideal: "Striker",
				requirements: [
					{
						type: "Movement",
						description: 'All units must have a minimum ground Movement of 10" or a minimum jump Movement of 8" ',
						speed: 10,
						jumpException: 8,
						amount: 1,
						flatAmount: false
					},
					{ type: "Size", description: "No units may be Size 4 or greater", size: 3, limit: "equalOrLess", amount: 1, flatAmount: false },
					{ type: "Role", description: "At least 50% of units must have the Striker or Skirmisher roles", roles: ["Striker", "Skirmisher"], amount: 0.5, flatAmount: false }
				],
				page: "AS:CE pg.118",
				bonus: "75 percent of the units in a standard Striker/Cavalry Lance (round normally) receive the Speed Demon Special Pilot Ability (see p . 99)",
				referencedSPAs: ["Speed Demon"],
				variations: [
					{
						id: 8,
						name: "Light Striker/Cavalry",
						requirements: [
							{
								type: "Movement",
								description: 'All units must have a minimum Movement of 10", with or without jumping capability ',
								speed: 10,
								jumpException: 10,
								amount: 1,
								flatAmount: false
							},
							{ type: "Size", description: "No units may be Size 3 or greater", size: 2, limit: "equalOrLess", amount: 1, flatAmount: false },
							{
								type: "Damage",
								description: "At least 2 units must have a Long-range damage value of 1 or greater",
								damage: 1,
								range: "long",
								limit: "equalOrGreater",
								amount: 2,
								flatAmount: true
							},
							{ type: "Role", description: "At least 2 units must have the Striker or Skirmisher roles", roles: ["Striker", "Skirmisher"], amount: 2, flatAmount: true }
						],
						page: "AS:CE pg.118",
						bonus: "75 percent of the units in a standard Striker/Cavalry Lance (round normally) receive the Speed Demon Special Pilot Ability (see p . 99)",
						referencedSPAs: ["Speed Demon"]
					},
					{
						id: 9,
						name: "Heavy Striker/Cavalry",
						requirements: [
							{
								type: "Movement",
								description: 'All units must have a minimum Movement of 8", with or without jumping capability ',
								speed: 8,
								jumpException: 8,
								amount: 1,
								flatAmount: false
							},
							{ type: "Size", description: "At least 3 units must be Size 3 or greater", size: 3, limit: "equalOrGreater", amount: 3, flatAmount: true },
							{ type: "Size", description: "No units may be Size 1", size: 2, limit: "equalOrGreater", amount: 1, flatAmount: false },
							{
								type: "Damage",
								description: "At least 1 unit must have a Long-range damage value of 2 or greater",
								damage: 2,
								range: "long",
								limit: "equalOrGreater",
								amount: 1,
								flatAmount: true
							},
							{ type: "Role", description: "At least 2 units must have the Striker or Skirmisher roles", roles: ["Striker", "Skirmisher"], amount: 2, flatAmount: true }
						],
						page: "AS:CE pg.118",
						bonus: "75 percent of the units in a standard Striker/Cavalry Lance (round normally) receive the Speed Demon Special Pilot Ability (see p . 99)",
						referencedSPAs: ["Speed Demon"]
					}
				]
			},

			{
				id: 10,
				name: "Fire",
				ideal: "Missile Boat",
				requirements: [
					{ type: "Role", description: "At least 75% of units must have the Missile Boat or Sniper roles", roles: ["Missile Boat", "Sniper"], amount: 0.75, flatAmount: false }
				],
				page: "AS:CE pg.119",
				bonus:
					"At the beginning of each turn, up to half the Fire Lance units (rounded down) may receive the Sniper Special Pilot Ability (see p . 99), which will affect their weapon attacks during that turn",

				referencedSPAs: ["Sniper"],
				variations: [
					{
						id: 11,
						name: "Fire Support",
						requirements: [
							{
								type: "Ability",
								description: "At least 3 units must possess the Indirect Fire (IF#) special ability",
								abilities: ["IF"],
								amount: 3,
								flatAmount: true
							}
						],
						page: "AS:CE pg.119",
						bonus:
							"At the beginning of each turn, up to half the Fire Support Lance units (rounded down) may receive the Oblique Attacker Special Pilot Ability (see p . 98), which will affect their weapon attacks during that turn",

						referencedSPAs: ["Oblique Attacker"]
					},
					{
						id: 12,
						name: "Artillery Fire",
						requirements: [
							{
								type: "Ability",
								description: "At least 2 units must possess an Artillery (ARTX-#) special ability",
								abilities: ["ART"],
								amount: 2,
								flatAmount: true
							}
						],
						page: "AS:CE pg.119",
						bonus:
							"At the beginning of each turn, up to half the Artillery Fire Lance units (rounded down) may receive the Oblique Artilleryman Special Pilot Ability (see p . 98), which will affect their weapon attacks during that turn",
						referencedSPAs: ["Oblique Artilleryman"]
					},
					{
						id: 13,
						name: "Direct Fire",
						requirements: [
							{ type: "Size", description: "At least 2 units must be Size 3 or greater", size: 3, limit: "equalOrGreater", amount: 2, flatAmount: true },
							{
								type: "Damage",
								description: "All units must have a Long-range damage value of 2 or greater",
								damage: 2,
								range: "long",
								limit: "equalOrGreater",
								amount: 1,
								flatAmount: false
							}
						],
						page: "AS:CE pg.119",
						bonus:
							"At the beginning of each turn, up to half the Direct Fire Lance units (rounded down) may receive the Weapon Specialist Special Pilot Ability (see p . 101), which will affect their weapon attacks during that turn",
						referencedSPAs: ["Weapon Specialist"]
					},
					{
						id: 14,
						name: "Anti-Air",
						requirements: [
							{
								type: "Role",
								description: "At least 75% of units must have the Missile Boat or Sniper roles",
								roles: ["Missile Boat", "Sniper"],
								amount: 0.75,
								flatAmount: false
							},
							{
								type: "Ability",
								description: "At least 2 units must possess the Flak (FLK), Autocannon (AC), or Artillery (ARTX-#) special abilities",
								abilities: ["ART", "FLK", "AC"],
								amount: 2,
								flatAmount: true
							}
						],
						page: "AS:CE pg.119",
						bonus:
							"At the beginning of each turn, up to half the Anti-Air Lance units (rounded down) may receive the effects of the Anti-Aircraft Specialists Special Command Ability (see p . 102), which will affect their weapon attacks during that turn",
						referencedSCAs: ["Anti-Aircraft Specialist"]
					},
					{
						id: 15,
						name: "Light Fire",
						requirements: [
							{ type: "Size", description: "No units may be Size 3 or greater", size: 2, limit: "equalOrLess", amount: 1, flatAmount: false },
							{
								type: "Role",
								description: "At least 50% of units must have the Missile Boat or Sniper roles",
								roles: ["Missile Boat", "Sniper"],
								amount: 0.5,
								flatAmount: false
							}
						],
						page: "FM:D pg.82",
						bonus:
							"Coordinated Fire Support - If a unit in this Formation hits a target with at least one of its weapons (at least one weapon attack), other units in this Formation making weapon attacks against the same target receive a -1 target number modifier to their attack rolls. This bonus is cumulative per attacking unit, up to a -3 target number modifier."
					}
				]
			},
			{
				id: 16,
				name: "Recon",
				ideal: "Scout",
				requirements: [
					{
						type: "Movement",
						description: 'All units must have a minimum Movement of 10"',
						speed: 10,
						jumpException: 10,
						amount: 1,
						flatAmount: false
					},
					{ type: "Role", description: "At least 2 units must have the Striker or Scout roles", roles: ["Striker", "Scout"], amount: 2, flatAmount: true }
				],
				page: "AS:CE pg.119",
				bonus:
					"At the beginning of play, the Recon Lance's controlling player must choose either the Eagle's Eyes, Forward Observer, or Maneuvering Ace SPAs (see pp . 95, 96, and 97, respectively) . Every unit in this Recon Lance receives the chosen SPA",
				referencedSPAs: ["Eagle's Eyes", "Forward Observer", "Maneuvering Ace"],
				variations: [
					{
						id: 17,
						name: "Light Recon",
						requirements: [
							{
								type: "Movement",
								description: 'All units must have a minimum Movement of 12"',
								speed: 12,
								jumpException: 12,
								amount: 1,
								flatAmount: false
							},
							{ type: "Role", description: "All units must have the Scout role", roles: ["Scout"], amount: 1, flatAmount: false }
						],
						page: "AS:CE pg.119",
						bonus:
							"At the beginning of play, each unit in the Recon Lance may receive either the Eagle's Eyes, Forward Observer, or Maneuvering Ace SPAs (see pp . 95, 96, and 97, respectively). Each unit may choose a different SPA",

						referencedSPAs: ["Eagle's Eyes", "Forward Observer", "Maneuvering Ace"]
					},
					{
						id: 18,
						name: "Heavy Recon",
						requirements: [
							{
								type: "Movement",
								description: 'All units must have a minimum Movement of 8"',
								speed: 8,
								jumpException: 8,
								amount: 1,
								flatAmount: false
							},
							{
								type: "Movement",
								description: 'At least 2 units must have a minimum Movement of 10"',
								speed: 10,
								jumpException: 10,
								amount: 1,
								flatAmount: false
							},
							{ type: "Size", description: "At least 1 unit must be Size 3 or greater", size: 3, limit: "equalOrGreater", amount: 1, flatAmount: true },
							{ type: "Role", description: "At least 2 units must have the Scout role", roles: ["Scout"], amount: 2, flatAmount: true }
						],
						page: "AS:CE pg.119",
						bonus:
							"At the beginning of play, the Recon Lance's controlling player must choose either the Eagle's Eyes, Forward Observer, or Maneuvering Ace SPAs (see pp . 95, 96, and 97, respectively) . Half the units (round up) in this Recon Lance receives the chosen SPA",
						referencedSPAs: ["Eagle's Eyes", "Forward Observer", "Maneuvering Ace"]
					}
				]
			},
			{
				id: 19,
				name: "Pursuit",
				ideal: "Skirmisher",
				requirements: [
					{ type: "Size", description: "All units must be Size 2 or less", size: 2, limit: "equalOrLess", amount: 1, flatAmount: false },
					{
						type: "Movement",
						description: '75% of units must have a minimum Movement of 12"',
						speed: 12,
						jumpException: 12,
						amount: 0.75,
						flatAmount: false
					},
					{
						type: "Damage",
						description: "At least 1 unit must have a Medium-range damage value of 2 or greater",
						damage: 2,
						range: "medium",
						limit: "equalOrGreater",
						amount: 1,
						flatAmount: true
					}
				],
				page: "AS:CE pg.120",
				bonus:
					"75 percent of the units in this formation receive the Blood Stalker Special Pilot Ability (see p . 93) . The Pursuit Lance may choose an enemy Formation rather than a single unit as the target for the Blood Stalker SPA . If this option is used, all members of the Pursuit Lance must choose the same enemy Formation for the Blood Stalker SPA granted by this ability, and the destruction of the chosen Formation is the only time the Pursuit Lance may change the target of the Blood Stalker SPA, by choosing a new enemy Formation",
				referencedSPAs: ["Blood Stalker"],
				variations: [
					{
						id: 20,
						name: "Probe",
						requirements: [
							{ type: "Size", description: "All units must be Size 3 or less", size: 3, limit: "equalOrLess", amount: 1, flatAmount: false },
							{
								type: "Movement",
								description: '75% of units must have a minimum Movement of 10"',
								speed: 10,
								jumpException: 10,
								amount: 0.75,
								flatAmount: false
							},
							{
								type: "Damage",
								description: "All units must have a Medium-range damage value of 2 or greater",
								damage: 2,
								limit: "equalOrGreater",
								range: "medium",
								amount: 1,
								flatAmount: false
							}
						],
						page: "AS:CE pg.120",
						bonus:
							"75 percent of the units in this formation receive the Blood Stalker Special Pilot Ability (see p . 93) . The Pursuit Lance may choose an enemy Formation rather than a single unit as the target for the Blood Stalker SPA . If this option is used, all members of the Pursuit Lance must choose the same enemy Formation for the Blood Stalker SPA granted by this ability, and the destruction of the chosen Formation is the only time the Pursuit Lance may change the target of the Blood Stalker SPA, by choosing a new enemy Formation",
						referencedSPAs: ["Blood Stalker"]
					},
					{
						id: 21,
						name: "Sweep",
						requirements: [
							{ type: "Size", description: "All units must be Size 2 or less", size: 2, limit: "equalOrLess", amount: 1, flatAmount: false },
							{
								type: "Movement",
								description: 'All units must have a minimum Movement of 10"',
								speed: 10,
								jumpException: 10,
								amount: 1,
								flatAmount: false
							},
							{
								type: "Damage",
								description: "All units must have a Short-range damage value of 2 or greater",
								damage: 2,
								limit: "equalOrGreater",
								range: "short",
								amount: 1,
								flatAmount: false
							}
						],
						page: "AS:CE pg.120",
						bonus:
							"75 percent of the units in this formation receive the Blood Stalker Special Pilot Ability (see p . 93) . The Pursuit Lance may choose an enemy Formation rather than a single unit as the target for the Blood Stalker SPA . If this option is used, all members of the Pursuit Lance must choose the same enemy Formation for the Blood Stalker SPA granted by this ability, and the destruction of the chosen Formation is the only time the Pursuit Lance may change the target of the Blood Stalker SPA, by choosing a new enemy Formation",

						referencedSPAs: ["Blood Stalker"]
					}
				]
			},
			{
				id: 22,
				name: "Command",
				requirements: [
					{ type: "Commander", description: "At least 1 unit must be designated as a force commander or key lieutenant" },
					{
						type: "Role",
						description: "At least 50% of units must have the Sniper, Missile Boat, Skirmisher, or Juggernaut roles",
						roles: ["Sniper", "Missile Boat", "Skirmisher", "Juggernaut"],
						amount: 0.5,
						flatAmount: false
					},
					{
						type: "Role",
						description: "At least 1 of unit must have the Brawler, Striker, or Scout",
						roles: ["Brawler", "Striker", "Scout"],
						amount: 1,
						flatAmount: true
					}
				],
				page: "AS:CE pg.120",
				bonus:
					"Prior to the beginning of play, half of the units in this formation (round up) receive one of the following Special Pilot Abilities for free (each unit may receive a different SPA): Antagonizer, Blood Stalker, Combat Intuition, Eagle’s Eyes, Marksman, or Multi-Tasker (see pp . 92, 93, 93, 95, 97, and 98, respectively) . In addition to this, the commander’s unit receives the Tactical Genius SPA (see p . 100) . If the Special Pilot Abilities rules are in full effect and the commander already has the Tactical Genius SPA, this ability adds a +1 modifier to the force’s Initiative roll results instead (including any rerolls made as a result of the Tactical Genius SPA)",

				referencedSPAs: ["Antagonizer", "Blood Stalker", "Combat Intuition", "Eagle's Eyes", "Marksman", "Multi-Tasker", "Tactical Genius"],
				variations: [
					{
						id: 23,
						name: "Vehicle Command",
						requirements: [
							{ type: "Commander", description: "At least 1 unit must be designated as a force commander or key lieutenant" },
							{
								type: "Role",
								description: "At least 1 pair of vehicles must have the Sniper, Missile Boat, Skirmisher, or Juggernaut roles",
								roles: ["Sniper", "Missile Boat", "Skirmisher", "Juggernaut"],
								amount: 2,
								flatAmount: true
							}
						],
						page: "AS:CE pg.120",
						bonus:
							"Prior to the beginning of play, half of the units in this formation (round up) receive one of the following Special Pilot Abilities for free (each unit may receive a different SPA): Antagonizer, Blood Stalker, Combat Intuition, Eagle’s Eyes, Marksman, or Multi-Tasker (see pp . 92, 93, 93, 95, 97, and 98, respectively) . In addition to this, the commander’s unit receives the Tactical Genius SPA (see p . 100) . If the Special Pilot Abilities rules are in full effect and the commander already has the Tactical Genius SPA, this ability adds a +1 modifier to the force’s Initiative roll results instead (including any rerolls made as a result of the Tactical Genius SPA)",
						referencedSPAs: ["Antagonizer", "Blood Stalker", "Combat Intuition", "Eagle's Eyes", "Marksman", "Multi-Tasker", "Tactical Genius"]
					}
				]
			},
			{
				id: 24,
				name: "Support",
				page: "AS:CE pg.121",
				secondary: true,
				bonus:
					"Before the start of play, each Support Lance must designate one other formation type in its army to support . Half of the units in the Support Lance (round down) receive the same SPAs as the supported formation . The Support Lance’s number of SPAs received of each type may not exceed the number the supported formation receives, as determined at start of play . If a bonus ability from the supported formation is assigned at the beginning of each turn, the Support Lance must assign them at start of play and may not switch them to another unit during game play . This bonus ability is retained as long as the Support Lance still has three or more active units on the field; they are not lost if the supported lance is reduced below its own ability to retain the bonus ability . If the Support Lance is supporting a Command Lance, it receives the two SPAs assigned to the Command Lance’s non-commander units, assigning one SPA each to any appropriate Support Lance unit . However, the Support Lance does not receive the commander’s Tactical Genius Special Pilot Ability ."
			},
			{
				id: 25,
				name: "Transport and Infantry",
				requirements: [
					{ type: "Types", description: "Formation can only include BA and CI", allowedTypes: ["BA", "CI"] },
					{
						type: "Transport",
						description: "The non-infantry units in this formation must be capable of transporting all infantry units in the formation simultaneously"
					}
				],
				page: "AS:CE pg.121",
				secondary: true,
				bonus:
					"Choose Either Mechanized or Nova: \nMechanized - Transport units of the Mechanized formation may dismount the infantry units during non-airborne ground movement . After dismounting, the transport may continue to use any remaining Move. \nNova - Mounted infantry of this formation may make weapon attacks. These mounted attacks use the attacker movement modifier of the transport and have an additional +2 Target Number modifier for being mounted ."
			},
			{
				id: 26,
				name: "Air Lance",
				minimumUnits: 2,
				maximumUnits: 2,
				requirements: [
					{ type: "Types", description: "Formation can only include Aerospace and Conventional Fighters", allowedTypes: ["AF", "CF"] },
					{ type: "AerospacePair", description: "Fighters must be identical units" }
				],
				page: "AS:CE pg.121",
				secondary: true,
				bonus: "No additional bonus ability is granted by this formation"
			},
			{
				id: 27,
				name: "Hunter",
				requirements: [
					{
						type: "Role",
						description: "At least 50% of the formation must have the Ambusher or Juggernaut roles",
						roles: ["Ambusher", "Juggernaut"],
						amount: 0.5,
						flatAmount: false
					}
				],
				page: "FM:D pg.82",
				bonus: "At the beginning of each turn, 50 percent of the units in the Formation may be granted the Combat Intuition Special Pilot Ability",
				referencedSPAs: ["Combat Intuition"]
			},
			{
				id: 28,
				name: "Horde",
				minimumUnits: 5,
				maximumUnits: 10,
				requirements: [
					{ type: "Size", description: "All units must be Size 1", size: 1, limit: "equal", amount: 1, flatAmount: false },
					{
						type: "Damage",
						description: "No unit may have a Damage value at any range greater than 2",
						damage: 2,
						limit: "equalOrLess",
						range: "all",
						amount: 1,
						flatAmount: false
					}
				],
				page: "FM:K pg.87",
				bonus:
					"Swarm - When any Unit in this Formation is targeted, the targeted Unit’s player may switch the target to any other Unit in this Formation that is a legal target (within line of sight) and at the same range (or less) from the attacker"
			},
			{
				id: 29,
				name: "Berserker (Close Combat)",
				requirements: [
					{ type: "Size", description: "50% of the Battle Formation must be Size 3 or higher", size: 3, limit: "equalOrGreater", amount: 0.5, flatAmount: false },
					{
						type: "Role",
						description: "At least 3 units must be any combination of the Brawler, Sniper and/or Skirmisher roles",
						roles: ["Brawler", "Sniper", "Skirmisher"],
						amount: 3,
						flatAmount: true
					}
				],
				page: "FM:K pg.87",
				bonus: "At the beginning of play, two units receive the Zweihander or Swordsman Special Pilot Ability; the same ability must be assigned to both Units.",
				referencedSPAs: ["Zweihander", "Swordsman"]
			},
			{
				id: 30,
				name: "Anti-'Mech",
				requirements: [{ type: "Types", description: "All units must be infantry", allowedTypes: ["BA", "CI"] }],
				page: "FM:K pg.87",
				bonus: "Enemy Units in base-to-base contact with an Anti-‘Mech Lance suffer a -1 To-Hit Modifier penalty to any weapon attacks made by that enemy Unit"
			}
		]
	},
	{
		type: "Air Formations",
		formations: [
			{
				id: 31,
				name: "Interceptor Squadron",
				requirements: [{ type: "Role", description: "At least 50% of the formation must have the Interceptor role", roles: ["Interceptor"], amount: 0.5, flatAmount: false }],
				page: "AS:CE pg.122",
				bonus:
					"Any units in an Interceptor Squadron with a Move (Thrust) of 9 or less receive the Speed Demon SPA (see p . 99). In addition to this, up to 2 fighters in this squadron may receive the Range Master (Long) SPA as well",
				referencedSPAs: ["Speed Demon", "Range Master (Long)"]
			},
			{
				id: 32,
				name: "Aerospace Superiority Squadron",
				requirements: [
					{
						type: "Role",
						description: "At least 50% of the formation must have the Interceptor or Fast Dogfighter role",
						roles: ["Interceptor", "Fast Dogfighter"],
						amount: 0.5,
						flatAmount: false
					}
				],
				page: "AS:CE pg.122",
				bonus:
					"Prior to the start of the scenario, select up to 50 percent of the units in the Aerospace Superiority Squadron and assign up to 2 of the following SPAs to those fighters (in any combination): Blood Stalker (see p . 93), Ride the Wash (see p . 98), Hot Dog (see p . 97) .",
				referencedSPAs: ["Blood Stalker", "Ride the Wash", "Hot Dog"]
			},
			{
				id: 33,
				name: "Fire Support Squadron",
				requirements: [
					{
						type: "Role",
						description: "At least 50% of the formation must have the Fire Support role",
						roles: ["Fire Support"],
						amount: 0.5,
						flatAmount: false
					},
					{
						type: "Role",
						description: "All units must have the Fire Support or Dogfighter role",
						roles: ["Fire Support", "Dogfighter"],
						amount: 1,
						flatAmount: false
					}
				],
				bonus:
					"Prior to the start of the scenario, choose 2 pairs of fighters in the Fire Support Squadron and assign one of the following SPAs each to each pair: Golden Goose (see p . 96), Ground Hugger (see p . 96), Hot Dog (see p . 97), or Shaky Stick (see p . 99) . The two selected fighter pairs may not receive the same SPA ",
				page: "AS:CE pg.122",
				referencedSPAs: ["Golden Goose", "Ground-Hugger", "Hot Dog", "Shaky Stick"]
			},
			{
				id: 34,
				name: "Strike Squadron",
				requirements: [
					{
						type: "Role",
						description: "At least 50% of the formation must have the Attack or Dogfighter role",
						roles: ["Attack", "Dogfighter"],
						amount: 0.5,
						flatAmount: false
					}
				],
				page: "AS:CE pg.122",
				bonus: "Up to 50 percent of the units in this formation may receive the Speed Demon SPA (see p . 99) . The remaining fighters receive the Golden Goose SPA (see p . 96)",
				referencedSPAs: ["Speed Demon", "Golden Goose"]
			},
			{
				id: 35,
				name: "Electronic Warfare Squadron",
				requirements: [
					{
						type: "Ability",
						description: "At least 50% of the formation must have on or more of the PRB, AECM , BH, ECM, LPRB, LECM, LTAG, TAG, or WAT special abilities",
						abilities: ["PRB", "AECM", "BH", "ECM", "LPRB", "LECM", "LTAG", "TAG", "WAT"],
						amount: 0.5,
						flatAmount: false
					}
				],
				page: "AS:CE pg.122",
				bonus:
					"This squadron type receives the Communications Disruption Special Command Ability (see p . 103). If the full Special Command Abilities rules are in use and the EW Squadron is part of a force that already has the Communications Disruption SCA, the EW Squadron gain the ability to decide which enemy lance or squadron is affected by the disruption, rather than resolving its victim randomly",
				referencedSCAs: ["Communications Disruption"]
			},
			{
				id: 36,
				name: "Transport Squadron",
				requirements: [
					{
						type: "Role",
						description: "At least 50% of the formation must have the Transport role",
						roles: ["Transport"],
						amount: 0.5,
						flatAmount: false
					}
				],
				page: "AS:CE pg.123",
				bonus:
					"Choose one of the following SPAs and apply it to all of the units in this squadron that are of the Transport unit role: Dust-Off (see p . 95), Ride the Wash (see p . 98), or Wind Walker (see p . 101)",
				referencedSPAs: ["Dust-Off", "Ride the Wash", "Wind Walker"]
			}
		]
	},
	{
		type: "Faction Specific Formations",
		formations: [
			{
				id: 37,
				name: "Rifle (House Davion)",
				requirements: [
					{ type: "Faction", description: "Unique to House Davion", allowedFactions: 29 },
					{ type: "Size", description: "At least 75% of units must be of Size 2 or 3", size: 3, limit: "equalOrLess", amount: 0.75, flatAmount: false },
					{ type: "Size", description: "No unit may be Size 1", size: 2, limit: "equalOrGreater", amount: 1, flatAmount: false },
					{
						type: "Ability",
						description: "At least 50% of units must possess the Autocannon (AC) or Flak (FLK) specials",
						abilities: ["AC", "FLK"],
						amount: 0.5,
						flatAmount: false
					},
					{ type: "Movement", description: 'All units must have a ground-movement speed of at least 8"', speed: 8, amount: 1, flatAmount: false }
				],
				page: "FM:D pg.82",
				bonus:
					"At the beginning of each turn, up to two Rifle Lance units may receive either the Weapon Specialist or Sandblaster Special Pilot Ability. The player may assign the same SPA to both units, or one unit may receive Weapon Specialist and the other unit Sandblaster.",
				referencedSPAs: ["Weapon Specialist", "Sandblaster"]
			},
			{
				id: 38,
				name: "Order (House Kurita)",
				requirements: [
					{ type: "Faction", description: "Unique to House Kurita", allowedFactions: 27 },
					{
						type: "SameModel",
						description: "All Units must be the same size and model"
					}
				],
				page: "FM:K pg.87",
				bonus:
					"Designate one Unit as the command Unit of the Formation; it receives the Tactical Genius, Antagonizer or Sniper SPA. All Units in the Formation receive the Iron Will or Speed Demon SPA; the SPA chosen applies to all Units in the Formation",
				referencedSPAs: ["Tactical Genius", "Antagonizer", "Sniper", "Iron Will", "Speed Demon"]
			}
		]
	}
];
