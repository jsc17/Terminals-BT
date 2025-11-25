<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Slider, type WithoutChildren } from "bits-ui";

	type Props = WithoutChildren<ComponentProps<typeof Slider.Root>> & { position: "top" | "bottom" | "left" | "right" };

	let { position, value = $bindable(), ref = $bindable(null), ...restProps }: Props = $props();
</script>

<!--
 Since we have to destructure the `value` to make it `$bindable`, we need to use `as any` here to avoid
 type errors from the discriminated union of `"single" | "multiple"`.
 (an unfortunate consequence of having to destructure bindable values)
  -->
<Slider.Root bind:value bind:ref {...restProps as any}>
	{#snippet children({ thumbItems, tickItems })}
		<div class="bar"><Slider.Range /></div>

		{#each thumbItems as { index, value }}
			<Slider.Thumb {index} />
		{/each}

		{#each tickItems as { index, value }}
			<Slider.Tick {index} />
			<Slider.TickLabel {index} {position}>{value}</Slider.TickLabel>
		{/each}
	{/snippet}
</Slider.Root>

<style>
	:global([data-slider-root]) {
		position: relative;
		display: flex;
		width: 100%;
		align-items: center;
	}

	:global([data-slider-range]) {
		flex-grow: 1;
		position: absolute;
		height: 100%;
		background-color: var(--surface-color-light-text-color);
	}
	:global([data-slider-thumb]) {
		border: 1px solid var(--surface-color-light-text-color);
		background-color: var(--surface-color-light-text-color);
		width: 15px;
		height: 15px;
		cursor: pointer;
		border-radius: 50%;
	}
	:global([data-slider-tick]) {
		width: 1px;
		height: 100%;
		background-color: var(--surface-color);
	}
	:global([data-slider-tick][data-selected]) {
		background-color: transparent;
	}
	:global([data-slider-tick-label]) {
		margin-top: 6px;
		font-size: 0.93rem;
	}
	.bar {
		width: 100%;
		height: 5px;
		border-radius: var(--radius);
		background-color: var(--surface-color-light);
	}
</style>
