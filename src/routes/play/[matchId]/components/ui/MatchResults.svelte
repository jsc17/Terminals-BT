<script lang="ts">
	import type { MatchTeam, Match } from "$lib/generated/prisma/browser";
	import { Dialog } from "$lib/generic";
	import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
	import type { PlayList, PlayUnit } from "$routes/play/types/types";
	import type { SvelteMap } from "svelte/reactivity";

	type Props = { open: boolean; matchData?: Match; teamData: MatchTeam[]; matchLists: PlayList[]; matchUnits: SvelteMap<number, PlayUnit> };

	let { open = $bindable(), matchData, teamData, matchLists, matchUnits }: Props = $props();
</script>

<Dialog title="Match Results" bind:open>
	<div class="match-results-body">
		{#if matchData?.gameCompleted}
			<p>Final Round: {matchData?.currentRound}</p>
			<fieldset class="team-scores">
				<legend>Final Objective Scores</legend>
				{#each teamData as team}
					<p>{team.name}:</p>
					<p>{team.objectivePoints}</p>
				{/each}
			</fieldset>
			{#each teamData as team}
				{@const data = matchLists
					.filter((l) => l.team == team.id)
					.reduce(
						(a, c) => {
							for (const formation of c.formations) {
								for (const unit of formation.units) {
									const unitData = matchUnits.get(unit);
									const unitPv = getNewSkillCost(unitData!.data.skill, unitData!.reference!.pv);
									a.totalUnits += 1;
									a.totalPv += unitPv;
									if (unitData!.data.current.damage < unitData!.reference!.health!) {
										a.unitsRemaining += 1;
										a.pvRemaining += unitPv;
									}
								}
							}
							return a;
						},
						{ unitsRemaining: 0, pvRemaining: 0, totalUnits: 0, totalPv: 0 }
					)}
				<fieldset class="team-stats">
					<legend>{team.name}</legend>
					<p>Units Remaining:</p>
					<p>{data.unitsRemaining} ({data.pvRemaining}pv)</p>
					<p>Units Lost:</p>
					<p>{data.totalUnits - data.unitsRemaining} ({data.totalPv - data.pvRemaining}pv)</p>
				</fieldset>
			{/each}
		{/if}
		<p>More detailed endgame statistics coming soon(ish)</p>
		<a href="/play">Return to match selection</a>
	</div>
</Dialog>

<style>
	.match-results-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.team-scores,
	.team-stats {
		display: grid;
		grid-template-columns: max-content 1fr;
		column-gap: 8px;
		padding: 8px 16px;
	}
	.team-scores > p:nth-child(even),
	.team-stats > p:nth-child(even) {
		justify-self: end;
	}
</style>
