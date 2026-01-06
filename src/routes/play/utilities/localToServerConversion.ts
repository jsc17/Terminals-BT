import { db } from "$lib/offline/db";
import { type ConvertMatchInput } from "../schema/matchlistSchema";
import { convertLocalMatchToServer } from "../remote/matchlist.remote";

export async function convertLocalMatchesToServerMatches() {
	const localMatches = await db.localMatches.toArray();

	if (!localMatches.length) return;

	await Promise.all(
		localMatches.map(async (match) => {
			const matchData: ConvertMatchInput = {
				name: match.name,
				formations: match.formations.map((f) => {
					return { ...f, secondary: f.secondary?.type == undefined || f.secondary.units.length == 0 ? undefined : f.secondary };
				}),
				units: match.units
			};
			convertLocalMatchToServer(matchData);
		})
	);
	console.log("All Matches Processed");
}
