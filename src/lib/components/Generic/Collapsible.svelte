<script lang="ts">
	import { Collapsible, type WithoutChild } from "bits-ui";
	import type { Snippet } from "svelte";

	type Props = WithoutChild<Collapsible.RootProps> & {
		trigger?: Snippet;
	};

	let { open = $bindable(true), trigger, children, ...restProps }: Props = $props();
</script>

<Collapsible.Root bind:open>
	<Collapsible.Content>
		{@render children?.()}
	</Collapsible.Content>
</Collapsible.Root>
