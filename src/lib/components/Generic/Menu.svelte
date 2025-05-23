<script lang="ts">
	import { type Snippet } from "svelte";

	type Props = {
		children: Snippet;
		img?: string;
		text?: string;
		trigger?: Snippet;
	};

	let { text, children, img, trigger }: Props = $props();
	let showMenuBar = $state(false);
</script>

<menu class="dropdown">
	<button
		onclick={() => {
			showMenuBar = !showMenuBar;
		}}
	>
		{#if trigger}
			{@render trigger()}
		{:else if text}
			<div class="menu-button">{text}</div>
		{:else if img}
			<div class="menu-button"><img class="menu-image" src={img} alt="Context menu icon" /></div>
		{:else}
			<div class="menu-button">menu</div>
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
		background-color: var(--primary);
		display: flex;
		font-size: 16px;
		min-width: 40px;
		align-items: center;
		justify-content: center;
		color: black;

		& img {
			height: 20px;
			width: 20px;
			filter: invert(0%) sepia(6%) saturate(24%) hue-rotate(244deg) brightness(93%) contrast(105%);
		}
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
