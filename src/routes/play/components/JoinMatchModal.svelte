<script lang="ts">
	import { Dialog } from "$lib/generic";
	import { createMatch } from "../remote/matchlist.remote";

	let open = $state(false);
</script>

<Dialog title="Create Match" triggerClasses="create-match-trigger" bind:open>
	{#snippet trigger()}
		Create Match
	{/snippet}

	<form
		{...createMatch.enhance(async ({ submit }) => {
			await submit();
			open = false;
		})}
	>
		<label>Match Name: <input {...createMatch.fields.name.as("text")} /></label>
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
</style>
