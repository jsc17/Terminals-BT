import fs from "fs/promises";

export function isJson(input: string): boolean {
	try {
		JSON.parse(input);
	} catch (error) {
		return false;
	}
	return true;
}

export function writeJsonToFile(data: string) {
	const filename = `files/json/${crypto.randomUUID()}.json`;
	fs.writeFile(filename, data);
}
const romanMatrix = new Map([
	[1000, "M"],
	[900, "CM"],
	[500, "D"],
	[400, "CD"],
	[100, "C"],
	[90, "XC"],
	[50, "L"],
	[40, "XL"],
	[10, "X"],
	[9, "IX"],
	[5, "V"],
	[4, "IV"],
	[1, "I"]
]);

export function numberToRomanNumeral(num: number) {
	if (num === 0) {
		return "";
	}
	let romanNumeral = "";

	for (const [key, value] of romanMatrix.entries()) {
		const amount = Math.floor(num / key);
		num -= amount * key;
		romanNumeral += value.repeat(amount);
	}
	return romanNumeral;
}
