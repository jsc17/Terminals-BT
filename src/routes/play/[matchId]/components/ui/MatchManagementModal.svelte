<script lang="ts">
	import { Dialog, Separator } from "$lib/generic";
	import type { Match, MatchTeam } from "$lib/generated/prisma/browser";
	import { UpdateMatchSchema } from "../../../schema/matchlistSchema";
	import type { PlayList } from "../../../types/types";
	import { kickPlayer, updateMatchData, removeList } from "../../remote/matchManagement.remote";

	type Props = {
		open: boolean;
		matchData?: Match;
		teamData: MatchTeam[];
		matchLists: PlayList[];
	};

	let { open = $bindable(), matchData, teamData, matchLists }: Props = $props();

	$effect(() => {
		if (open && matchData) {
			updateMatchData.fields.set({
				matchId: matchData.id.toString(),
				name: matchData.name ?? "",
				joinCode: matchData.joinCode ?? "",
				currentRound: matchData.currentRound,
				privateMatch: matchData.private,
				teamNames: teamData.map((t) => t.name),
				teamScores: teamData.map((t) => t.objectivePoints)
			});
		}
	});
</script>

<Dialog title="Join Match" bind:open>
	<form
		{...updateMatchData.preflight(UpdateMatchSchema).enhance(async ({ submit, data }) => {
			if (confirm("Are you sure you wish to update the match details?")) {
				await submit();
				open = false;
			}
		})}
	>
		{#each updateMatchData.fields.allIssues() as issue}
			<p>{issue.message}</p>
		{/each}
		<input {...updateMatchData.fields.matchId.as("hidden", matchData?.id.toString() ?? "")} />
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
	<Separator />
	<table>
		<thead>
			<tr>
				<th>List</th>
				<th>Team</th>
			</tr>
		</thead>
		<tbody>
			{#each matchLists as list}
				<tr>
					<td>{list.name}</td>
					<td>{teamData.find((t) => t.id == list.team)?.name}</td>
					<td><button class="transparent-button" onclick={() => removeList({ matchId: matchData!.id, listId: Number(list.id) })}>Remove</button></td>
				</tr>
			{/each}
		</tbody>
	</table>
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
	table {
		border-collapse: collapse;
	}
	th {
		text-align: start;
		padding: 8px 6px;
	}
	td {
		border: 1px solid var(--table-border);
		padding: 2px 6px;
	}
</style>
