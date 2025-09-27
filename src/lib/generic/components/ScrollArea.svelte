<script lang="ts">
	import { ScrollArea, type WithoutChild } from "bits-ui";

	type Props = WithoutChild<ScrollArea.RootProps> & {
		orientation: "vertical" | "horizontal" | "both";
		viewportClasses?: string;
	};

	let { ref = $bindable(null), orientation = "vertical", viewportClasses, children, ...restProps }: Props = $props();
</script>

{#snippet Scrollbar({ orientation }: { orientation: "vertical" | "horizontal" })}
	<ScrollArea.Scrollbar {orientation}>
		<ScrollArea.Thumb />
	</ScrollArea.Scrollbar>
{/snippet}

<ScrollArea.Root bind:ref {...restProps}>
	<ScrollArea.Viewport class={viewportClasses}>
		{@render children?.()}
	</ScrollArea.Viewport>
	{#if orientation === "vertical" || orientation === "both"}
		{@render Scrollbar({ orientation: "vertical" })}
	{/if}
	{#if orientation === "horizontal" || orientation === "both"}
		{@render Scrollbar({ orientation: "horizontal" })}
	{/if}
	<ScrollArea.Corner />
</ScrollArea.Root>
