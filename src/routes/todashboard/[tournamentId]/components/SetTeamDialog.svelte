<script lang="ts">
	import type { Participant } from "$lib/generated/prisma/client";
	import { Dialog } from "$lib/generic";
	import { setParticipantTeam } from "$routes/todashboard/tournament.remote";

	let openState = $state<boolean>(false);
	let participantData = $state<Participant>();
	let participantId = $derived(participantData?.id ?? "");
	let teamName = $derived<string>(participantData?.teamName ?? "");

	export function open(data: Participant) {
		participantData = data;
		openState = true;
	}
</script>

<Dialog title="Edit Team Name" bind:open={openState}>
	{#snippet description()}
		Setting team name for {participantData?.name}
	{/snippet}
	<form
		{...setParticipantTeam.enhance(async ({ submit }) => {
			await submit();
			openState = false;
		})}
	>
		<input {...setParticipantTeam.fields.participantId.as("hidden", participantId)} />
		<label>New Team Name: <input {...setParticipantTeam.fields.teamName.as("text", teamName)} bind:value={teamName} /></label>
		<div class="flex-between">
			<button type="button" onclick={() => (openState = false)}>Cancel</button>
			<button disabled={!teamName.length}>Submit</button>
		</div>
	</form>
</Dialog>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
</style>
