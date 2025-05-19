<script lang="ts">
	import type { PlayList } from "$lib/types/playList";
	import { onMount } from "svelte";
	import PlayFormationCard from "./PlayFormationCard.svelte";

	let playList = $state<PlayList>();
	onMount(() => {
		const localList = localStorage.getItem("playList");
		if (localList) {
			playList = JSON.parse(localList);
		}
	});

	function resetUnits() {
		if (playList) {
			const reset = confirm("Are you sure you wish to reset all units to default? This cannot be undone.");
			if (reset) {
				for (const unit of playList.units) {
					unit.current = { damage: 0, heat: 0, crits: { engine: 0, fireControl: 0, mp: 0, weapon: 0, destroyed: false, motiveHit: 0, motiveHalf: 0, motiveIm: false } };
					unit.pending = { damage: 0, heat: 0, crits: { engine: 0, fireControl: 0, mp: 0, weapon: 0, destroyed: false, motiveHit: 0, motiveHalf: 0, motiveIm: false } };
				}
			}
			localStorage.setItem("playList", JSON.stringify(playList));
		}
	}
</script>

{#if !playList}
	<div class="list-load-error-body">
		<h2>No list loaded. Please try loading a list from the <a href="/listbuilder">list builder</a></h2>
	</div>
{:else}
	<div class="play-body">
		<div class="toolbar">
			<h3>
				Beta Feature: No Automation and I can't guarantee no bugs, but it seems to be working pretty well. There are some layout issues, but it should support all unit types and
				you can mark damage, heat, and criticals.
			</h3>
			<button class="transparent-button" onclick={resetUnits}>Reset List</button>
		</div>
		{#each playList.formations as formation}
			<PlayFormationCard {formation} units={playList.units}></PlayFormationCard>
		{/each}
	</div>
{/if}

<style>
	.list-load-error-body {
		height: 100%;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.play-body {
		padding: 0px 16px 0px 12px;
		gap: 12px;
		overflow: auto;
	}
	.toolbar {
		display: flex;
		gap: 16px;
		align-items: center;
		justify-content: space-between;
	}
</style>
