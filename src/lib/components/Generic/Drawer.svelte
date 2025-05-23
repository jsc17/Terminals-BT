<script lang="ts">
	import { onClickOutside } from "runed";
	import type { Snippet } from "svelte";

	type Props = {
		open: boolean;
		children: Snippet;
		side?: "left" | "right";
	};

	let { open = $bindable(), children, side = "left" }: Props = $props();
	let drawer = $state<HTMLElement>();

	onClickOutside(
		() => drawer,
		() => (open = closed)
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
	<button class="transparent-button" onclick={() => (open = false)} aria-label="Close user menu sidebar"
		><img class="close-button" src="/icons/close.svg" alt="close button" /></button
	>
	{@render children()}
</div>

<style>
	.drawer {
		position: fixed;
		top: 0;
		width: min(20em, 90%);
		height: 100%;
		z-index: 10;
		display: flex;
		flex-direction: column;
		background-color: var(--background);
		padding: 16px;
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
	.close-button {
		width: 30px;
		height: 30px;
		filter: var(--primary-filter);
		align-self: flex-end;
	}
	.transparent-button {
		width: fit-content;
		padding: 16px;
		align-self: flex-end;
	}
</style>
