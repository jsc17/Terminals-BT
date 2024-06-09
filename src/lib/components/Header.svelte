<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { page } from "$app/stores";

	import ReportModal from "./modals/ReportModal.svelte";
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import LoginModal from "./modals/LoginModal.svelte";
	import { enhance } from "$app/forms";

	let theme = $state("dark");
	let root: HTMLHtmlElement;
	let showReportModal = $state(false);
	let showLinksDropdown = $state(false);
	let showSettingsDropdown = $state(false);
	let showLoginModal = $state(false);

	let user: { username: string | undefined } = getContext("user");

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

	function handleLogout() {
		user.username = undefined;
	}
</script>

<header>
	<nav
		class="dropdown"
		on:mouseleave={() => {
			showLinksDropdown = false;
		}}>
		<button
			class="link-button"
			id="nav-links"
			on:click={() => {
				showLinksDropdown = !showLinksDropdown;
			}}>
			<img src="/icons/menu.svg" alt="menu" />
			{#if $page.url.pathname == "/"}
				Home
			{:else if $page.url.pathname == "/listbuilder"}
				Alpha Strike Listbuilder
			{:else if $page.url.pathname == "/350validation"}
				350 List Validator
			{:else if $page.url.pathname == "/tournament"}
				Tournament Dashboard
			{:else if $page.url.pathname == "/unitsearch"}
				Unit Search
			{/if}
		</button>
		<div class="dropdown-content" class:dropdown-hidden={!showLinksDropdown} class:dropdown-shown={showLinksDropdown}>
			<a href="/">Home</a>
			<hr />
			<a href="/listbuilder">Alpha Strike Listbuilder</a>
			<a href="/unitsearch">Alpha Strike Unit Search</a>

			<a href="/350validation">350 List Validator</a>
			<a href="/tournament">350 Tournament Dashboard</a>
			<hr />
			<a href="http://masterunitlist.info" target="_blank">Master Unit List</a>
			<a href="https://wolfsdragoons.com/alpha-strike-core-tournament-rules-2/" target="_blank">350 Rules</a>
		</div>
	</nav>
	{#if !appWindow.isNarrow}
		<h1>Terminal's 'Tech Tools</h1>
	{/if}
	<div class="inline gap8">
		{#if user.username}
			<form method="post" action="/auth/?/logout" use:enhance={handleLogout} class="inline">
				<p>{`Welcome, ${user.username[0].toUpperCase() + user.username.slice(1)}`}</p>
				<button class="link-button">(log out)</button>
			</form>
		{:else}
			<button
				class="link-button"
				on:click={() => {
					showLoginModal = true;
				}}>Login/Register</button>
		{/if}
		<nav
			class="dropdown"
			on:mouseleave={() => {
				showSettingsDropdown = false;
			}}>
			<button
				class="link-button"
				id="settings-links"
				on:click={() => {
					showSettingsDropdown = !showSettingsDropdown;
				}}>
				<img src="/icons/cog.svg" alt="settings menu" /></button>
			<div class="dropdown-content dropdown-right" class:dropdown-hidden={!showSettingsDropdown} class:dropdown-shown={showSettingsDropdown}>
				<!-- <button
					class="link-button"
					on:click={() => {
						showChangelog = true;
					}}>Changelog</button> -->
				<button
					class="link-button"
					on:click={() => {
						showReportModal = true;
					}}>Report Issue</button>
				<p>Page Source Code: <a href="https://github.com/jsc17/BT-Tools" target="_blank">Github</a></p>
			</div>
		</nav>
	</div>
</header>

<!-- <Changelog bind:showChangelog></Changelog> -->
<ReportModal bind:showReportModal></ReportModal>
<LoginModal bind:showLoginModal></LoginModal>

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
		z-index: 3;
		flex-shrink: 0;
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
