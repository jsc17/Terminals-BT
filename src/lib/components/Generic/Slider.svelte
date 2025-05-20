<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Slider, type WithoutChildren } from "bits-ui";

	type Props = WithoutChildren<ComponentProps<typeof Slider.Root>>;

	let { value = $bindable(), ref = $bindable(null), ...restProps }: Props = $props();
</script>

<!--
 Since we have to destructure the `value` to make it `$bindable`, we need to use `as any` here to avoid
 type errors from the discriminated union of `"single" | "multiple"`.
 (an unfortunate consequence of having to destructure bindable values)
  -->
<Slider.Root bind:value bind:ref {...restProps as any}>
	{#snippet children({ thumbs, ticks })}
		<div class="bar"><Slider.Range /></div>

		{#each thumbs as index}
			<Slider.Thumb {index} />
		{/each}

		{#each ticks as index}
			<Slider.Tick {index} />
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
		background-color: var(--muted-foreground);
	}
	:global([data-slider-thumb]) {
		border: 1px solid var(--muted-foreground);
		background-color: var(--muted-foreground);
		width: 15px;
		height: 15px;
		cursor: pointer;
		border-radius: 50%;
	}
	.bar {
		width: 100%;
		height: 5px;
		border-radius: var(--radius);
		background-color: var(--muted);
	}
</style>
