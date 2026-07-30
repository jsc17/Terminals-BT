<script lang="ts">
	import { CloseIcon } from "$lib/icons";
	import { onClickOutside, watch } from "runed";
	import type { Snippet } from "svelte";

	type Props = {
		open: boolean;
		children: Snippet;
		side?: "left" | "right";
		title?: string;
	};

	let { open = $bindable(), children, side = "left", title }: Props = $props();
	let drawer = $state<HTMLElement>();

	const closeListener = onClickOutside(
		() => drawer,
		() => (open = closed),
		{ immediate: false }
	);

	watch(
		() => open,
		() => {
			if (open) {
				closeListener.start();
			} else {
				closeListener.stop();
			}
		}
	);
</script>

<div
	bind:this={drawer}
	class="drawer"
	class:drawer-left={side == "left"}
	class:show-drawer-left={side == "left" && open}
	class:drawer-right={side == "right"}
	class:show-drawer-right={side == "right" && open}
>
	<div class="inline">
		<button class="transparent-button" onclick={() => (open = false)} aria-label="Close Drawer"><CloseIcon fill="var(--primary)" width="25" height="25" /></button>
		<h2>{title}</h2>
	</div>
	{@render children()}
</div>

<style>
	.drawer {
		position: fixed;
		top: 0;
		width: min(75%, 500px);
		height: 100%;
		z-index: 100;
		display: flex;
		flex-direction: column;
		background-color: var(--background);
		z-index: 100;
	}
	.drawer-left {
		left: -100%;
		transition: left 300ms ease-in-out;
		border-right: 2px solid var(--border);
	}
	.show-drawer-left {
		left: 0;
	}
	.drawer-right {
		right: -100%;
		transition: right 300ms ease-in-out;
		border-left: 2px solid var(--border);
	}
	.show-drawer-right {
		right: 0;
	}
	.transparent-button {
		width: fit-content;
		padding: 16px;
	}
	h2 {
		margin: 0;
		color: var(--surface-color-light-text-color);
	}
</style>
