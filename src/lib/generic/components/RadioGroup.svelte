<script lang="ts">
	import { RadioGroup, Label, type WithoutChildrenOrChild, useId } from "bits-ui";

	type Item = {
		value: string;
		label?: string;
		disabled?: boolean;
		selectedColor?: string;
	};

	type Props = WithoutChildrenOrChild<RadioGroup.RootProps> & {
		items: Item[];
		labelClasses?: string;
	};

	let { value = $bindable(""), labelClasses, ref = $bindable(null), items, ...restProps }: Props = $props();
</script>

<RadioGroup.Root bind:value bind:ref {...restProps}>
	{#each items as item}
		{@const id = useId()}
		<RadioGroup.Item {id} value={item.value} disabled={item.disabled}>
			{#snippet children({ checked })}
				<div
					class={["radio-group-button", checked && !item.selectedColor && "checked"]}
					style={`${checked && item.selectedColor ? `background-color: var(--${item.selectedColor})` : ""}`}
				></div>
			{/snippet}
		</RadioGroup.Item>
		{#if item.label}
			<Label.Root for={id} class={labelClasses}>{item.label}</Label.Root>
		{/if}
	{/each}
</RadioGroup.Root>

<style>
	.radio-group-button {
		width: 20px;
		height: 20px;
		border: 2px solid var(--border);
		border-radius: calc(infinity * 1px);
		box-sizing: border-box;
	}
	.radio-group-button:hover {
		border-color: var(--primary);
	}
	.checked {
		background-color: var(--primary);
	}
</style>
