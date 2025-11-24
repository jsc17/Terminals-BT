<script lang="ts">
	import { Dialog } from "$lib/generic";
	import type { Match, MatchTeam } from "$lib/generated/prisma/browser";
	import type { Snippet } from "svelte";
	import { endRound } from "../../remote/matchUpdates.remote";

	type Props = {
		open: boolean;
		matchData: Match;
		teams: MatchTeam[];
		trigger: Snippet;
	};

	let { open = $bindable(), matchData, teams, trigger }: Props = $props();

	endRound.fields.teamScores.set(teams.map(() => 0));
</script>

<Dialog title="End Round {matchData.currentRound}" bind:open {trigger} triggerClasses="transparent-button">
	{#snippet description()}
		End of the round. Scores will be updated and all pending damage and effects will be applied.
	{/snippet}
	<form
		{...endRound.enhance(async ({ submit }) => {
			await submit();
			open = false;
		})}
		class="dialog-body"
	>
		<input {...endRound.fields.matchId.as("hidden", matchData.id.toString())} />
		<fieldset>
			<legend>Scoring</legend>
			<table>
				<thead>
					<tr>
						<th>Team</th>
						<th>Current Score</th>
						<th>Points Gained</th>
					</tr>
				</thead>
				<tbody>
					{#each teams as team, index}
						<tr>
							<td>{team.name}</td>
							<td>{team.objectivePoints}</td>
							<td><input {...endRound.fields.teamScores[index].as("number")} /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</fieldset>
		<button>Submit</button>
	</form>
</Dialog>

<style>
	.dialog-body {
		padding: var(--responsive-padding);
	}
	table {
		border-collapse: collapse;
	}
	th,
	td {
		padding: 4px 8px;
	}
	td {
		border: 1px solid var(--table-border);
		text-align: center;
	}
</style>
