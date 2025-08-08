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
