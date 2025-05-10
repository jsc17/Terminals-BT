<script lang="ts">
	import { Select, type WithoutChildren } from "bits-ui";

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
</script>

<!--
TypeScript Discriminated Unions + destructing (required for "bindable") do not
get along, so we shut typescript up by casting `value` to `never`, however,
from the perspective of the consumer of this component, it will be typed appropriately.
-->

<Select.Root bind:value={value as never} {...restProps} bind:open>
	<Select.Trigger>
		<div class="select-trigger">
			<p class="select-trigger-text">{value?.length ? value : placeholder}</p>
			<img src="./icons/chevron-updown.svg" alt="expand" />
		</div>
	</Select.Trigger>
	<Select.Portal>
		<Select.Content {...contentProps}>
			<Select.ScrollUpButton><img class="select-scroll-img" src="/icons/chevron-up.svg" alt="scroll up" /></Select.ScrollUpButton>
			<Select.Viewport>
				{#each items ?? [] as { value, label, disabled, subitems } (value)}
					<Select.Item {value} {label} {disabled}>
						{#snippet children({ selected })}
							<div class="select-item">
								{#if selected}
									<img src="/icons/check.svg" alt="checkmark" />
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
										<img src="/icons/check.svg" alt="checkmark" />
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
						<Select.GroupHeading>{groupLabel}</Select.GroupHeading>
						{#each items ?? [] as { value, label, disabled, subitems } (value)}
							<Select.Item {value} {label} {disabled}>
								{#snippet children({ selected })}
									<div class="select-item">
										{#if selected}
											<img src="/icons/check.svg" alt="checkmark" />
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
												<img src="/icons/check.svg" alt="checkmark" />
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
			<Select.ScrollDownButton><img class="select-scroll-img" src="/icons/chevron-down.svg" alt="scroll down" /></Select.ScrollDownButton>
		</Select.Content>
	</Select.Portal>
</Select.Root>

<style>
	:global([data-select-trigger]) {
		height: fit-content;
		width: 100%;
		background-color: var(--muted);
		color: var(--muted-foreground);
	}
	:global(.select-trigger) {
		display: grid;
		align-items: center;
		grid-template-columns: 1fr 1.05em;
		img {
			height: 1em;
			width: 1em;
		}
	}
	:global(.select-trigger-text) {
		padding: 0px 4px;
		display: flex;
		justify-content: flex-start;
		overflow: hidden;
		text-wrap: none;
	}
	:global([data-select-viewport]) {
		max-height: 33vh;
	}
	:global([data-select-content]) {
		background-color: var(--background);
		z-index: 5;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 4px;
	}
	:global([data-select-group-label]) {
		color: var(--muted-foreground);
		margin-top: 4px;
		margin-bottom: 2px;
	}
	:global([data-highlighted][data-select-item]) {
		background-color: var(--muted);
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

		img {
			width: 15px;
		}
	}
	:global(.select-subitem) {
		display: grid;
		grid-template-columns: 15px 1fr;
		align-items: center;
		gap: 16px;
		font-size: 0.85em;
		color: var(--muted-foreground);

		img {
			width: 15px;
		}
	}
	:global([data-select-scroll-up-button], [data-select-scroll-down-button]) {
		height: 1.05em;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	:global(.select-scroll-img) {
		height: 1em;
		width: 1em;
		filter: var(--muted-filter);
	}
</style>
