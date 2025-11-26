<script lang="ts">
	import { Dialog } from "$lib/generic";
	import type { Match, MatchTeam } from "$lib/generated/prisma/browser";
	import { updateMatchData } from "../../remote/matchData.remote";
	import { UpdateMatchSchema } from "../../../schema/matchlistSchema";

	type Props = {
		open: boolean;
		matchData: Match;
		teamData: MatchTeam[];
	};

	let { open = $bindable(), matchData, teamData }: Props = $props();

	$effect(() => {
		updateMatchData.fields.set({
			matchId: matchData.id.toString(),
			name: matchData.name ?? "",
			joinCode: matchData.joinCode ?? "",
			currentRound: matchData.currentRound,
			privateMatch: matchData.private,
			teamNames: teamData.map((t) => t.name),
			teamScores: teamData.map((t) => t.objectivePoints)
		});
	});
</script>

<Dialog title="Join Match" bind:open>
	<form
		{...updateMatchData.preflight(UpdateMatchSchema).enhance(async ({ submit }) => {
			if (confirm("Are you sure you wish to update the match details?")) {
				await submit();
				open = false;
			}
		})}
	>
		{#each updateMatchData.fields.allIssues() as issue}
			<p>{issue.message}</p>
		{/each}
		<input {...updateMatchData.fields.matchId.as("hidden", matchData.id.toString())} />
		<fieldset>
			<legend>Match Details</legend>
			<label for="matchName">Match Name: </label><input {...updateMatchData.fields.name.as("text")} id="matchName" />
			<label for="joinCode">Join Code: </label><input {...updateMatchData.fields.joinCode.as("text")} id="joinCode" />
			<label for="currentRound">Current Round: </label><input {...updateMatchData.fields.currentRound.as("number")} id="currentRound" />
			<label><input {...updateMatchData.fields.privateMatch.as("checkbox")} /> Private Match</label>
		</fieldset>
		<fieldset>
			<legend>Teams</legend>
			{#each teamData as team, index}
				<label>Name: <input {...updateMatchData.fields.teamNames[index].as("text")} /></label>
				<label>Score: <input {...updateMatchData.fields.teamScores[index].as("number")} /></label>
			{/each}
		</fieldset>
		<button>Update Match Data</button>
	</form>
</Dialog>

<style>
	form {
		padding: var(--responsive-padding);
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: start;
	}
	fieldset {
		width: 100%;
		display: grid;
		grid-template-columns: max-content max-content;
		gap: 6px;
		padding: var(--responsive-padding);
	}
</style>
