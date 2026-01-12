<script lang="ts">
	import { getContext, onMount } from "svelte";
	import EditNicknameModal from "./components/EditNicknameModal.svelte";
	import { getMatches, getNickname, findPrivateMatch, refreshMatches } from "./remote/matchlist.remote";
	import CreateMatchModal from "./components/CreateMatchModal.svelte";
	import { convertLocalMatchesToServerMatches } from "./utilities/localToServerConversion";
	import { toastController } from "$lib/stores";

	let [myMatches, publicMatches] = $derived(getMatches().current ?? [[], []]);
	let nickname = $derived(getNickname().current);

	let user: { username: string | undefined } = getContext("user");

	onMount(() => {
		convertLocalMatchesToServerMatches();
		setInterval(() => {
			refreshMatches();
		}, 5000);
	});
</script>

<svelte:boundary>
	{#snippet pending()}
		Loading active matches
	{/snippet}

	<main>
		{#if user.username && nickname}
			<div class="flex-between">
				<div class="inline">
					<p>Nickname: <span class="muted">{nickname}</span></p>
					<EditNicknameModal currentNickname={nickname} />
				</div>

				<CreateMatchModal {nickname} />
			</div>
		{/if}
		<section class="card">
			<h2 class="section-header">My Matches</h2>
			<div class="match-list">
				{#each myMatches as list}
					<div class="match-card">
						<a href={`/play/${list.id}`} class="match-link">
							<p class="primary">{list.name}</p>
							<p class="muted">{list.createdAt.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
						</a>
					</div>
				{:else}
					<p class="muted">You have no currently active matches</p>
				{/each}
			</div>
		</section>

		<section class="card">
			<div class="space-between">
				<h2 class="section-header">Public Matches</h2>
				<form
					{...findPrivateMatch.enhance(async ({ submit }) => {
						await submit();
						if (findPrivateMatch.result?.status == "success") {
							window.location.href = `/play/${findPrivateMatch.result.data!.id}`;
						} else {
							toastController.addToast("No match with that id found");
						}
					})}
				>
					<label>Private Match Id: <input {...findPrivateMatch.fields.matchId.as("text")} /></label>
					<button>Join</button>
				</form>
			</div>
			<div class="match-list">
				{#each publicMatches as list}
					<div class="match-card">
						<a href={`/play/${list.id}`} class="match-link">
							<p class="primary">{list.name}</p>
							<p class="muted">{list.createdAt.toLocaleDateString("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
						</a>
					</div>
				{:else}
					<p class="muted">There are currently no active public matches</p>
				{/each}
			</div>
		</section>
	</main>
</svelte:boundary>

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
		gap: 16px;
	}
	.section-header {
		margin: 0;
	}
	.match-list {
		width: calc(100% - 16px);
		display: flex;
		gap: 16px;
		flex-wrap: wrap;
	}
	.match-card {
		display: grid;
		position: relative;
		width: max-content;
		height: max-content;
		grid-template-columns: max-content max-content;
		background-color: var(--surface-color-light);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	.match-link {
		display: flex;
		flex-direction: column;
		padding: var(--responsive-padding);
		gap: 4px;
	}
	.match-link:hover {
		background-color: var(--surface-color-extra-light);
	}
</style>
