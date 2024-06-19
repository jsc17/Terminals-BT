<script lang="ts">
	import { type Snippet } from "svelte";
	let { text, children, img }: { text?: string; children: Snippet; img?: string } = $props();
	let showMenuBar = $state(false);
</script>

<menu
	class="dropdown"
	onmouseleave={() => {
		showMenuBar = false;
	}}>
	<button
		class="link-button"
		id="nav-links"
		onclick={() => {
			showMenuBar = !showMenuBar;
		}}>
		{#if text}
			{text}
		{:else if img}
			<img class="menu-image" src={img} alt="Context menu icon" />
		{:else}
			menu
		{/if}
	</button>
	<div class="dropdown-content dropdown-right" class:dropdown-hidden={!showMenuBar} class:dropdown-shown={showMenuBar}>
		{@render children()}
	</div>
</menu>

<style>
	menu {
		margin: 4px 0px;
	}
	.link-button {
		img {
			height: 20px;
			width: 20px;
		}
		background-color: var(--primary);
		display: flex;
		font-size: 16px;
		min-width: 40px;
		align-items: center;
		justify-content: center;
	}
</style>
