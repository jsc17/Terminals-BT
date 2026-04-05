<script lang="ts">
	import { Popover, type PopoverContentProps } from "bits-ui";
	import type { Snippet } from "svelte";

	type Props = {
		open?: boolean;
		trigger?: Snippet;
		children?: Snippet;
		title?: Snippet;
		onOpenChange?: () => void;
		contentProps?: PopoverContentProps;
		triggerClasses?: string;
	};

	let { open = $bindable(false), trigger, children, title, onOpenChange, contentProps, triggerClasses = "generic-popover-trigger" }: Props = $props();
</script>

<Popover.Root bind:open {onOpenChange}>
	<Popover.Trigger class={triggerClasses}>{@render trigger?.()}</Popover.Trigger>
	<Popover.Content class="generic-popover-content" {...contentProps}>
		{@render title?.()}
		{@render children?.()}
	</Popover.Content>
</Popover.Root>
