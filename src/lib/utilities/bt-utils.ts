import { deserialize } from "$app/forms";
import data from "$lib/data/erasFactionsList.json";

export function getNewSkillCost(newSkill: number, basePV: number) {
	let newCost = 0;
	let step = 0;

	if (newSkill == 4) {
		newCost = basePV;
	} else if (newSkill > 4) {
		if (basePV <= 14) {
			step = 1;
		} else {
			step = Math.ceil((basePV - 14) / 10) + 1;
		}
		newCost = basePV - (newSkill - 4) * step;
	} else {
		if (basePV <= 7) {
			step = 1;
		} else {
			step = Math.ceil((basePV - 7) / 5) + 1;
		}
		newCost = basePV + (4 - newSkill) * step;
	}
	return newCost;
}

export function calculateTMM(speed: number) {
	let tmm = 0;
	if (speed <= 4) {
		tmm = 0;
	} else if (speed <= 8) {
		tmm = 1;
	} else if (speed <= 12) {
		tmm = 2;
	} else if (speed <= 18) {
		tmm = 3;
	} else if (speed <= 34) {
		tmm = 4;
	} else if (speed >= 35) {
		tmm = 5;
	}
	return tmm;
}

export async function getMULResults(era?: number, faction?: number, general?: number) {
	let cachedResponse: any;
	if (era != undefined && faction != undefined) {
		cachedResponse = deserialize(await (await fetch("/?/search", { method: "POST", body: JSON.stringify({ era: era, faction: faction }) })).text());
	}
	if (cachedResponse.data.found && !cachedResponse.data.refresh) {
		return cachedResponse.data.results.Units;
	} else {
		try {
			let link = `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=1&MaxPV=100`;
			if (general != undefined && general != -1) {
				link += `&Factions=${general}`;
			}
			if (faction != undefined) {
				link += `&Factions=${faction}`;
			}
			if (era != undefined) {
				link += `&AvailableEras=${era}`;
			}
			let response = await fetch(link);
			if (response.ok) {
				let resultJSON = await response.json();
				let unitList = resultJSON.Units;

				fetch("/?/cache", { method: "POST", body: JSON.stringify({ era: era, faction: faction, units: resultJSON }) });
				return unitList;
			} else if (response.status == 500) {
				let link1 = `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=1&MaxPV=45`;
				let link2 = `https://masterunitlist.azurewebsites.net/Unit/quicklist?&MinPV=46&MaxPV=100`;
				if (general != undefined && general != -1) {
					link1 += `&Factions=${general}`;
					link2 += `&Factions=${general}`;
				}
				if (faction != undefined) {
					link1 += `&Factions=${faction}`;
					link2 += `&Factions=${faction}`;
				}
				if (era != undefined) {
					link1 += `&AvailableEras=${era}`;
					link2 += `&AvailableEras=${era}`;
				}
				let [response1, response2] = await Promise.all([fetch(link1), fetch(link2)]);

				if (response1.status == 200 && response2.status == 200) {
					let [result1, result2] = await Promise.all([response1.json(), response2.json()]);
					let combinedResults = { Units: [], Search: result1.Search, Crumbs: result1.Crumbs };
					combinedResults.Units = result1.Units.concat(result2.Units);
					fetch("/?/cache", { method: "POST", body: JSON.stringify({ era: era, faction: faction, units: JSON.stringify(combinedResults) }) });
					return combinedResults.Units;
				}
			} else {
				throw "Incorrect response from MUL";
			}
		} catch (error) {
			console.log("Error Retrieving data from MUL. Using cached data");
			return cachedResponse.data.results.Units;
		}
	}
}

export function getGeneralList(selectedEra: number, selectedFaction: number) {
	let result = -1;
	data.forEach((era) => {
		if (era.id == selectedEra) {
			era.factions.forEach((faction) => {
				// @ts-ignore
				if (faction[1].includes(selectedFaction)) {
					//@ts-ignore
					result = faction[0];
				}
			});
		}
	});
	return result;
}
