<script lang="ts">
	import { getUsersTournamentList } from "$lib/remote/tournament.remote";

	let userTournamentData = $derived(await getUsersTournamentList());
	let tournamentList = $derived(userTournamentData.data ?? []);
	let selectedTournament = $state<string>();
</script>

<main>
	<section>
		<h2>Load existing tournament:</h2>
		{#if userTournamentData.data?.length}
			<select bind:value={selectedTournament}>
				{#each userTournamentData.data ?? [] as option}
					<option value={option}>{option.name}</option>
				{/each}
			</select>
		{:else}
			<h2>User has no tournaments</h2>
		{/if}
	</section>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	section {
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
