<script lang="ts">
	import { Select, type WithoutChildren } from "bits-ui";

	type Props = WithoutChildren<Select.RootProps> & {
		placeholder?: string;
		items?: { value: string; label: string; disabled?: boolean }[];
		groupedItems?: { label: string; items: { value: string; label: string; disabled?: boolean }[] }[];
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
			{value}
			<img src="./icons/chevron-updown.svg" alt="expand" />
		</div>
	</Select.Trigger>
	<Select.Portal>
		<Select.Content {...contentProps}>
			<Select.ScrollUpButton>up</Select.ScrollUpButton>
			<Select.Viewport>
				{#each items ?? [] as { value, label, disabled } (value)}
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
				{/each}
				{#each groupedItems ?? [] as { label: groupLabel, items }}
					<Select.Group>
						<Select.GroupHeading>{groupLabel}</Select.GroupHeading>
						{#each items ?? [] as { value, label, disabled } (value)}
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
						{/each}
					</Select.Group>
				{/each}
			</Select.Viewport>
			<Select.ScrollDownButton>down</Select.ScrollDownButton>
		</Select.Content>
	</Select.Portal>
</Select.Root>

<style>
	:global([data-select-trigger]) {
		height: fit-content;
		width: min(15em, 33%);
		background-color: var(--muted);
		color: var(--muted-foreground);
	}
	:global(.select-trigger) {
		display: flex;
		align-items: center;
		justify-content: space-between;
		img {
			height: 1em;
		}
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
		padding-left: 24px;
	}
</style>
