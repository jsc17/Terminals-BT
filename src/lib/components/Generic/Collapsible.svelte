<script lang="ts">
	import { Collapsible, type WithoutChild } from "bits-ui";
	import type { Snippet } from "svelte";

	type Props = WithoutChild<Collapsible.RootProps> & {
		trigger?: Snippet;
	};

	let { open = $bindable(false), trigger, children, ...restProps }: Props = $props();
</script>

<Collapsible.Root bind:open>
	{#if trigger}
		<Collapsible.Trigger>
			{@render trigger()}
		</Collapsible.Trigger>
	{/if}
	<Collapsible.Content>
		{@render children?.()}
	</Collapsible.Content>
</Collapsible.Root>
