<script lang="ts">
	import { th } from "zod/v4/locales";
	import { getTournamentStatistics } from "../../tournament.remote";
	import Trophy from "phosphor-svelte/lib/Trophy";

	type Props = {
		tournamentId: number;
	};

	let { tournamentId }: Props = $props();

	let statistics = $derived(await getTournamentStatistics(tournamentId));
</script>

<section class="card">
	{#if statistics.status == "success"}
		<table>
			<thead>
				<tr>
					<th></th>
					<th><Trophy color="gold" weight="fill" /></th>
					<th><Trophy color="silver" weight="fill" /></th>
					<th><Trophy color="#cd7f32" weight="fill" /></th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Highest PV Unit</td>
					<td>
						<div class="achievement-list">
							{#each statistics.data.achievements.highestPVUnit.first ?? [] as data}
								<p><span class="primary">{data.player}</span>: {data.unit} ({data.skill}) - {data.pv}pv</p>
							{:else}
								-
							{/each}
						</div>
					</td>
					<td>
						<div class="achievement-list">
							{#each statistics.data.achievements.highestPVUnit.second ?? [] as data}
								<p><span class="primary">{data.player}</span>: {data.unit} ({data.skill}) - {data.pv}pv</p>
							{:else}
								-
							{/each}
						</div>
					</td>
					<td>
						<div class="achievement-list">
							{#each statistics.data.achievements.highestPVUnit.third ?? [] as data}
								<p><span class="primary">{data.player}</span>: {data.unit} ({data.skill}) - {data.pv}pv</p>
							{:else}
								-
							{/each}
						</div>
					</td>
				</tr>
				<tr>
					<td>Lowest Total PV List</td>
					<td>
						<div class="achievement-list">
							{#each statistics.data.achievements.lowestPVList.first ?? [] as data}
								<p><span class="primary">{data.player}</span> - {data.pv}pv - {data.unitCount} units</p>
							{:else}
								-
							{/each}
						</div>
					</td>
					<td>
						<div class="achievement-list">
							{#each statistics.data.achievements.lowestPVList.second ?? [] as data}
								<p><span class="primary">{data.player}</span> - {data.pv}pv - {data.unitCount} units</p>
							{:else}
								-
							{/each}
						</div>
					</td>
					<td>
						<div class="achievement-list">
							{#each statistics.data.achievements.lowestPVList.third ?? [] as data}
								<p><span class="primary">{data.player}</span> - {data.pv}pv - {data.unitCount} units</p>
							{:else}
								-
							{/each}
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	{:else}
		<p class="error">Error getting tournament statistics</p>
	{/if}
</section>

<style>
	table {
		border: 1px solid var(--border);
		border-collapse: collapse;
	}
	th,
	td {
		border-collapse: collapse;
		border: 1px solid var(--border);
		padding: var(--responsive-padding);
		text-align: center;
		vertical-align: center;
	}
	.achievement-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>
