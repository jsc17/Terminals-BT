<script lang="ts">
	import { Popover } from "bits-ui";
	import type { Snippet } from "svelte";

	type Props = {
		open?: boolean;
		trigger?: Snippet;
		children?: Snippet;
		title?: Snippet;
		onOpenChange?: () => void;
	};

	let { open = $bindable(false), trigger, children, title, onOpenChange }: Props = $props();

	function onFocusOutside() {
		open = false;
	}
</script>

<Popover.Root bind:open {onOpenChange}>
	<Popover.Trigger class="generic-popover-trigger">{@render trigger?.()}</Popover.Trigger>
	<Popover.Content class="generic-popover-content" {onFocusOutside}>
		{@render title?.()}
		{@render children?.()}
	</Popover.Content>
</Popover.Root>

<style>
	:global(.generic-popover-trigger) {
		height: 100%;
		border-radius: 0;
		border: none;
		background-color: transparent;
	}
	:global(.generic-popover-content) {
		background-color: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		flex-direction: column;
		margin: 0px 8px;
		max-width: max(30dvw, 600px);
		z-index: 10;
	}
	:global([data-popover-close]) {
		background-color: transparent;
		border: none;
		border-radius: 0;
	}
</style>
