<script lang="ts">
	import { Dialog } from "$lib/generic";
	import type { Match, MatchTeam } from "@prisma/client";
	type Props = {
		open: boolean;
		matchData: Match;
		teams: MatchTeam[];
	};

	let { open = $bindable(), matchData, teams }: Props = $props();

	let teamPoints = $state<number[]>([]);
</script>

<Dialog title="End Round {matchData.currentRound}" bind:open>
	{#snippet description()}
		End of the round. All pending damage and effects will be applied.
	{/snippet}
	<div class="dialog-body">
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
							<td><input type="number" bind:value={teamPoints[index]} defaultValue="0" /></td>
						</tr>
					{/each}
				</tbody>
			</table>
		</fieldset>
	</div>
</Dialog>

<style>
	.dialog-body {
		padding: var(--responsive-padding);
	}
	table {
		border-collapse: collapse;
	}
</style>
