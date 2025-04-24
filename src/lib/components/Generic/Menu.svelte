<script lang="ts">
	import { type Snippet } from "svelte";
	let { text, children, img }: { text?: string; children: Snippet; img?: string } = $props();
	let showMenuBar = $state(false);
</script>

<menu class="dropdown">
	<button
		class="menu-button"
		onclick={() => {
			showMenuBar = !showMenuBar;
		}}
	>
		{#if text}
			{text}
		{:else if img}
			<img class="menu-image" src={img} alt="Context menu icon" />
		{:else}
			menu
		{/if}
	</button>
	<div
		class="dropdown-content dropdown-right"
		class:dropdown-hidden={!showMenuBar}
		class:dropdown-shown={showMenuBar}
		onfocusout={() => {
			showMenuBar = false;
		}}
	>
		{@render children()}
	</div>
	<div
		class="overlay"
		onclick={() => {
			showMenuBar = false;
		}}
		aria-hidden="true"
	></div>
</menu>

<style>
	.menu-button {
		img {
			height: 20px;
			width: 20px;
			filter: invert(0%) sepia(6%) saturate(24%) hue-rotate(244deg) brightness(93%) contrast(105%);
		}
		background-color: var(--primary);
		display: flex;
		font-size: 16px;
		min-width: 40px;
		align-items: center;
		justify-content: center;
	}
	.overlay {
		display: none;
		background: rgba(0, 0, 0, 0);
		position: fixed;
		inset: 0;
		z-index: 7;
		height: 100dvh;
		width: 100dvw;
	}
	:global(.dropdown-shown ~ .overlay) {
		display: block;
	}
</style>
