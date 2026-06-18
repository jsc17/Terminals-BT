<script lang="ts">
	import TournamentData from "./components/TournamentData.svelte";
	import TournamentParticipants from "./components/TournamentParticipants.svelte";
	import TournamentStatistics from "./components/TournamentStatistics.svelte";
	import type { PageProps } from "./$types";
	import { getTournamentData, getUsersTournamentList } from "../tournament.remote";
	import { goto } from "$app/navigation";

	const { params }: PageProps = $props();

	const tournamentId = $derived(Number(params.tournamentId));
	const tournamentResponse = $derived(await getTournamentData(tournamentId));
	const tournamentData = $derived(tournamentResponse.data);

	let userTournamentDataP = getUsersTournamentList();
	let userTournamentData = $derived(await userTournamentDataP);
	let selectedTournament = $derived(userTournamentData.data?.[0].id);
</script>

<main>
	<section class="card">
		{#if userTournamentData.data?.length}
			<div>
				<select bind:value={selectedTournament}>
					{#each userTournamentData.data ?? [] as option}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
				<button
					onclick={() => {
						goto(`/todashboard/${selectedTournament}`);
					}}
					disabled={selectedTournament == undefined}>Load</button
				>
			</div>
		{:else}
			<h2>User has no tournaments</h2>
		{/if}
	</section>
	{#if tournamentResponse.status == "failed"}
		<h1>{tournamentResponse.message}</h1>
	{:else}
		<svelte:boundary>
			{#snippet pending()}
				Loading tournament data
			{/snippet}
			<TournamentData tournamentData={tournamentData!} />
		</svelte:boundary>
		<svelte:boundary>
			{#snippet pending()}
				Loading participant data
			{/snippet}
			<TournamentParticipants participants={tournamentData!.participants} fixedEra={tournamentData!.era != null} teams={tournamentData!.teams} />
		</svelte:boundary>
		<svelte:boundary>
			{#if tournamentData!.participants.length}
				<TournamentStatistics tournamentId={tournamentData!.id} fixedEra={tournamentData!.era != null} />
			{:else}
				<section class="card">Statistics will populate when participants have registered</section>
			{/if}
		</svelte:boundary>
	{/if}
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
