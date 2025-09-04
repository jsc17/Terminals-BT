<script lang="ts">
	import { getEras } from "$lib/remote/era-faction.remote.js";
	import { createTournament, getUsersTournamentList } from "./tournament.remote.js";
	import { ruleSets } from "$lib/types/rulesets";
	import { toastController } from "$lib/stores/toastController.svelte.js";

	let { data } = $props();

	let userTournamentDataP = getUsersTournamentList();
	let eraListPromise = getEras();

	let userTournamentData = $derived(await userTournamentDataP);
	let selectedTournament = $derived(userTournamentData.data?.[0].id);
	let eraList = $derived(await eraListPromise);
</script>

<main>
	{#if data.username}
		<section class="card">
			<h2 class="section-header">Manage existing tournament:</h2>
			{#if userTournamentData.data?.length}
				<div>
					<select bind:value={selectedTournament}>
						{#each userTournamentData.data ?? [] as option}
							<option value={option.id}>{option.name}</option>
						{/each}
					</select>
					<button
						onclick={() => {
							window.location.href = `/todashboard/${selectedTournament}`;
						}}
						disabled={selectedTournament == undefined}>Load</button
					>
				</div>
			{:else}
				<h2>User has no tournaments</h2>
			{/if}
		</section>
		<section class="card">
			<h2 class="section-header">Create new tournament</h2>
			<form
				{...createTournament.enhance(async ({ submit }) => {
					await submit();
					if (createTournament.result?.status == "success") {
						toastController.addToast("Tournament created");
						window.location.href = `/todashboard/${createTournament.result.data}`;
					}
				})}
			>
				<label for="tournament-name">Tournament Name: <span class="description">Name that will be displayed to participants when they are selecting the tournament</span> </label>
				<input type="text" name="tournament-name" id="tournament-name" required />
				<label for="tournament-date">Tournament Date: <span class="description">Tournaments date. Submissions will no longer be allowed after this date.</span></label>
				<input type="date" name="tournament-date" id="tournament-date" required />
				<label for="tournament-email">T.O. Email Address: <span class="description">Email address where you would like to recieve tournament list submissions</span> </label>
				<input type="text" name="tournament-email" id="tournament-email" required />
				<label for="tournament-era">Tournament Era: <span class="description">Era that list submissions will be validated against. Select any for open era.</span> </label>
				<select name="tournament-era" id="tournament-era">
					<option>Any</option>
					{#each eraList as era}
						<option value={era.id}>{era.name}</option>
					{/each}
				</select>
				<label for="tournament-rules">Tournament Rules: </label>
				<select name="tournament-rules" id="tournament-rule">
					{#each ruleSets as set}
						<option value={set.name}>{set.display}</option>
					{/each}
				</select>
				<label for="tournament-email-subject">T.O. Email Subject (optional): <span class="description">Subject line for list submission emails you will recieve.</span> </label>
				<input type="text" name="tournament-email-subject" id="tournament-email-subject" />
				<label for="tournament-location">Tournament Location (optional): </label>
				<input type="text" name="tournament-location" id="tournament-location" />
				<label for="tournament-message"
					>Message for me: <span class="description">
						For right now, since players names and emails are collected, I am manually approving tournaments. Please send a short description of your tournament. As long as you
						aren't trying to create a dozen a week, I'll approve it.
					</span></label
				>
				<textarea name="tournament-message" id="tournament-message" required></textarea>
				<button class="submit-button">Create</button>
			</form>
		</section>
	{:else}
		<p class="muted">Please Login to create and manage tournaments</p>
	{/if}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: var(--responsive-padding);
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.section-header {
		color: var(--muted-foreground);
		margin: 0;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	input {
		max-width: 500px;
		margin-top: 4px;
		margin-bottom: 12px;
	}
	input[type="date"] {
		width: max-content;
	}
	select {
		width: max-content;
		margin-top: 4px;
		margin-bottom: 12px;
	}
	textarea {
		background-color: var(--muted);
	}
	.description {
		color: var(--muted-foreground);
		font-size: 0.9rem;
		margin-left: 4px;
	}
	.submit-button {
		margin-top: 16px;
		padding: var(--responsive-padding);
		width: max-content;
	}
</style>
