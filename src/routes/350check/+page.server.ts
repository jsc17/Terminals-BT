//@ts-nocheck
import { getDocument } from "pdfjs-dist";
import { ValidationList, unitTypes } from "$lib/types/ValidationList";
import { createConnection } from "mysql2";
import { DB_USER, DB_PASSWORD } from "$env/static/private";

export const load = async ({ url }) => {
	const id = url.searchParams.get("id");

	if (!id) {
		return { tournament: false };
	}
};

export const actions = {
	validate: async ({ request }) => {
		let valid: ValidationList = {
			pv: [false, 0],
			unitsUnavailable: [false, []],
			unitNumber: [false, 0],
			mechNumber: [false, 0],
			cvNumber: [false, 0],
			infNumber: [false, 0],
			proto: [false, 0],
			unallowedType: [false, []],
			dro: [false, []],
			experimental: [false, []],
			unknown: [false, []],
			unique: [false, []],
			trailer: [false, [], []],
			skillThreshold: [false, []],
			skillCombo: [false, [], 0],
			chassis: [false, []],
			variant: [false, []],
			jmps: [false, [], 0]
		};
		let tallies = { chassis: [], variants: [] };
		const data = await request.formData();

		let resultList = JSON.parse(data.get("unitList")).Units;
		let uniqueList = JSON.parse(data.get("uniqueList")).Units;

		const pdf = data.get("pdf");
		const loadedpdf = await getDocument(await pdf.arrayBuffer()).promise;
		const page = await loadedpdf.getPage(1);
		let textContent = await page.getTextContent();

		let textArray = [];
		textContent.items.slice(12, -7).forEach((item) => {
			if (item.str != " ") {
				textArray.push(item.str);
			}
		});
		let unitArray = [];
		for (let index = 0; index < textArray.length; index = index + 5) {
			let name = textArray[index];
			if (!unitTypes.includes(textArray[index + 1])) {
				name += " " + textArray[index + 1];
				index++;
			}
			unitArray.push([name, textArray[index + 2]]);
		}
		unitArray.forEach((unit) => {
			let index = resultList.findIndex((result) => {
				return result.Name.trim() == unit[0];
			});
			if (index == -1) {
				valid.unitsUnavailable[1].push(unit[0]);
			} else {
				validateUnit(unit, resultList[index], valid, tallies);
			}
			let uniqueIndex = uniqueList.findIndex((result) => {
				return result.Name.trim() == unit[0];
			});
			if (uniqueIndex != -1) {
				valid.unique[1].push(unit[0]);
			}
		});

		valid.pv[1] = parseInt(textContent.items[textContent.items.length - 3].str);
		valid.pv[0] = valid.pv[1] <= 350;
		valid.unitNumber[1] = unitArray.length;
		valid.unitNumber[0] = valid.unitNumber[1] <= 16;

		validateList(tallies, valid);

		return { success: true, unitArray, valid };
	},

	newTournament: async ({ request }) => {
		const formData = await request.formData();
		const organizerName = formData.get("organizerName");
		const tournamentName = formData.get("tournamentName");
		const emailAddress = formData.get("emailAddress");
		const tournamentEra = formData.get("tournamentEra");
		const tournamentDate = formData.get("tournamentDate");

		let conn = createConnection({
			host: "localhost",
			user: DB_USER,
			password: DB_PASSWORD,
			database: "battletech"
		});

		conn.connect((err) => {
			if (err) return console.error(err.message);
			console.log("Connected!");
			let sql = `INSERT INTO tournaments(name, organizer, organizer_email, era, date) VALUES('${tournamentName}', '${organizerName}','${emailAddress}',${tournamentEra}, '${tournamentDate}')`;

			conn.query(sql);

			conn.end();
		});
	}
};

function validateUnit(unit, result, valid, tallies) {
	switch (result.BFType) {
		case "BM":
		case "IM":
			valid.mechNumber[1]++;
			break;
		case "PM":
			valid.proto[1]++;
			break;
		case "CV":
			valid.cvNumber[1]++;
			break;
		case "CI":
		case "BA":
			valid.infNumber[1]++;
			break;
		case "BS":
			break;
		default:
			valid.unallowedType[1].push(unit[0]);
	}

	if (unit[1] > 6 && unit[1] < 2) {
		valid.skillThreshold[1].push(unit[0]);
	}
	if (unit[1] == 6 || unit[1] == 2) {
		valid.skillCombo[2]++;
		valid.skillCombo[1].push(unit[0]);
	}
	if (result.BFAbilities != null) {
		if (result.BFAbilities.includes("DRO")) {
			valid.dro[1].push(unit[0]);
		}
		if (result.BFAbilities.includes("HTC")) {
			if (result.BFMove.slice(0, 2) == '0"') {
				valid.trailer[1].push(unit[0]);
			} else {
				valid.trailer[2].push(unit[0]);
			}
		}
		let jmps = result.BFAbilities.match(/JMPS[1-9]/g);
		if (jmps != null) {
			valid.jmps[2] += parseInt(jmps[0].charAt(4));
			valid.jmps[1].push(unit[0]);
		}
	}
	if (result.Rules == "Experimental") {
		valid.experimental[1].push(unit[0]);
	}
	if (result.Rules == "Unknown") {
		valid.unknown[1].push(unit[0]);
	}

	if (result.BFType == "BM") {
		tallies.variants.push(unit[0]);
	}
	tallies.chassis.push(result.Class);
}

function validateList(tallies, valid) {
	valid.mechNumber[0] = valid.mechNumber[1] <= 12;
	valid.cvNumber[0] = valid.cvNumber[1] <= 8;
	valid.infNumber[0] = valid.infNumber[1] <= 5;
	valid.proto[0] = valid.proto[1] == 0 || valid.proto[1] == 5;
	valid.unitsUnavailable[0] = valid.unitsUnavailable[1].length == 0;
	valid.unallowedType[0] = valid.unallowedType[1].length == 0;
	valid.skillThreshold[0] = valid.skillThreshold[1].length == 0;
	valid.skillCombo[0] = valid.skillCombo[2] <= 2;
	valid.jmps[0] = valid.jmps[2] <= 2;
	valid.dro[0] = valid.dro[1].length == 0;
	valid.experimental[0] = valid.experimental[1].length == 0;
	valid.unknown[0] = valid.unknown[1].length == 0;
	valid.unique[0] = valid.unique[1].length == 0;
	valid.trailer[0] = valid.trailer[1].length <= valid.trailer[2].length;

	let dupVariants = {};
	tallies.variants.forEach((unit) => {
		if (Object.hasOwn(dupVariants, unit)) {
			dupVariants[unit]++;
		} else {
			dupVariants[unit] = 1;
		}
	});
	valid.variant[0] = true;
	for (const [key, value] of Object.entries(dupVariants)) {
		if (value >= 2) {
			valid.variant[1].push(key);
			valid.variant[0] = false;
		}
	}
	let dupChassis = {};
	tallies.chassis.forEach((unit) => {
		if (Object.hasOwn(dupChassis, unit)) {
			dupChassis[unit]++;
		} else {
			dupChassis[unit] = 1;
		}
	});
	valid.chassis[0] = true;
	for (const [key, value] of Object.entries(dupChassis)) {
		if (value >= 3) {
			valid.chassis[1].push(key);
			valid.chassis[0] = false;
		}
	}
}
