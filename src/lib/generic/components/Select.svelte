<script lang="ts">
	import { Select, type WithoutChildren } from "bits-ui";
	import { CaretUpDown, CaretUp, CaretDown, Check } from "phosphor-svelte";

	type Item = {
		value: string;
		label: string;
		disabled?: boolean;
		subitems?: Item[];
	};

	type Props = WithoutChildren<Select.RootProps> & {
		placeholder?: string;
		items?: Item[];
		groupedItems?: { groupLabel: string; items: Item[] }[];
		contentProps?: WithoutChildren<Select.ContentProps>;
		// any other specific component props if needed
	};

	let { value = $bindable(), items, groupedItems, contentProps, placeholder, ...restProps }: Props = $props();
	let open = $state(false);

	let valueString = $derived.by(() => {
		if (!value || !value.length) {
			return placeholder;
		}
		if (restProps.type == "single") {
			for (const item of items ?? []) {
				if (item.value == value) {
					return item.label;
				}
				for (const subitem of item.subitems ?? []) {
					if (subitem.value == value) {
						return subitem.label;
					}
				}
			}
			for (const group of groupedItems ?? []) {
				for (const item of group.items) {
					if (item.value == value) {
						return item.label;
					}
					for (const subitem of item.subitems ?? []) {
						if (subitem.value == value) {
							return subitem.label;
						}
					}
				}
			}
		} else {
			const selectedLabels = [];
			for (const tempValue of value) {
				for (const item of items ?? []) {
					if (item.value == tempValue) {
						selectedLabels.push(item.label);
					}
					for (const subitem of item.subitems ?? []) {
						if (subitem.value == tempValue) {
							selectedLabels.push(subitem.label);
						}
					}
				}
				for (const group of groupedItems ?? []) {
					for (const item of group.items) {
						if (item.value == tempValue) {
							selectedLabels.push(item.label);
						}
						for (const subitem of item.subitems ?? []) {
							if (subitem.value == tempValue) {
								selectedLabels.push(subitem.label);
							}
						}
					}
				}
			}
			return selectedLabels.join(", ");
		}
	});
</script>

<!--
TypeScript Discriminated Unions + destructing (required for "bindable") do not
get along, so we shut typescript up by casting `value` to `never`, however,
from the perspective of the consumer of this component, it will be typed appropriately.
-->

<Select.Root bind:value={value as never} {...restProps} bind:open>
	<Select.Trigger>
		<div class="select-trigger">
			<p class="select-trigger-text">{valueString}</p>
			<CaretUpDown color="var(--text-color)" size="15" />
		</div>
	</Select.Trigger>
	<Select.Portal>
		<Select.Content {...contentProps}>
			<Select.ScrollUpButton><CaretUp size="15" color="var(--text-color)" /></Select.ScrollUpButton>
			<Select.Viewport>
				{#each items ?? [] as { value, label, disabled, subitems } (value)}
					<Select.Item {value} {label} {disabled}>
						{#snippet children({ selected })}
							<div class="select-item">
								{#if selected}
									<Check size="15" color="var(--text-color)" />
								{:else}
									<div></div>
								{/if}
								{label}
							</div>
						{/snippet}
					</Select.Item>
					{#each subitems ?? [] as { value, label, disabled } (value)}
						<Select.Item {value} {label} {disabled}>
							{#snippet children({ selected })}
								<div class="select-subitem">
									{#if selected}
										<Check size="15" color="var(--text-color)" />
									{:else}
										<div></div>
									{/if}
									{label}
								</div>
							{/snippet}
						</Select.Item>
					{/each}
				{/each}
				{#each groupedItems ?? [] as { groupLabel, items }}
					<Select.Group>
						{#if groupLabel != ""}
							<Select.GroupHeading>{groupLabel}</Select.GroupHeading>
						{/if}
						{#each items ?? [] as { value, label, disabled, subitems } (value)}
							<Select.Item {value} {label} {disabled}>
								{#snippet children({ selected })}
									<div class="select-item">
										{#if selected}
											<Check size="15" color="var(--text-color)" />
										{:else}
											<div></div>
										{/if}
										{label}
									</div>
								{/snippet}
							</Select.Item>
							{#each subitems ?? [] as { value, label, disabled } (value)}
								<Select.Item {value} {label} {disabled}>
									{#snippet children({ selected })}
										<div class="select-subitem">
											{#if selected}
												<Check size="15" color="var(--text-color)" />
											{:else}
												<div></div>
											{/if}
											{label}
										</div>
									{/snippet}
								</Select.Item>
							{/each}
						{/each}
					</Select.Group>
				{/each}
			</Select.Viewport>
			<Select.ScrollDownButton><CaretDown size="15" color="var(--text-color)" /></Select.ScrollDownButton>
		</Select.Content>
	</Select.Portal>
</Select.Root>

<style>
	:global([data-select-trigger]) {
		height: fit-content;
		width: 100%;
		background-color: var(--input);
		color: var(--surface-color-light-text-color);
	}
	:global(.select-trigger) {
		display: grid;
		align-items: center;
		grid-template-columns: 1fr 1.05em;
	}
	:global(.select-trigger-text) {
		padding: 0px 4px;
		display: flex;
		justify-content: flex-start;
		overflow: hidden;
		text-wrap: none;
		color: var(--surface-color-light-text-color);
		height: 1.25em;
	}
	:global([data-select-viewport]) {
		max-height: 33vh;
	}
	:global([data-select-content]) {
		background-color: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 4px;
		z-index: 60;
	}
	:global([data-select-group-label]) {
		color: var(--surface-color-light-text-color);
		margin-top: 4px;
		margin-bottom: 2px;
	}
	:global([data-highlighted][data-select-item]) {
		background-color: var(--surface-color-light);
	}
	:global([data-select-item]) {
		border-radius: var(--radius);
	}
	:global(.select-item) {
		display: grid;
		grid-template-columns: 15px 1fr;
		align-items: center;
		gap: 4px;
		font-size: 0.95em;
	}
	:global(.select-subitem) {
		display: grid;
		grid-template-columns: 15px 1fr;
		align-items: center;
		gap: 16px;
		font-size: 0.85em;
		color: var(--surface-color-light-text-color);
	}
	:global([data-select-scroll-up-button], [data-select-scroll-down-button]) {
		height: 1.05em;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
