<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/stores";

	import Changelog from "./Changelog.svelte";
	import ReportModal from "./modals/ReportModal.svelte";
	import { appWindow } from "$lib/utilities/responsive.svelte";

	let theme = $state("dark");
	let root: HTMLHtmlElement;
	let showChangelog = $state(false);
	let showReportModal = $state(false);
	let showLinksDropdown = $state(false);
	let showSettingsDropdown = $state(false);

	onMount(() => {
		let defaultTheme = "dark";
		defaultTheme = localStorage.getItem("theme") ?? "dark";
		theme = defaultTheme;
		root = document.querySelector("html")!;
	});

	$effect(() => {
		localStorage.setItem("theme", theme);
		if (theme == "light") {
			root.classList.add("light");
		} else {
			root.classList.remove("light");
		}
	});
</script>

{#snippet settings()}
	<button
		class="link-button"
		on:click={() => {
			showChangelog = true;
		}}>Changelog</button>
	<button
		class="link-button"
		on:click={() => {
			showReportModal = true;
		}}>Contact me</button>
	<a href="https://github.com/jsc17/BT-Tools" target="_blank">Github</a>
{/snippet}

<header>
	<nav
		class="dropdown"
		on:mouseleave={() => {
			showLinksDropdown = false;
		}}>
		<button
			class="link-button"
			on:click={() => {
				showLinksDropdown = !showLinksDropdown;
			}}>
			<img src="/icons/menu.svg" alt="menu" />
			{#if $page.url.pathname == "/listbuilder"}
				Alpha Strike Listbuilder
			{:else if $page.url.pathname == "/as350"}
				Wolfnet 350 Listbuilder
			{:else if $page.url.pathname == "/350validation"}
				350 List Validator
			{/if}
		</button>
		<div class="dropdown-content" class:dropdown-hidden={!showLinksDropdown} class:dropdown-shown={showLinksDropdown}>
			<a href="/listbuilder">Alpha Strike Listbuilder</a>
			<a href="/as350">350 List Builder</a>
			<a href="/350validation">350 List Validator</a>
			<a href="http://masterunitlist.info" target="_blank">Master Unit List</a>
			<a href="https://wolfsdragoons.com/alpha-strike-core-tournament-rules-2/" target="_blank">350 Rules</a>
		</div>
	</nav>
	{#if !appWindow.isMobile}
		<h1>Terminal's 'Tech Tools</h1>

		<nav class="inline gap8">
			{@render settings()}
		</nav>
	{:else}
		<nav class="dropdown">
			<button
				on:click={() => {
					showSettingsDropdown = !showSettingsDropdown;
				}}>Settings</button>
			<div class="dropdown-content dropdown-right" class:dropdown-hidden={!showSettingsDropdown} class:dropdown-shown={showSettingsDropdown}>
				{@render settings()}
			</div>
		</nav>
	{/if}
</header>

<Changelog bind:showChangelog></Changelog>
<ReportModal bind:showReportModal></ReportModal>

<style>
	header {
		width: 100%;
		height: 35px;
		background-color: var(--background);
		border-bottom: 1px solid var(--border);
		padding: 8px 32px 8px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		position: sticky;
		top: 0;
		z-index: 2;
	}
	.link-button {
		img {
			height: 30px;
			width: 30px;
			filter: var(--primary-filter);
		}
		background-color: transparent;
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--primary);
		font-size: 16px;
	}
	button {
		height: 25px;
	}
</style>
