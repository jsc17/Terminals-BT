<script lang="ts">
	import { getContext } from "svelte";
	import { toastController, appWindow } from "$lib/stores";
	import { LoginModal, NotificationPopover } from "$lib/ui/";
	import { type ActionResult } from "@sveltejs/kit";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import { enhance } from "$app/forms";
	import type { List } from "$lib/types/list.svelte";
	import type { Notification } from "$lib/generic/types";
	import { SvelteMap } from "svelte/reactivity";

	type Props = {
		notifications: Notification[];
	};

	let { notifications }: Props = $props();

	let navbar = $state<HTMLElement>();
	let openNavButton = $state<HTMLButtonElement>();
	let openUserButton = $state<HTMLButtonElement>();
	let loginModal = $state<LoginModal>();
	let userMenu = $state<HTMLMenuElement>();

	const pageList = $state(
		new SvelteMap([
			["/", "Home"],
			["/about", "About"],
			["/listbuilder", "Alpha Strike Listbuilder"],
			["/unitsearch", "Unit Search"],
			["/changelog", "Change Log"],
			["/settings", "Settings"],
			["/play", "Digital List"],
			["/validation", "List Validation"],
			["/collection", "Collection Manager"]
		])
	);

	let user: { username: string | undefined } = getContext("user");
	const list: List = getContext("list");

	function openNav() {
		navbar?.classList.add("show");
		openNavButton?.setAttribute("aria-expanded", "true");
		navbar?.removeAttribute("inert");
	}

	function closeNav() {
		navbar?.classList.remove("show");
		openNavButton?.setAttribute("aria-expanded", "false");
		navbar?.setAttribute("inert", "");
	}

	function openUserMenu() {
		userMenu?.classList.add("show");
		openUserButton?.setAttribute("aria-expanded", "true");
		userMenu?.removeAttribute("inert");
	}

	function closeUserMenu() {
		userMenu?.classList.remove("show");
		openUserButton?.setAttribute("aria-expanded", "false");
		userMenu?.setAttribute("inert", "");
	}

	function handleLogout() {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type == "success") {
				user.username = undefined;
				toastController.addToast("User logged out successfully", 2000);
				localStorage.removeItem("last-list");
				if (list) {
					list.clear();
				}
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
	<button bind:this={openNavButton} class="link-button" onclick={openNav} aria-label="Open navigation sidebar" aria-expanded="false" aria-controls="navbar">
		<img src="/icons/menu.svg" alt="menu" />
		{pageList.get(page.url.pathname)}
	</button>
	<nav bind:this={navbar} id="navbar">
		<button class="link-button close-menu-button" onclick={closeNav} aria-label="Close navigation sidebar"><img src="/icons/close.svg" alt="close button" /></button>
		<ul>
			<li><a href="/" aria-current={page.url.pathname === "/"} onclick={closeNav}>Home</a></li>
			<li><a href="/about" aria-current={page.url.pathname === "/"} onclick={closeNav}>About</a></li>
			<hr />
			<li><a href="/listbuilder" aria-current={page.url.pathname === "/listbuilder"} onclick={closeNav}>Alpha Strike Listbuilder</a></li>
			<li><a href="/unitsearch" aria-current={page.url.pathname === "/unitsearch"} onclick={closeNav}>Alpha Strike Unit Search</a></li>
			<li><a href="/play" aria-current={page.url.pathname === "/play"} onclick={closeNav}>Alpha Strike Digital List</a></li>
			<li><a href="/validation" aria-current={page.url.pathname === "/validation"} onclick={closeNav}>Tournament List Validator</a></li>
			<li><a href="/collection" aria-current={page.url.pathname === "/collection"} onclick={closeNav}>Collection Manager</a></li>
			<hr />
			<li><a href="http://masterunitlist.info" target="_blank">Master Unit List</a></li>
			<li><a href="https://wolfsdragoons.com/alpha-strike-core-tournament-rules-2/" target="_blank">Wolfnet 350 Rules</a></li>
			<hr />
			<li><a href="/changelog" aria-current={page.url.pathname === "/changelog"} onclick={closeNav}>Changelog</a></li>
			<li><a href="https://github.com/jsc17/Terminals-BT" target="_blank">Page Source Code: Github</a></li>
		</ul>
	</nav>
	{#if !appWindow.isNarrow}
		<h1>Terminal's 'Tech Tools</h1>
	{/if}
	{#if user.username}
		<div class="user-buttons">
			<NotificationPopover {notifications} />
			<button class="link-button" onclick={openUserMenu}>
				{user.username}
				<img src="/icons/settings.svg" alt="settings" />
			</button>
		</div>
		<menu bind:this={userMenu} id="usermenu">
			<button class="link-button close-user-button" onclick={closeUserMenu} aria-label="Close user menu sidebar"><img src="/icons/close.svg" alt="close button" /></button>
			<ul>
				<li><a href="/settings" onclick={closeUserMenu}>User Settings</a></li>
				<li>
					<form method="post" action="/auth/?/logout" use:enhance={handleLogout} class="inline user-logout">
						<button class="link-button" onclick={closeUserMenu}>Log out</button>
					</form>
				</li>
			</ul>
		</menu>
	{:else}
		<button
			class="link-button"
			onclick={() => {
				loginModal?.show();
			}}>Login/Register</button
		>
	{/if}
	<div
		class="overlay"
		onclick={() => {
			closeNav();
			closeUserMenu();
		}}
		aria-hidden="true"
	></div>
</header>

<LoginModal bind:this={loginModal}></LoginModal>

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
		flex-shrink: 0;
		z-index: 10;
	}
	.link-button {
		& img {
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
	nav,
	menu {
		position: fixed;
		top: 0;
		background-color: var(--background);
		height: 100dvh;
		width: min(20em, 90%);
		z-index: 11;
		display: flex;
		flex-direction: column;
	}
	nav {
		left: -100%;
		transition: left 300ms ease-in-out;
		border-right: 2px solid var(--border);
	}
	menu {
		right: -100%;
		transition: right 300ms ease-in-out;
		border-left: 2px solid var(--border);
	}
	:global(nav.show) {
		left: 0;
	}
	:global(menu.show) {
		right: 0;
	}

	nav ul,
	menu ul {
		list-style: none;
		padding: 0;
	}
	nav a,
	menu a {
		display: flex;
		text-decoration: none;
		padding: 1em 2em;
		transition: background-color 500ms ease;
	}
	nav a:hover,
	menu a:hover,
	.user-logout:hover {
		background-color: var(--muted);
		cursor: pointer;
	}
	.user-logout button {
		padding: 1em 2em;
		width: 100%;
		cursor: pointer;
	}

	.close-menu-button,
	.close-user-button {
		margin: 8px 8px 0px 0px;
		background-color: transparent;
	}
	.close-menu-button {
		align-self: flex-end;
	}
	.close-user-button {
		align-self: flex-start;
	}
	.close-menu-button img,
	.close-user-button img {
		height: 35px;
		width: 35px;
		filter: var(--primary-filter);
	}
	.overlay {
		display: none;
		background: rgba(0, 0, 0, 0.5);
		position: fixed;
		inset: 0;
		z-index: 10;
		height: 100dvh;
		width: 100dvw;
	}
	:global(menu.show ~ .overlay, nav.show ~ .overlay) {
		display: block;
	}
	.user-buttons {
		display: flex;
		align-items: center;
		gap: 16px;
	}
</style>
