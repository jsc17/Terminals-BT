<script lang="ts">
	import TournamentData from "./components/TournamentData.svelte";
	import TournamentParticipants from "./components/TournamentParticipants.svelte";
	import TournamentStatistics from "./components/TournamentStatistics.svelte";

	let { data } = $props();
</script>

<main>
	<svelte:boundary>
		{#snippet pending()}
			Loading tournament data
		{/snippet}
		<TournamentData tournamentData={data.tournamentData} />
	</svelte:boundary>
	<svelte:boundary>
		{#snippet pending()}
			Loading participant data
		{/snippet}
		<TournamentParticipants participants={data.tournamentData.participants} />
	</svelte:boundary>
	<svelte:boundary><TournamentStatistics tournamentId={data.tournamentData.id} /></svelte:boundary>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: var(--responsive-padding);
	}
</style>
