<script lang="ts">
	import { Dialog, type WithoutChildren } from "bits-ui";
	import { type Snippet } from "svelte";
	import { CloseIcon } from "$lib/icons";

	type Props = Dialog.RootProps & {
		title: string;
		description?: Snippet;
		contentProps?: WithoutChildren<Dialog.ContentProps>;
		trigger?: Snippet;
		triggerClasses?: string;
		cancelClose?: () => boolean;
	};

	let { open = $bindable(false), children, title, description, contentProps, trigger, triggerClasses, onOpenChange, cancelClose, ...restProps }: Props = $props();

	let contentHeight = $state<number>();
</script>

<Dialog.Root bind:open {...restProps} {onOpenChange}>
	{#if trigger}
		<Dialog.Trigger class={triggerClasses}>
			{@render trigger()}
		</Dialog.Trigger>
	{/if}
	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content {...contentProps}>
			<Dialog.Title>
				{title}
				<Dialog.Close
					onclick={(event) => {
						if (cancelClose && cancelClose()) event.preventDefault();
					}}
				>
					<CloseIcon fill="var(--primary)" width="25" height="25" />
				</Dialog.Close>
			</Dialog.Title>
			{#if description}
				<Dialog.Description>{@render description()}</Dialog.Description>
			{/if}
			<div class="height-wrapper" style="height: {contentHeight}px;">
				<div class="dialog-children-wrapper" bind:offsetHeight={contentHeight}>{@render children?.()}</div>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	:global([data-dialog-content]) {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		min-width: min(400px, 99dvw);
		width: max-content;
		max-width: 99dvw;
		max-height: 95dvh;
		background-color: var(--background);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		z-index: 50;
		display: flex;
		flex-direction: column;
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
		border-radius: var(--radius) var(--radius) 0 0;
	}
	:global([data-dialog-close]) {
		background-color: transparent;
		box-shadow: none;
		padding: 0;
	}

	:global([data-dialog-description], .dialog-children-wrapper) {
		padding: clamp(4px, 1dvh, 8px) clamp(4px, 1dvw, 16px);
	}
	:global([data-dialog-description]) {
		text-wrap: wrap;
		width: fit-content;
	}

	.height-wrapper {
		transition:
			height 0.3s ease-in-out,
			width 0.3s ease-in-out;
		overflow: auto;
		scrollbar-gutter: stable;
	}
	.dialog-children-wrapper {
		display: flex;
		flex-direction: column;
		overflow: auto;
	}
</style>
