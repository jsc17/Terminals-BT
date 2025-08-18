<script lang="ts">
	import type { Snippet } from "svelte";
	import { DropdownMenu, type WithChild } from "bits-ui";
	import type { MenuItem } from "$lib/types/global";

	type Props = {
		items: MenuItem[];
		open?: boolean;
		trigger?: Snippet;
		triggerClasses?: string;
	};

	let { items, open = $bindable(false), trigger, triggerClasses }: Props = $props();
</script>

<DropdownMenu.Root>
	{#if trigger}
		<DropdownMenu.Trigger class={triggerClasses}>
			{@render trigger()}
		</DropdownMenu.Trigger>
	{/if}
	<DropdownMenu.Portal>
		<DropdownMenu.Content>
			{#each items as item}
				{#if item.type == "item"}
					<DropdownMenu.Item class="dropdown-button" textValue={item.label} onSelect={item.onSelect}>
						{item.label}
					</DropdownMenu.Item>
				{:else if item.type == "separator"}
					<DropdownMenu.Separator class={item.classes} />
				{/if}
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
