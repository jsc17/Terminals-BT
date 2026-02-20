<script lang="ts">
	import { Switch } from "bits-ui";
	import type { Snippet } from "svelte";

	type Props = {
		checked: boolean;
		leftValue: Snippet;
		rightValue: Snippet;
		onCheckedChange?: () => void;
		height?: number;
		disabled?: boolean;
	};

	let { checked = $bindable(), leftValue, rightValue, onCheckedChange, height = 15, disabled = false }: Props = $props();
</script>

<div class="switch-body">
	{@render leftValue()}
	<div class="switch-container" style={`height: ${height}px`}>
		<Switch.Root bind:checked {onCheckedChange} {disabled}>
			<Switch.Thumb></Switch.Thumb>
		</Switch.Root>
	</div>
	{@render rightValue()}
</div>

<style>
	.switch-body {
		display: flex;
		gap: 4px;
		align-items: center;
	}
	.switch-container {
		container: switch / size;
		aspect-ratio: 2 / 1;
	}
</style>
