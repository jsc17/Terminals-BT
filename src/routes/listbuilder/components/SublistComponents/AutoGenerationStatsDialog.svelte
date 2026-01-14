<script lang="ts">
	import { Popover } from "$lib/generic";
	import type { List, Sublist, SublistStats } from "$lib/types/list.svelte";

	type Props = { list: List; sublist: Sublist };
	let { list, sublist }: Props = $props();

	let stats: SublistStats = $derived.by(() => {
		console.log("generating stats");
		let pv = 0,
			health = 0,
			short = 0,
			medium = 0,
			long = 0,
			size = 0;
		for (const unitId of sublist.checked) {
			const unit = list.getUnit(unitId);
			pv += unit?.cost ?? 0;
			health += unit?.baseUnit.health ?? 0;
			medium += unit?.baseUnit.damageM ?? 0;
			short += unit?.baseUnit.damageS ?? 0;
			long += unit?.baseUnit.damageL ?? 0;
			size += unit?.baseUnit.size ?? 0;
		}
		return { pv, health, short, medium, long, size };
	});
</script>

<Popover>
	{#snippet trigger()}
		<div class="detailed-button">Stats</div>
	{/snippet}
	<div class="sublist-stats-vertical">
		<p class="muted">Total Health:</p>
		<p>{stats?.health ?? 0}</p>
		<p class="muted">Total Short:</p>
		<p>{stats?.short ?? 0}</p>
		<p class="muted">Total Medium:</p>
		<p>{stats?.medium ?? 0}</p>
		<p class="muted">Total Long:</p>
		<p>{stats?.long ?? 0}</p>
		<p class="muted">Total Size:</p>
		<p>{stats?.size ?? 0}</p>
	</div>
</Popover>

<style>
	.sublist-stats-vertical {
		padding: var(--responsive-padding);
		display: grid;
		grid-template-columns: max-content 1fr;
		column-gap: 16px;
		row-gap: 4px;
		border: 1px solid var(--primary);
	}
	.sublist-stats-vertical > p:nth-child(odd) {
		text-align: end;
	}
	.detailed-button {
		background-color: var(--button);
		color: var(--button-text-color);
		border-radius: var(--radius);
		padding: 8px 12px;
		box-shadow:
			0px -3px 0px var(--button-dark) inset,
			0px 4px 5px -3px var(--button-dark);
	}
	.detailed-button:hover {
		transform: translateY(-2px);
	}
	.detailed-button:active {
		box-shadow:
			3px 6px 12px var(--button-dark) inset,
			-3px -6px 12px var(--button-dark) inset;
		transform: translateY(-2px);
	}
</style>
