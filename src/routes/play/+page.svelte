<script lang="ts">
	import { db } from "$lib/offline/db";
	import type { PlayList } from "$lib/playmode/types";
	import { onMount } from "svelte";
	import Trash from "phosphor-svelte/lib/Trash";
	import LoadModal from "./components/LoadModal.svelte";

	let matches = $state<PlayList[]>([]);

	onMount(async () => {
		matches = await db.localMatches.toArray();
	});

	function endMatch(match: PlayList) {
		if (confirm(`Delete Match ${match.name}?`)) {
			db.localMatches.delete(match.id);
			matches = matches?.filter((l) => l.id != match.id);
		}
	}
</script>

<svelte:boundary>
	{#snippet pending()}
		Loading active matches
	{/snippet}

	<main>
		<section class="card">
			<div class="flex-between">
				<h2 class="section-header">My Matches</h2>
				<LoadModal bind:matches />
			</div>
			<div class="match-list">
				{#each matches as list}
					<div class="match-card">
						<a href={`/play/${list.id}`} class="match-link">
							<p class="primary">{list.name}</p>
							<p class="muted">{list.date}</p>
						</a>
						<!-- <button class="end-match" onclick={() => endMatch(list)}>
							<Trash color="black" width="15px" height="15px" />
						</button> -->
					</div>
				{:else}
					<p class="muted">You have no currently active matches</p>
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
	}
	.match-link {
		display: flex;
		flex-direction: column;
		padding: var(--responsive-padding);
		gap: 4px;
		background-color: var(--muted);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	.match-link:hover {
		background-color: var(--popover);
	}
	/* .end-match {
		background-color: rgb(240, 90, 90);
		border-radius: 50%;
		position: absolute;
		right: -10px;
		bottom: -10px;
	}
	.end-match:hover {
		cursor: pointer;
		background-color: lightcoral;
	} */
</style>
