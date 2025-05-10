import fs from "fs/promises";

export async function load() {
	let response = await fs.readFile("./files/changelog.json");
	let changelogData = JSON.parse(response.toString());
	return {
		changelogData
	};
}
