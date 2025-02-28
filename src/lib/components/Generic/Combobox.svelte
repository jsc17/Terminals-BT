<script lang="ts">
	import { Combobox, type WithoutChildrenOrChild, mergeProps } from "bits-ui";
	import type { Item } from "./types";

	type Props = Combobox.RootProps & {
		items: Item[];
		inputProps?: WithoutChildrenOrChild<Combobox.InputProps>;
		contentProps?: WithoutChildrenOrChild<Combobox.ContentProps>;
	};

	let { items, value = $bindable(), open = $bindable(false), inputProps, contentProps, ...restProps }: Props = $props();

	let searchValue = $state("");

	const filteredItems = $derived.by(() => {
		if (searchValue === "") return items;
		return items.filter((item) => item.label.toLowerCase().includes(searchValue.toLowerCase()));
	});

	function handleInput(e: Event & { currentTarget: HTMLInputElement }) {
		searchValue = e.currentTarget.value;
	}

	function handleOpenChange(newOpen: boolean) {
		if (!newOpen) searchValue = "";
	}

	function handleValueChange() {
		searchValue = "";
	}
	function openContent() {
		searchValue = "";
		open = true;
	}

	const mergedRootProps = $derived(mergeProps(restProps, { onOpenChange: handleOpenChange }));
	const mergedInputProps = $derived(mergeProps(inputProps, { oninput: handleInput }));
</script>

<Combobox.Root bind:value bind:open {...mergedRootProps} onValueChange={handleValueChange}>
	<div class="combobox-input-container">
		<Combobox.Input class="combobox-input" {...mergedInputProps} onfocus={openContent} />
		<Combobox.Trigger class="combobox-trigger"><img class="combobox-img" src="/icons/chevron-updown.svg" alt="expand list chevrons" /></Combobox.Trigger>
	</div>
	<Combobox.Portal>
		<Combobox.Content class="combobox-content" {...contentProps}>
			<Combobox.ScrollUpButton class="combobox-scroll-button"><img class="combobox-scroll-img" src="/icons/chevron-up.svg" alt="scroll up" /></Combobox.ScrollUpButton>
			<Combobox.Viewport class="combobox-viewport">
				{#each filteredItems as item, i (i + item.value)}
					<Combobox.Item class="combobox-item" value={item.value} label={item.label}>
						{#snippet children({ selected })}
							{#if selected}
								<img src="/icons/check.svg" alt="checkmark" />
							{:else}
								<div></div>
							{/if}
							{item.label}
						{/snippet}
					</Combobox.Item>
				{:else}
					<span> No results found </span>
				{/each}
			</Combobox.Viewport>
			<Combobox.ScrollDownButton class="combobox-scroll-button"><img class="combobox-scroll-img" src="/icons/chevron-down.svg" alt="scroll down" /></Combobox.ScrollDownButton>
		</Combobox.Content>
	</Combobox.Portal>
</Combobox.Root>

<style>
	:global(.combobox-container) {
		display: flex;
		flex-direction: column;
		width: 100%;
	}
	:global(.combobox-input-container) {
		border-radius: var(--radius);
		background-color: var(--input);
		border: 1px solid var(--border);
		display: flex;
		align-items: center;
		flex: 1;
	}
	:global(.combobox-input) {
		flex: 1;
		background-color: transparent;
		border: none;
		padding-left: 8px;
		font-size: 16px;
	}
	:global(.combobox-trigger) {
		background-color: transparent;
		padding: 0;
	}
	:global(.combobox-content) {
		background-color: var(--background);
		z-index: 5;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 8px 8px 8px 4px;
	}
	:global(.combobox-viewport) {
		max-height: min(25em, 25dvh);
	}
	:global(.combobox-item) {
		display: grid;
		grid-template-columns: 1.25em 1fr;
		margin-top: 2px;
		img {
			height: 1em;
			width: 1em;
		}
		flex-shrink: 0;
	}
	:global(.combobox-item:hover) {
		background-color: var(--muted);
		cursor: default;
	}
	:global(.combobox-scroll-button) {
		height: 1.05em;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	:global(.combobox-scroll-img) {
		height: 1em;
		width: 1em;
		filter: var(--muted-filter);
	}
</style>
