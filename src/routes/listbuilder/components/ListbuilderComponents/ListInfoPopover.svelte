<script lang="ts">
	import { Popover, Separator } from "$lib/generic";
	import { InformationIcon } from "$lib/icons";
	import type { List } from "$lib/types/list.svelte";

	type Props = {
		list: List;
	};

	let { list = $bindable() }: Props = $props();
</script>

<Popover>
	{#snippet trigger()}
		<div class="list-info-trigger">
			<div class="trigger-details">
				<p class="list-info" class:errors={list.options?.maxUnits && list.unitCount > list.options.maxUnits}>
					<span class="muted">Units:</span>
					{list.unitCount}{list.options?.maxUnits ? `/${list.options.maxUnits}` : ""}
				</p>
				<p class="list-info" class:errors={list.options?.maxPv && list.pv > list.options.maxPv}>
					<span class="muted">PV:</span>
					{list.pv}{list.options?.maxPv ? `/${list.options.maxPv}` : ""}
				</p>
			</div>
			<InformationIcon fill="var(--surface-color-light-text-color)" height="15" width="15" />
		</div>
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
	.list-info-trigger {
		display: flex;
		gap: 4px;
		align-items: center;
	}
	.trigger-details {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
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
