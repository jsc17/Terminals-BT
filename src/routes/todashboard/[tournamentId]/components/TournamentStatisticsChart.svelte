<script lang="ts">
	import { Plot, BarX, RuleX, HTMLTooltip } from "svelteplot";

	type Props = {
		title: string;
		data: { group: string; value: number }[];
	};
	let { title, data }: Props = $props();

	let letters = "0123456789ABCDEF";
	let color = $state("#");
	for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];

	let hovered = $state();
</script>

<div class="chart-wrapper">
	{#if data.length}
		<Plot grid x={{ label: false }} y={{ label: false, insetBottom: 8 }}>
			{#snippet header()}
				{title}
			{/snippet}
			<BarX
				{data}
				x="value"
				y="group"
				fill="group"
				cursor="pointer"
				opacity={{
					scale: null,
					value: (d) => (!hovered || hovered === d.group ? 1 : 0.3)
				}}
				onmouseenter={(event) => console.log(event)}
				onmouseleave={(event) => (hovered = undefined)}
			/>
			<RuleX data={[0]} />
		</Plot>
	{:else}
		<p>No Participants</p>
	{/if}
</div>

<style>
	.chart-wrapper {
		padding: var(--responsive-padding);
		border: 1px solid var(--table-border);
		border-radius: var(--radius);
	}
</style>
