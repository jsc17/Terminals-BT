export async function load({ fetch }) {
	let response = await fetch("/changelog.json");
	let changelogData = await response.json();
	return {
		changelogData
	};
}
