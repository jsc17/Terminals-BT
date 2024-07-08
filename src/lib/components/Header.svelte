<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { page } from "$app/stores";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import LoginModal from "./LoginModal.svelte";
	import { enhance } from "$app/forms";
	import { type ActionResult } from "@sveltejs/kit";
	import { goto } from "$app/navigation";
	import type { UnitList } from "$lib/types/list.svelte";

	let theme = $state("dark");
	let root: HTMLHtmlElement;
	let showLinksDropdown = $state(false);
	let showUserDropdown = $state(false);
	let showLoginModal = $state(false);

	let user: { username: string | undefined } = getContext("user");
	const list: UnitList = getContext("list");

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
		return async ({ result }: { result: ActionResult }) => {
			if (result.type == "success") {
				user.username = undefined;
				toastController.addToast("User logged out successfully", 2000);
				localStorage.removeItem("last-list");
				list.clear();
				goto("/");
			} else if (result.type == "failure") {
				if (result.data) {
					toastController.addToast(result.data.message);
				}
			}
		};
	}
</script>

<header>
	<nav
		class="dropdown"
		onmouseleave={() => {
			showLinksDropdown = false;
		}}
	>
		<button
			class="link-button"
			id="nav-links"
			onclick={() => {
				showLinksDropdown = !showLinksDropdown;
			}}
		>
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
			{:else if $page.url.pathname == "/changelog"}
				Changelog
			{:else if $page.url.pathname == "/settings"}
				Settings
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
			<a href="https://wolfsdragoons.com/alpha-strike-core-tournament-rules-2/" target="_blank">Wolfnet 350 Rules</a>
			<hr />
			<a href="/changelog">Changelog</a>
			<a href="https://github.com/jsc17/Terminals-BT" target="_blank">Page Source Code: Github</a>
		</div>
	</nav>
	{#if !appWindow.isNarrow}
		<h1>Terminal's 'Tech Tools</h1>
	{/if}
	<div class="inline gap8">
		{#if user.username}
			<nav
				class="dropdown"
				onmouseleave={() => {
					showUserDropdown = false;
				}}
			>
				<button
					class="link-button"
					id="nav-links"
					onclick={() => {
						showUserDropdown = !showUserDropdown;
					}}
				>
					{user.username}
					<img src="/icons/menu.svg" alt="menu" />
				</button>
				<div class="dropdown-content dropdown-right" class:dropdown-hidden={!showUserDropdown} class:dropdown-shown={showUserDropdown}>
					<a href="/settings">User Settings</a>
					<form method="post" action="/auth/?/logout" use:enhance={handleLogout} class="inline">
						<button class="link-button">Log out</button>
					</form>
				</div>
			</nav>
		{:else}
			<button
				class="link-button"
				onclick={() => {
					showLoginModal = true;
				}}>Login/Register</button
			>
		{/if}
	</div>
</header>

<LoginModal bind:showLoginModal></LoginModal>

<style>
	header {
		width: 100%;
		height: 35px;
		background-color: var(--background);
		border-bottom: 1px solid var(--border);
		padding: 8px;
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
	.dropdown-right {
		align-items: end;
	}
	a {
		text-decoration: none;
	}
</style>
