<script lang="ts">
	import type { MatchRoundSummary } from "$lib/generated/prisma/browser";
	import type { MatchRoundSummaryTeam } from "$lib/generated/prisma/client";
	import { Dialog } from "$lib/generic";
	import { SvelteMap } from "svelte/reactivity";

	type Props = {
		open: boolean;
		teams: { id: number; name: string }[];
        roundSummaries: SvelteMap<number, MatchRoundSummary & {teams: MatchRoundSummaryTeam[]}>;
	};

	let { open = $bindable(), teams, roundSummaries }: Props = $props();

	let activeRound = $derived([...roundSummaries.keys()][0]);
</script>

<Dialog title="Round Results" bind:open>
	<div class="round-summary-body">
		<div class="round-selectors">
			{#each roundSummaries.entries() as [round, data]}
				<button class={{ "active-round": round == activeRound }} onclick={() => (activeRound = round)}>{round ? (data.matchEnded ? "Game End" : `Round ${round}`) : `Game Start`}</button>
            {:else}
                <p>No round data</p>
			{/each}
		</div>
		<div class="round-summary-data">
			{const roundSummaryData = $derived(roundSummaries.get(activeRound))}
			{#if roundSummaryData}
				{const totalSeconds = $derived(Math.floor(roundSummaryData.timeElapsedMS / 1000))}
				{const minutes = $derived(Math.floor(totalSeconds / 60).toString().padStart(2, "0"))}
				{const seconds = $derived((totalSeconds % 60).toString().padStart(2, "0"))}
                <p>Round Length: {activeRound ? `${minutes}:${seconds}` : "Game Start"}</p>
				<table>
					<thead>
						<tr>
							<th></th>
							{#each roundSummaryData.teams as team}
								<th>{teams.find(t=>t.id == team.teamId)?.name}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						<tr>
							<th>Objective Pts</th>
                            {#each roundSummaryData.teams as team}
                                <td>{team.objectivePoints}</td>
                            {/each}
						</tr>
                        						<tr>
							<th>Units Remaining</th>
                            {#each roundSummaryData.teams as team}
                                <td>{team.unitsRemaining}</td>
                            {/each}
						</tr>
                        						<tr>
							<th>PV Remaining</th>
                            {#each roundSummaryData.teams as team}
                                <td>{team.pvRemaining}</td>
                            {/each}
						</tr>
					</tbody>
				</table>
			{:else}
				<p class="error">Failed to get round data</p>
			{/if}
		</div>
	</div>
</Dialog>

<style>
	.round-summary-body {
		display: grid;
		grid-template-columns: max-content 1fr;
	}
	.round-selectors {
		display: flex;
		flex-direction: column;
		gap: 4px;

		& button {
			padding: var(--responsive-padding);
			border-radius: 0;
			color: var(--text-color);
			background-color: transparent;
		}

		& button.active-round {
			background-color: var(--border);
		}
	}
	.round-summary-data {
		border: 2px solid var(--border);
		width: 100%;
		height: 100%;
		padding: var(--responsive-padding);
		display: flex;
		flex-direction: column;
		gap: 6px;

        & table {
            width: 100%;
            border-collapse: collapse;
        }
        & td, th {
            border: 1px solid var(--border)
        }
        & td {
           text-align: center;
        }
		& p {
			padding-left: 6px;
		}
	}
</style>
