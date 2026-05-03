<script lang="ts">
	import { getBfsById } from "$lib/data/battlefieldSupport";
	import type { MatchBFS } from "$lib/generated/prisma/browser";
	import { Dialog } from "$lib/generic";
	import { useBFS, undoBFS } from "../remote/matchBFS.remote";

	type Props = {
		bfs: Omit<MatchBFS, "listId">;
	};

	let { bfs }: Props = $props();

	const { id, bfsId, count, used } = $derived(bfs);
	const bfsData = $derived(getBfsById(bfsId));

	let open = $state(false);
</script>

<Dialog title={bfsData?.name ?? "BFS not found"} triggerClasses="transparent-button" bind:open>
	{#snippet trigger()}
		<button class="bfs-item">
			<p class={{ "bfs-used": used >= count }}>{bfsData?.name}</p>
			{#each { length: count } as _, index}
				<div class={{ "bfs-pip": true, "bfs-pip-used": index >= count - used }}></div>
			{/each}
		</button>
	{/snippet}

	<div class="dialog-body">
		<div class="space-between">
			<p class="dialog-text">
				<span class={{ primary: true, error: used == count }}> {count - used}</span>/<span class={{ primary: true, error: used == count }}>{count}</span> uses remaining
			</p>
			<button
				disabled={used >= count}
				onclick={() => {
					useBFS(id);
					open = false;
				}}>Use BFS</button
			>
		</div>
		<div class="space-between">
			<button
				disabled={used <= 0}
				onclick={async () => {
					if (confirm("Undo the Battlefield support usage and restore a use to the counter?")) {
						await undoBFS(id);
						open = false;
					}
				}}
				>Undo BFS Usage
			</button>
			<p class="muted">{bfsData?.source}</p>
		</div>
	</div>
</Dialog>

<style>
	.bfs-item {
		border-bottom: 1px solid var(--border);
		background-color: var(--surface-color);
		padding: 8px;
		border-radius: var(--radius);
		display: grid;
		grid-auto-flow: column;
		grid-auto-rows: max-content;
		align-items: center;
		gap: 16px;
		font-size: 16px;
		font-weight: initial;
	}
	.bfs-used {
		text-decoration: line-through;
		color: var(--surface-color-light-text-color);
	}
	.bfs-pip {
		background-color: var(--primary-dark);
		border: 1px solid var(--primary);
		border-radius: 50%;
		height: 80%;
		aspect-ratio: 1;
	}
	.bfs-pip-used {
		background-color: var(--background);
		border: 1px solid var(--primary);
		border-radius: var(--radius);
	}
	.dialog-text {
		font-size: 1.25rem;
	}
	.dialog-body {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
</style>
