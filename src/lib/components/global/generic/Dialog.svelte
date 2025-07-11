<script lang="ts">
	import { Dialog, type WithoutChildren } from "bits-ui";
	import { createEventDispatcher, type Snippet } from "svelte";

	type Props = Dialog.RootProps & {
		title: string;
		description?: Snippet;
		contentProps?: WithoutChildren<Dialog.ContentProps>;
		trigger?: Snippet;
		triggerClasses?: string;
	};

	let { open = $bindable(false), children, title, description, contentProps, trigger, triggerClasses, onOpenChange, ...restProps }: Props = $props();
</script>

<Dialog.Root bind:open {...restProps} {onOpenChange}>
	{#if trigger}
		<Dialog.Trigger class={triggerClasses}>
			{@render trigger()}
		</Dialog.Trigger>
	{/if}
	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content>
			<Dialog.Title>
				{title}
				<Dialog.Close><img src="/icons/close.svg" alt="close button" class="close-button" /></Dialog.Close>
			</Dialog.Title>
			{#if description}
				<Dialog.Description>{@render description()}</Dialog.Description>
			{/if}
			<div class="dialog-children-wrapper">{@render children?.()}</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	:global([data-dialog-content]) {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		min-width: 400px;
		max-width: 99dvw;
		max-height: 95dvh;
		background-color: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		flex-direction: column;
		z-index: 50;
	}
	:global([data-dialog-overlay][data-state="open"]) {
		position: fixed;
		inset: 0;
		z-index: 10;
		background-color: rgba(0, 0, 0, 0.8);
	}
	:global([data-dialog-title]) {
		background-color: var(--background);
		display: flex;
		font-size: 1.25rem;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--border);
		padding: 16px;
	}
	:global([data-dialog-close]) {
		background-color: transparent;
	}

	:global([data-dialog-description], .dialog-children-wrapper) {
		padding: 8px 16px;
	}
	@media (max-width: 500px) {
		:global([data-dialog-title], [data-dialog-description], .dialog-children-wrapper) {
			padding: 4px;
		}
	}
	.dialog-children-wrapper {
		display: flex;
		flex-direction: column;
		height: max-content;
		overflow: auto;
	}
	.close-button {
		width: 25px;
		height: 25px;
		filter: var(--primary-filter);
	}
</style>
