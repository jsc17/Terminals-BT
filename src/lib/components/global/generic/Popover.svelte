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
