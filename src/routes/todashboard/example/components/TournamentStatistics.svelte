<script lang="ts">
	import { getTournamentStatistics } from "../../tournament.remote";
	import TournamentStatisticList from "./TournamentStatisticList.svelte";
	import TournamentStatisticsChart from "./TournamentStatisticsChart.svelte";

	type Props = {
		fixedEra: boolean;
		tournamentId: number;
	};

	let { tournamentId, fixedEra }: Props = $props();

	let statistics = getTournamentStatistics(tournamentId);
	let placeLimit = $state(3);

	const tournamentStatisticList = $derived(
		statistics.current
			? [
					{ title: "Lowest PV Lists", display: `<span class="primary">[player]</span> - [pv]pv - [unitCount] units`, data: statistics.current.data.achievements.lowestPVList },
					{ title: "Highest PV Units", display: `<span class="primary">[unit] ([skill])</span> - [pv]pv - [player]`, data: statistics.current.data.achievements.highestPVUnit },
					{ title: "Most Common Units", display: `<span class="primary">[unit]</span> - [count]x`, data: statistics.current.data.achievements.mostCommonUnit }
				]
			: []
	);

	let tournamentCharts = $derived.by(() => {
		if (!statistics.current) return [];

		let chartData = [
			{ title: "Unit Types", data: statistics.current.data.breakdowns.unitTypes },
			{ title: "Factions", data: statistics.current.data.breakdowns.factionList }
		];
		if (!fixedEra) {
			chartData.push({ title: "Eras", data: statistics.current.data.breakdowns.eraList });
		}
		return chartData;
	});
</script>

<section class="card">
	{#if statistics.current?.status == "success"}
		<div class="stat-row">
			{#each tournamentStatisticList as list}
				<TournamentStatisticList title={list.title} display={list.display} data={list.data} {placeLimit} />
			{/each}
		</div>
		<div class="chart-row">
			{#each tournamentCharts as chart}
				<div>
					<TournamentStatisticsChart title={chart.title} data={chart.data} />
				</div>
			{/each}
		</div>
	{:else}
		<p class="error">Error getting tournament statistics</p>
	{/if}
</section>

<style>
	.stat-row {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}
	.chart-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, 450px);
		gap: 16px;
	}
</style>
