<script lang="ts">
	import type { Snippet } from "svelte";
	import { DropdownMenu, type WithChild } from "bits-ui";
	import type { MenuItem } from "$lib/generic/types";
	import Check from "phosphor-svelte/lib/Check";

	type Props = {
		items: MenuItem[];
		open?: boolean;
		trigger?: Snippet;
		triggerClasses?: string;
		onOpenChange?: () => void;
	};

	let { items = $bindable(), open = $bindable(false), trigger, triggerClasses, onOpenChange }: Props = $props();
</script>

{#snippet renderItem(item: MenuItem)}
	{#if item.type == "item"}
		<DropdownMenu.Item class="dropdown-button" textValue={item.label} onSelect={item.onSelect}>
			{item.label}
		</DropdownMenu.Item>
	{:else if item.type == "info"}
		<DropdownMenu.Item class="dropdown-info" textValue={item.label}>
			{item.label}
		</DropdownMenu.Item>
	{:else if item.type == "check"}
		<DropdownMenu.CheckboxItem
			class="inline"
			bind:checked={item.checked}
			onCheckedChange={item.onCheckedChange}
			closeOnSelect={item.closeOnSelect ?? false}
			disabled={item.disabled}
		>
			<div class={{ checkbox: true, center: true, "checkbox-checked": item.checked }}>
				{#if item.checked}
					<Check color="dark green" />
				{/if}
			</div>
			{item.label}
		</DropdownMenu.CheckboxItem>
	{:else if item.type == "radio"}
		<DropdownMenu.RadioGroup bind:value={item.get, item.set}>
			<fieldset>
				<legend>{item.groupLabel}</legend>
				{#each item.radios as radio}
					<DropdownMenu.RadioItem class="inline" value={radio.value} closeOnSelect={radio.closeOnSelect} disabled={radio.disabled}>
						<div class="radio-check"></div>
						<p class="muted">{radio.label}</p>
					</DropdownMenu.RadioItem>
				{/each}
			</fieldset>
		</DropdownMenu.RadioGroup>
	{:else if item.type == "submenu"}
		<DropdownMenu.Sub>
			<DropdownMenu.SubTrigger>{item.label}</DropdownMenu.SubTrigger>
			<DropdownMenu.SubContent>
				{#each item.subitems as subitem}
					{@render renderItem(subitem)}
				{/each}
			</DropdownMenu.SubContent>
		</DropdownMenu.Sub>
	{:else if item.type == "separator"}
		<DropdownMenu.Separator class={item.classes} />
	{/if}
{/snippet}

<DropdownMenu.Root {onOpenChange}>
	{#if trigger}
		<DropdownMenu.Trigger class={triggerClasses}>
			{@render trigger()}
		</DropdownMenu.Trigger>
	{/if}
	<DropdownMenu.Portal>
		<DropdownMenu.Content>
			{#each items as item}
				{@render renderItem(item)}
			{/each}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
