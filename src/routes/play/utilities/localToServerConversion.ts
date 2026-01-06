import { db } from "$lib/offline/db";
import { type ConvertMatchInput } from "../schema/matchlistSchema";
import { convertLocalMatchToServer } from "../remote/matchlist.remote";
import { toastController } from "$lib/stores";

export async function convertLocalMatchesToServerMatches() {
	const localMatches = await db.localMatches.toArray();

	if (!localMatches.length) return;

	toastController.addToast("Converting local matches to new format. Please wait one moment for matches to appear");
	await Promise.all(
		localMatches.map(async (match) => {
			const matchData: ConvertMatchInput = {
				name: match.name,
				formations: match.formations.map((f) => {
					return { ...f, secondary: f.secondary?.type == undefined || f.secondary.units.length == 0 ? undefined : f.secondary };
				}),
				units: match.units.map((u) => ({ ...u, mulId: Number(u.mulId) }))
			};
			convertLocalMatchToServer(matchData);
		})
	);
	toastController.addToast("All Matches converted");
}
