<script lang="ts">
	import { Popover, Separator } from "$lib/generic";

	type Props = {
		formationStats: any;
	};

	let { formationStats }: Props = $props();
</script>

<Popover>
	{#snippet trigger()}
		<div class="formation-info-trigger">
			<p class="formation-info-trigger-text">PV: {formationStats.totalPV}</p>
			<img class="info-button-icon" src="/icons/information.svg" alt="information" />
		</div>
	{/snippet}

	<div class="list-info-content">
		<p>Total Units:</p>
		<p>{formationStats.unitCount}</p>
		<Separator classes="separator-border list-info-separator" />
		<p>Average Skill:</p>
		<p>{formationStats.avgSkill}</p>
		<p>Average Size:</p>
		<p>{formationStats.avgSize}</p>
		<p>Average Health:</p>
		<p>{formationStats.avgHealth}</p>
		<p>Average Short Damage:</p>
		<p>{formationStats.avgS}</p>
		<p>Average Medium Damage:</p>
		<p>{formationStats.avgM}</p>
		<p>Average Long Damage:</p>
		<p>{formationStats.avgL}</p>
		<Separator classes="separator-border list-info-separator" />
		<p>Total Health:</p>
		<p>{formationStats.totalHealth}</p>
		<p>Total Short Damage:</p>
		<p>{formationStats.totalS}</p>
		<p>Total Medium Damage:</p>
		<p>{formationStats.totalM}</p>
		<p>Total Long Damage:</p>
		<p>{formationStats.totalL}</p>
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
	.formation-info-trigger {
		padding: 2px 4px;
		display: flex;
		gap: 2px;
	}
	.formation-info-trigger-text {
		color: var(--surface-color-light-text-color);
	}
</style>
