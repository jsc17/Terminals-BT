<svelte:options css="injected" />

<script lang="ts">
	import type { battlefieldSupportCard } from "$lib/types/battlefieldSupport";
	import { existsSync, readFileSync } from "fs";

	type Props = { bfsData?: battlefieldSupportCard };
	let { bfsData }: Props = $props();

	const imageData = $derived.by(() => {
		if (!bfsData?.id) return undefined;
		const localPath = `./files/custom-cards/${bfsData.id}.png`;
		if (existsSync(localPath)) {
			const data = readFileSync(localPath, { encoding: "base64" });
			return "data:image/png;base64," + data;
		}
	});
</script>

<div class="bfs-card-container">
	{#if !bfsData}
		<p>Battlefield Support Data not found</p>
	{:else if imageData}
		<img src={imageData} class="bfs-custom-image" alt="bfs" />
	{:else}
		<div class="bfs-generated-card">
			<div class="inline">
				<h2>{bfsData.name}</h2>
				<div>
					{#if bfsData.bspCost}
						<h3>BSP: {bfsData.bspCost ?? ""}</h3>
					{/if}
					{#if bfsData.pvCost}
						<h3>PV: {bfsData.pvCost ?? ""}</h3>
					{/if}
				</div>
			</div>
			<h3 class="flip-message">Flip Card after use</h3>
			<h3>{bfsData.source}</h3>
		</div>
	{/if}
</div>

<style>
	* {
		padding: 0;
		margin: 0;
		box-sizing: border-box;
	}
	.bfs-card-container {
		aspect-ratio: 7/ 5;
		width: 268pt;
		border: 5px solid black;
		background-color: white;
		container: unit-card / size;
	}
	.bfs-custom-image {
		width: 100%;
		height: 100%;
	}
	.bfs-generated-card {
		padding: 3cqw;
		display: grid;
		grid-template-rows: max-content 1fr max-content;
		height: 100%;
	}
	.flip-message {
		align-self: center;
		justify-self: center;
	}
	.inline {
		display: flex;
		justify-content: space-between;
		align-items: start;
	}
</style>
