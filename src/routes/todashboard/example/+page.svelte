<script lang="ts">
	import TournamentData from "./components/TournamentData.svelte";
	import TournamentParticipants from "./components/TournamentParticipants.svelte";
	import TournamentStatistics from "./components/TournamentStatistics.svelte";

	let { data } = $props();
</script>

<main>
	<section class="card">
		<p class="error">This is an example page. It is available to everyone and none of the data here is real. No changes made to this page will persist past refreshing it.</p>
		<p>The sample tournament is open era, but if an era was selected the column wouldn't be included in the player table or in the statistics below</p>
	</section>
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
		<TournamentParticipants participants={data.tournamentData.participants} fixedEra={data.tournamentData.era != null} />
	</svelte:boundary>
	<svelte:boundary>
		{#if data.tournamentData.participants.length == 0}
			<section class="card">Statistics will populate when participants have registered</section>
		{:else}
			<TournamentStatistics tournamentId={data.tournamentData.id} fixedEra={data.tournamentData.era != null} />
		{/if}
	</svelte:boundary>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: var(--responsive-padding);
		overflow: auto;
	}
</style>
