<svelte:options css="injected" />

<script lang="ts">
	import type { battlefieldSupportCard } from "$lib/types/battlefieldSupport";

	type Props = { bfsData?: battlefieldSupportCard };
	let { bfsData }: Props = $props();
</script>

{#if !bfsData}
	<p>Battlefield Support Data not found</p>
{:else if bfsData.image}
	<img src={bfsData.image} class="unit-card" alt="unit card" />
{:else}
	<p>BFS Test: {bfsData.name}</p>
{/if}
