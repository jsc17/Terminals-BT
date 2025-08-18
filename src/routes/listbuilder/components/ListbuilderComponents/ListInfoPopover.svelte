<script lang="ts">
	import { Popover, Separator } from "$lib/generic";
	import type { List } from "$lib/types/list.svelte";

	type Props = {
		list: List;
	};

	let { list = $bindable() }: Props = $props();
</script>

<Popover>
	{#snippet trigger()}
		<img class="info-button-icon" src="/icons/information.svg" alt="information" />
	{/snippet}

	<div class="list-info-content">
		<p>Average Skill:</p>
		<p>{list.stats.avgSkill}</p>
		<p>Average Size:</p>
		<p>{list.stats.avgSize}</p>
		<p>Average Health:</p>
		<p>{list.stats.avgHealth}</p>
		<p>Average Short Damage:</p>
		<p>{list.stats.avgS}</p>
		<p>Average Medium Damage:</p>
		<p>{list.stats.avgM}</p>
		<p>Average Long Damage:</p>
		<p>{list.stats.avgL}</p>
		<Separator classes="separator-border list-info-separator" />
		<p>Total Health:</p>
		<p>{list.stats.totalHealth}</p>
		<p>Total Short Damage:</p>
		<p>{list.stats.totalS}</p>
		<p>Total Medium Damage:</p>
		<p>{list.stats.totalM}</p>
		<p>Total Long Damage:</p>
		<p>{list.stats.totalL}</p>
	</div>
</Popover>

<style>
	.list-info-content {
		display: grid;
		grid-template-columns: 1fr max-content;
		column-gap: 8px;
		row-gap: 2px;
		width: 100%;
		height: max-content;
		padding: 16px;

		& p:nth-of-type(2n-1) {
			justify-self: end;
		}
	}
	:global(.list-info-separator) {
		grid-column-start: 1;
		grid-column-end: 3;
	}
</style>
