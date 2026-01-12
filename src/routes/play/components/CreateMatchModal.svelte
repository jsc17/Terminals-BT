<script lang="ts">
	import { Dialog } from "$lib/generic";
	import { createMatch } from "../remote/matchlist.remote";
	import { nanoid } from "nanoid";
	import { CreateMatchSchema } from "../schema/matchlistSchema";
	import { toastController } from "$lib/stores";

	type Props = {
		nickname: string;
	};

	let { nickname }: Props = $props();

	function onOpenChange() {
		if (open) {
			createMatch.fields.set({ joinCode: nanoid(6).replaceAll("_", "Z"), private: true, name: "", hostNickname: nickname, teamNames: ["Red", "Blue"] });
		}
	}

	let open = $state(false);
</script>

<Dialog title="Create Match" triggerClasses="create-match-trigger" bind:open {onOpenChange}>
	{#snippet trigger()}
		Create Match
	{/snippet}

	<form
		{...createMatch.preflight(CreateMatchSchema).enhance(async ({ submit }) => {
			await submit();
			if (createMatch.result?.status == "success") {
				open = false;
			} else {
				toastController.addToast(createMatch.result!.message);
			}
		})}
	>
		<div>
			<label>Match Name: <input {...createMatch.fields.name.as("text")} /></label>
			{#each createMatch.fields.name.issues() as issue}
				<p class="error">{issue.message}</p>
			{/each}
		</div>
		<div>
			<label>Join Code: <input {...createMatch.fields.joinCode.as("text")} /></label>
			{#each createMatch.fields.joinCode.issues() as issue}
				<p class="error">{issue.message}</p>
			{/each}
		</div>
		<div>
			<label><input {...createMatch.fields.private.as("checkbox")} /> Private Game?</label>
			<p class="muted">Private games will not show up in the games list, and will require a join code for other players to join</p>
		</div>
		<div>
			<label>Team 1 Name: <input {...createMatch.fields.teamNames[0].as("text")} /></label>
			<label>Team 2 Name: <input {...createMatch.fields.teamNames[1].as("text")} /></label>

			{#each createMatch.fields.hostNickname.issues() as issue}
				<p class="error">{issue.message}</p>
			{/each}
		</div>
		<hr />
		<div>
			<label>Host Nickname: <input {...createMatch.fields.hostNickname.as("text")} /></label>
			{#each createMatch.fields.hostNickname.issues() as issue}
				<p class="error">{issue.message}</p>
			{/each}
		</div>

		<div class="center"><button>Submit</button></div>
	</form>
</Dialog>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	:global(.create-match-trigger) {
		padding: 8px 12px;
		box-shadow:
			0px -3px 0px var(--button-dark) inset,
			0px 4px 5px -3px var(--button-dark);
	}
	:global(.create-match-trigger:hover) {
		transform: translateY(-2px);
	}
	:global(.create-match-trigger:active) {
		box-shadow:
			3px 6px 12px var(--button-dark) inset,
			-3px -6px 12px var(--button-dark) inset;
		transform: translateY(-2px);
	}
	.error {
		margin-top: 2px;
		font-size: 0.95em;
	}
</style>
