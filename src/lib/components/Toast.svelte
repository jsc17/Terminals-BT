<script lang="ts">
	import { toastController } from "$lib/stores/toastController.svelte";
	import { fade } from "svelte/transition";
</script>

<main>
	{#each toastController.toasts.entries() as [id, toast]}
		<div class="toast" transition:fade={{ duration: 300 }}>
			{toast.message}
			{#if toast.dismissable}
				<button
					onclick={() => {
						toastController.dismissToast(id);
					}}>X</button>
			{/if}
		</div>
	{/each}
</main>

<style>
	main {
		position: fixed;
		width: 70%;
		margin: 25px auto;
		left: 0;
		right: 0;
		z-index: 100;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.toast {
		border: 1px solid var(--primary-foreground);
		background-color: var(--primary);
		color: var(--primary-foreground);
		padding: 16px;
		border-radius: var(--radius);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
