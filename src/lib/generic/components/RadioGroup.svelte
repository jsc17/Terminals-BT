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
	};

	let { value = $bindable(""), ref = $bindable(null), items, ...restProps }: Props = $props();
</script>

<RadioGroup.Root bind:value bind:ref {...restProps}>
	{#each items as item}
		{@const id = useId()}
		<div>
			<RadioGroup.Item {id} value={item.value} disabled={item.disabled}>
				{#snippet children({ checked })}
					<div
						class={["radio-group-button", checked && !item.selectedColor && "checked"]}
						style={`${checked && item.selectedColor ? `background-color: var(--${item.selectedColor})` : ""}`}
					></div>
				{/snippet}
			</RadioGroup.Item>
			<Label.Root for={id}>{item.label}</Label.Root>
		</div>
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
