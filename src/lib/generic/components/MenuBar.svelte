<script lang="ts">
	import { Menubar } from "bits-ui";
	import type { MenuBarItem, MenuItem } from "../types";
	import { CheckIcon } from "$lib/icons";

	type Props = {
		items: MenuBarItem[];
	};

	let { items }: Props = $props();
</script>

{#snippet renderItem(item: MenuItem)}
	{#if item.type == "item"}
		<Menubar.Item class="dropdown-button" textValue={item.label} onSelect={item.onSelect}>
			{item.label}
		</Menubar.Item>
	{:else if item.type == "info"}
		<Menubar.Item class="dropdown-info" textValue={item.label}>
			{item.label}
		</Menubar.Item>
	{:else if item.type == "hiddenInfo"}
		<Menubar.Sub>
			<Menubar.SubTrigger openDelay={2000}>
				{item.label}: <span class="primary">Click or Hover to reveal</span>
			</Menubar.SubTrigger>
			<Menubar.SubContent>
				<Menubar.Item textValue={item.hidden}>
					{item.hidden}
				</Menubar.Item>
			</Menubar.SubContent>
		</Menubar.Sub>
	{:else if item.type == "check"}
		<Menubar.CheckboxItem
			class="inline center"
			bind:checked={item.checked}
			onCheckedChange={item.onCheckedChange}
			closeOnSelect={item.closeOnSelect ?? false}
			disabled={item.disabled}
		>
			<div class={{ checkbox: true, center: true, "checkbox-checked": item.checked }}>
				{#if item.checked}
					<CheckIcon fill="var(--primary)" />
				{/if}
			</div>
			{item.label}
		</Menubar.CheckboxItem>
	{:else if item.type == "radio"}
		<Menubar.RadioGroup bind:value={item.value} onValueChange={item.onValueChange}>
			<fieldset>
				<legend>{item.groupLabel}</legend>
				{#each item.radios as radio}
					<Menubar.RadioItem class="inline" value={radio.value} closeOnSelect={item.closeOnSelect} disabled={radio.disabled}>
						<div class="radio-check"></div>
						<p class="muted">{radio.label}</p>
					</Menubar.RadioItem>
				{/each}
			</fieldset>
		</Menubar.RadioGroup>
	{:else if item.type == "submenu"}
		<Menubar.Sub>
			<Menubar.SubTrigger class="dropdown-button">{item.label}</Menubar.SubTrigger>
			<Menubar.SubContent>
				{#each item.subitems as subitem}
					{@render renderItem(subitem)}
				{/each}
			</Menubar.SubContent>
		</Menubar.Sub>
	{:else if item.type == "separator"}
		<Menubar.Separator class={item.classes} />
	{:else if item.type == "number"}
		<div class="dropdown-number" data-dropdown-menu-item>
			{item.label}:
			<button
				style="margin: 0px 6px"
				onclick={() => {
					if (item.min == undefined || item.value > item.min) item.value = item.value - (item.step ?? 1);
					item.onValueChange(item.value);
				}}>-</button
			>
			{item.value}
			<button
				style="margin: 0px 6px"
				onclick={() => {
					if (item.max == undefined || item.value < item.max) item.value = item.value + (item.step ?? 1);
					item.onValueChange(item.value);
				}}>+</button
			>
		</div>
	{/if}
{/snippet}

<Menubar.Root>
	{#each items as item}
		{#if item.type == "item"}
			<button
				onclick={() => {
					if (item.onSelect) item.onSelect();
				}}
				disabled={item.disabled}><span class={{ muted: item.disabled }}>{item.label}</span></button
			>
		{:else}
			<Menubar.Menu>
				<Menubar.Trigger>
					{item.label}
				</Menubar.Trigger>
				<Menubar.Portal>
					<Menubar.Content align="start">
						{#each item.subitems as subitem}
							{@render renderItem(subitem)}
						{/each}
					</Menubar.Content>
				</Menubar.Portal>
			</Menubar.Menu>
		{/if}
	{/each}
</Menubar.Root>
