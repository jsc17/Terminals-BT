<script lang="ts">
	import { Switch } from "bits-ui";
	import type { Snippet } from "svelte";

	type Props = {
		checked: boolean;
		leftValue: Snippet;
		rightValue: Snippet;
		onCheckedChange?: () => void;
	};

	let { checked, leftValue, rightValue, onCheckedChange }: Props = $props();
</script>

<div class="slider-container">
	{@render leftValue()}
	<Switch.Root {checked} {onCheckedChange}>
		<Switch.Thumb></Switch.Thumb>
	</Switch.Root>
	{@render rightValue()}
</div>

<style>
	.slider-container {
		display: flex;
		gap: 4px;
		align-items: center;
	}
</style>
