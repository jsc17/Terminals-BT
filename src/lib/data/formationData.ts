import { type FormationData } from "$lib/types/formationData";

export const formationDataList: { type: string; formations: FormationData[] }[] = [
	{
		type: "",
		formations: [
			{
				id: 0,
				name: "Combat Group",
				page: "N/A",
				minimumUnits: 0,
				bonuses: [{ type: "Unique", description: "No bonus abilities. Just used for force organization." }]
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
				bonuses: [
					{
						type: "FormationWide",
						abilityType: "SPA",
						grantedAbility: ["Lucky"],
						uses: { plus: 2 }
					}
				],
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
						bonuses: [
							{
								type: "FormationWide",
								abilityType: "SPA",
								grantedAbility: ["Lucky"],
								uses: { plus: 2 }
							}
						],
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
						bonuses: [
							{
								type: "FormationWide",
								abilityType: "SPA",
								grantedAbility: ["Lucky"],
								uses: { plus: 2 }
							}
						],
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
						bonuses: [
							{
								type: "FormationWide",
								abilityType: "SPA",
								grantedAbility: ["Lucky"],
								uses: { plus: 2 }
							}
						],
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
				bonuses: [
					{
						type: "Assigned",
						abilityType: "SPA",
						grantedAbility: ["Demoralizer", "Multi-Tasker"],
						sameAbility: true,
						assignedNumber: { portion: 0.5 },
						assignmentTiming: "turnStart"
					}
				],
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
						bonuses: [
							{
								type: "Assigned",
								abilityType: "SPA",
								grantedAbility: ["Demoralizer", "Multi-Tasker"],
								sameAbility: true,
								assignedNumber: { portion: 0.5 },
								assignmentTiming: "turnStart"
							},
							{
								type: "Assigned",
								abilityType: "SPA",
								grantedAbility: ["Stand Aside"],
								sameAbility: true,
								assignedNumber: { flat: 2 },
								assignmentTiming: "turnStart"
							}
						],

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
				bonuses: [{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Speed Demon"], assignedNumber: { portion: 0.75 }, assignmentTiming: "playStart" }],
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
						bonuses: [{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Speed Demon"], assignedNumber: { portion: 0.75 }, assignmentTiming: "playStart" }],
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
						bonuses: [{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Speed Demon"], assignedNumber: { portion: 0.75 }, assignmentTiming: "playStart" }],
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
				bonuses: [{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Sniper"], assignedNumber: { portion: 0.5 }, assignmentTiming: "turnStart" }],
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
						bonuses: [{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Oblique Attacker"], assignedNumber: { portion: 0.5 }, assignmentTiming: "turnStart" }],
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
						bonuses: [{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Oblique Artilleryman"], assignedNumber: { portion: 0.5 }, assignmentTiming: "turnStart" }],
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
						bonuses: [{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Weapon Specialist"], assignedNumber: { portion: 0.5 }, assignmentTiming: "turnStart" }],
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
						bonuses: [{ type: "Assigned", abilityType: "SCA", grantedAbility: ["Anti-Aircraft Specialist SCA"], assignedNumber: { portion: 0.5 }, assignmentTiming: "turnStart" }],
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
						bonuses: [
							{
								type: "FormationWide",
								abilityType: "Unique",
								grantedAbility: ["Coordinated Fire Support (FM:D pg.82)"]
							}
						]
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
				bonuses: [
					{
						type: "Assigned",
						abilityType: "SPA",
						grantedAbility: ["Eagle's Eyes", "Forward Observer", "Maneuvering Ace"],
						assignedNumber: { portion: 1 },
						assignmentTiming: "playStart",
						sameAbility: true
					}
				],
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
						bonuses: [
							{
								type: "Assigned",
								abilityType: "SPA",
								grantedAbility: ["Eagle's Eyes", "Forward Observer", "Maneuvering Ace"],
								assignedNumber: { portion: 1 },
								assignmentTiming: "playStart",
								sameAbility: false
							}
						],
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
						bonuses: [
							{
								type: "Assigned",
								abilityType: "SPA",
								grantedAbility: ["Eagle's Eyes", "Forward Observer", "Maneuvering Ace"],
								assignedNumber: { portion: 0.5 },
								assignmentTiming: "playStart",
								sameAbility: true
							}
						],
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
				bonuses: [
					{
						type: "Assigned",
						abilityType: "SPA",
						grantedAbility: ["Blood Stalker"],
						assignedNumber: { portion: 0.75 },
						assignmentTiming: "playStart"
					}
				],
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
						bonuses: [
							{
								type: "Assigned",
								abilityType: "SPA",
								grantedAbility: ["Blood Stalker"],
								assignedNumber: { portion: 0.75 },
								assignmentTiming: "playStart"
							}
						],
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
						bonuses: [
							{
								type: "Assigned",
								abilityType: "SPA",
								grantedAbility: ["Blood Stalker"],
								assignedNumber: { portion: 0.75 },
								assignmentTiming: "playStart"
							}
						],
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
				bonuses: [
					{
						type: "Assigned",
						abilityType: "SPA",
						grantedAbility: ["Antagonizer", "Blood Stalker", "Combat Intuition", "Eagle's Eyes", "Marksman", "Multi-Tasker"],
						assignedNumber: { portion: 0.5 },
						assignmentTiming: "playStart"
					},
					{
						type: "Assigned",
						abilityType: "SPA",
						grantedAbility: ["Tactical Genius"],
						assignedNumber: { flat: 1 },
						assignmentTiming: "playStart"
					}
				],
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
						bonuses: [
							{
								type: "Assigned",
								abilityType: "SPA",
								grantedAbility: ["Antagonizer", "Blood Stalker", "Combat Intuition", "Eagle's Eyes", "Marksman", "Multi-Tasker"],
								assignedNumber: { portion: 0.5 },
								assignmentTiming: "playStart"
							},
							{
								type: "Assigned",
								abilityType: "SPA",
								grantedAbility: ["Tactical Genius"],
								assignedNumber: { flat: 1 },
								assignmentTiming: "playStart"
							}
						],
						referencedSPAs: ["Antagonizer", "Blood Stalker", "Combat Intuition", "Eagle's Eyes", "Marksman", "Multi-Tasker", "Tactical Genius"]
					}
				]
			},
			{
				id: 24,
				name: "Support",
				page: "AS:CE pg.121",
				secondary: true,
				bonuses: [
					{
						type: "Unique",
						description:
							"Before the start of play, each Support Lance must designate one other formation type in its army to support . Half of the units in the Support Lance (round down) receive the same SPAs as the supported formation . The Support Lance’s number of SPAs received of each type may not exceed the number the supported formation receives, as determined at start of play . If a bonus ability from the supported formation is assigned at the beginning of each turn, the Support Lance must assign them at start of play and may not switch them to another unit during game play . This bonus ability is retained as long as the Support Lance still has three or more active units on the field; they are not lost if the supported lance is reduced below its own ability to retain the bonus ability . If the Support Lance is supporting a Command Lance, it receives the two SPAs assigned to the Command Lance’s non-commander units, assigning one SPA each to any appropriate Support Lance unit . However, the Support Lance does not receive the commander’s Tactical Genius Special Pilot Ability ."
					}
				]
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
				bonuses: [{ type: "FormationWide", abilityType: "Unique", grantedAbility: ["Mechanized", "Nova"] }]
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
				bonuses: [{ type: "Unique", description: "No additional bonus ability is granted by this formation" }]
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
				bonuses: [{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Combat Intuition"], assignedNumber: { portion: 0.5 }, assignmentTiming: "turnStart" }],
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
				bonuses: [
					{
						type: "FormationWide",
						abilityType: "Unique",
						grantedAbility: ["Swarm (FM:K pg.87)"]
					}
				]
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
				bonuses: [
					{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Zweihander", "Swordsman"], assignedNumber: { flat: 2 }, assignmentTiming: "playStart", sameAbility: true }
				],
				referencedSPAs: ["Zweihander", "Swordsman"]
			},
			{
				id: 30,
				name: "Anti-'Mech",
				requirements: [{ type: "Types", description: "All units must be infantry", allowedTypes: ["BA", "CI"] }],
				page: "FM:K pg.87",
				bonuses: [
					{
						type: "Unique",
						description: "Enemy Units in base-to-base contact with an Anti-'Mech Lance suffer a -1 To-Hit Modifier penalty to any weapon attacks made by that enemy Unit"
					}
				]
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
				bonuses: [
					{
						type: "Unique",
						description: "Any units in an Interceptor Squadron with a Move (Thrust) of 9 or less receive the Speed Demon SPA (see p.99)"
					},
					{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Range Master (Long)"], assignedNumber: { flat: 2 }, assignmentTiming: "playStart" }
				],
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
				bonuses: [
					{
						type: "Unique",
						description:
							"Prior to the start of the scenario, select up to 50 percent of the units in the Aerospace Superiority Squadron and assign up to 2 of the following SPAs to those fighters (in any combination): Blood Stalker (see p . 93), Ride the Wash (see p . 98), Hot Dog (see p . 97) ."
					},
					{
						type: "Assigned",
						abilityType: "SPA",
						grantedAbility: ["Blood Stalker", "Ride the Wash", "Hot Dog"],
						assignedNumber: { portion: 0.5 },
						assignmentTiming: "playStart",
						sameAbility: false
					}
				],
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
				page: "AS:CE pg.122",

				bonuses: [
					{
						type: "Assigned",
						abilityType: "SPA",
						grantedAbility: ["Golden Goose", "Ground-Hugger", "Hot Dog", "Shaky Stick"],
						assignedNumber: { flat: 2 },
						assignmentTiming: "playStart"
					},
					{
						type: "Assigned",
						abilityType: "SPA",
						grantedAbility: ["Golden Goose", "Ground-Hugger", "Hot Dog", "Shaky Stick"],
						assignedNumber: { flat: 2 },
						assignmentTiming: "playStart"
					}
				],
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
				bonuses: [
					{
						type: "Unique",
						description:
							"Up to 50 percent of the units in this formation may receive the Speed Demon SPA (see p . 99) . The remaining fighters receive the Golden Goose SPA (see p . 96)"
					},
					{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Speed Demon"], assignedNumber: { portion: 0.5 }, assignmentTiming: "playStart" },
					{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Golden Goose"], assignedNumber: { portion: 0.5 }, assignmentTiming: "playStart" }
				],
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
				bonuses: [
					{
						type: "FormationWide",
						abilityType: "SCA",
						grantedAbility: ["Communications Disruption (SCA)"]
					}
				],
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
				bonuses: [
					{
						type: "Unique",
						description:
							"Choose one of the following SPAs and apply it to all of the units in this squadron that are of the Transport unit role: Dust-Off (see p . 95), Ride the Wash (see p . 98), or Wind Walker (see p . 101)"
					},
					{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Dust-Off", "Ride the Wash", "Wind Walker"], assignedNumber: { portion: 1 }, assignmentTiming: "playStart" }
				],
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
				bonuses: [
					{
						type: "Assigned",
						abilityType: "SPA",
						grantedAbility: ["Weapon Specialist", "Sandblaster"],
						assignedNumber: { flat: 2 },
						assignmentTiming: "turnStart",
						sameAbility: false
					}
				],
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
				bonuses: [
					{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Tactical Genius", "Antagonizer", "Sniper"], assignedNumber: { flat: 1 }, assignmentTiming: "playStart" },
					{ type: "Assigned", abilityType: "SPA", grantedAbility: ["Iron Will", "Speed Demon"], assignedNumber: { portion: 1 }, assignmentTiming: "playStart", sameAbility: true }
				],
				referencedSPAs: ["Tactical Genius", "Antagonizer", "Sniper", "Iron Will", "Speed Demon"]
			}
		]
	}
];
