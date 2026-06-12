<script lang="ts">
	import SendNotification from "./SendNotification.svelte";
	import { getPendingTournaments, approveTournament } from "./tournament-admin.remote";

	const pendingTournaments = $derived(await getPendingTournaments());
	let selectedPendingTournament = $state<number>();
</script>

<main>
	<SendNotification />

	<form class="card">
		<label>
			Pending Tournament:
			<select bind:value={selectedPendingTournament}>
				{#each pendingTournaments as tournament}
					<option value={tournament.id}>{tournament.name}</option>
				{/each}
			</select>
		</label>
		<button onclick={() => approveTournament({ tournamentId: selectedPendingTournament ?? 0 })}>Approve</button>
	</form>
	<p>{selectedPendingTournament ?? "not set"}</p>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 24px;
		justify-content: flex-start;
		align-items: start;
		padding: var(--responsive-padding);
	}
</style>
