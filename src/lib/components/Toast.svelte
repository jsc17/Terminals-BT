<script lang="ts">
	import { toastController } from "$lib/stores/toastController.svelte";
	import { fade } from "svelte/transition";

	let toastControllerElement: HTMLElement;
	$effect(() => {
		if (toastController.toasts.size) {
			toastControllerElement.showPopover();
		} else {
			setTimeout(() => {
				toastControllerElement.hidePopover();
			}, 500); //delay popover closing to allow toast fade transition to run
		}
	});
</script>

<main bind:this={toastControllerElement} id="toast-controller" popover="manual">
	<div class="toast-container">
		{#each toastController.toasts.entries() as [id, toast]}
			<div
				class="toast"
				style={`background: linear-gradient(to left, var(--primary) ${toast.background - 3}%, var(--primary-pale) ${toast.background + 3}%)`}
				transition:fade={{ duration: 300 }}>
				{toast.message}
				{#if toast.dismissable}
					<button
						onclick={() => {
							toastController.dismissToast(id);
						}}>X</button>
				{/if}
			</div>
		{/each}
	</div>
</main>

<style>
	main {
		position: fixed;
		width: 70%;
		margin: 25px auto;
		left: 0;
		right: 0;
		background-color: transparent;
		border: none;
	}
	.toast-container {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.toast {
		border: 1px solid var(--primary-foreground);
		color: var(--primary-foreground);
		/* background-color: var(--primary); stlye set inline for animation. Probably a more correct way to do it, but I'll look into it later if I don't forget */
		padding: 16px;
		border-radius: var(--radius);
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
