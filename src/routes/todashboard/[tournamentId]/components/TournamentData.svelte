<script lang="ts">
	import { getEraName } from "$lib/remote/era-faction.remote";
	import { getRulesByName } from "$lib/types/rulesets";

	type Props = {
		tournamentData: {
			name: string;
			tournament_date: Date;
			email: string;
			tournamentRules: string;
			approved: boolean;
			era?: number | null;
			location?: string | null;
			emailSubject?: string | null;
		};
	};

	let { tournamentData }: Props = $props();
</script>

<section class="card">
	<p>Name: <span class="muted">{tournamentData.name}</span></p>
	<p>Date: <span class="muted">{tournamentData.tournament_date.toDateString()}</span></p>
	<p>T.O. Email: <span class="muted">{tournamentData.email}</span></p>
	<p>Rules: <span class="muted">{getRulesByName(tournamentData.tournamentRules)?.display}</span></p>
	<p>Status: <span class="muted">{tournamentData.approved ? "Approved" : "Pending"}</span></p>
	{#if tournamentData.location}
		<p>Location: <span class="muted">{tournamentData.location}</span></p>
	{/if}
	{#if tournamentData.era}
		<p>Era: <span class="muted">{await getEraName(tournamentData.era)}</span></p>
	{/if}
</section>

<style>
	section.card {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	}
</style>
