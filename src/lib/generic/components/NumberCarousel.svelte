<script lang="ts">
	type Props = {
		defaultValue: number;
		min?: number;
		max?: number;
	};
	let { defaultValue, min = 0, max = 100 }: Props = $props();

	let value = $derived(defaultValue);
</script>

<div class="number-carousel">
	<button onclick={() => value--}>-</button>
	<input type="number" bind:value {min} {max} />
	<button onclick={() => value++}>+</button>
</div>
