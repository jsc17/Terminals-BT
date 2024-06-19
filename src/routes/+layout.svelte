<script lang="ts">
	import Header from "$lib/components/Header.svelte";
	import Toast from "$lib/components/Toast.svelte";
	import { appWindow } from "$lib/stores/appWindow.svelte.js";
	import { setContext } from "svelte";

	const { data, children } = $props();
	let user = $state({ username: data.username });
	setContext("user", user);

	$effect.pre(() => {
		appWindow.windowWidth = window.screen.availWidth;
		window.onresize = () => {
			appWindow.windowWidth = window.screen.availWidth;
		};
	});
</script>

<Header></Header>
<Toast></Toast>
{@render children()}

<style>
	:global(*) {
		box-sizing: border-box;
		color: var(--foreground);
		min-width: 0;
		min-height: 0;
		scrollbar-gutter: stable;
		scrollbar-color: var(--primary-muted) black;
		scrollbar-width: thin;
	}
	:global(:root) {
		--radius: 0.5rem;
		--background: hsl(20, 14.3%, 4.1%);
		--foreground: hsl(0, 0%, 83%);
		--card: hsl(24, 9.8%, 10%);
		--card-foreground: hsl(0, 0%, 95%);
		--popover: hsl(24, 10%, 20%);
		--muted: hsl(0 0% 15%);
		--muted-foreground: hsl(240 5% 64.9%);
		--border: hsl(240, 3.7%, 15.9%);
		--table-border: hsl(240, 4%, 28%);
		--primary: hsl(142, 70%, 48%);
		--primary-foreground: hsl(144.9, 80.4%, 10%);
		--primary-muted: hsl(142, 84%, 25%);
		--primary-pale: hsl(142, 62%, 67%);
		--secondary: hsl(198, 100%, 50%);
		--secondary-foreground: hsla(198, 89%, 22%, 1);
		--button: hsl(142.1, 70.6%, 45.3%);
		--button-foreground: hsl(144.9, 80.4%, 10%);
		--input: hsl(240, 3.7%, 15.9%);
		--ring: hsl(142.4, 71.8%, 29.2%);
		--muted-filter: invert(73%) sepia(9%) saturate(208%) hue-rotate(201deg) brightness(87%) contrast(89%);
		--primary-filter: invert(64%) sepia(37%) saturate(6772%) hue-rotate(105deg) brightness(111%) contrast(73%);
		--error: lightcoral;
		--error-filter: invert(20%) sepia(40%) saturate(6999%) hue-rotate(353deg) brightness(87%) contrast(108%);
		--error-foreground: black;
	}
	:global(body) {
		margin: 0;
		padding: 0;
		padding-right: 15px;
		width: 100dvw;
		min-height: 100dvh;
		overflow-x: hidden;
		background-color: var(--background);
		font-family: Arial, Helvetica, sans-serif;
		display: flex;
		flex-direction: column;
	}
	:global(a) {
		color: var(--primary);
	}
	:global(p),
	:global(h1) {
		margin: 0;
	}
	:global(button) {
		background-color: var(--button);
		color: var(--button-foreground);
		border: none;
		border-radius: var(--radius);
	}
	:global(input) {
		background-color: var(--input);
		border: 1px solid var(--border);
	}
	:global(select) {
		background-color: var(--input);
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding-left: 4px;
	}
	:global(.card) {
		background-color: var(--card);
		color: var(--card-foreground);
		border: 1px solid var(--border);
		padding: 8px;
		border-radius: var(--radius);
		width: 100%;
		box-shadow: 2px 2px rgb(0 0 0 / 0.1);
	}
	:global(dialog) {
		padding: 0;
		width: 40%;
		background-color: var(--background);
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		min-height: 40%;
		max-height: 90%;
		overflow: auto;
	}
	:global(.dialog-wide) {
		width: 90%;
		height: 90%;
		overflow: auto;
	}
	:global(.dialog-body) {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		position: relative;
		height: max(100%, 400px);
		width: 100%;
		overflow: auto;
	}
	:global(dialog::backdrop) {
		background: rgba(0, 0, 0, 0.7);
	}
	:global(.form-buttons) {
		display: flex;
		gap: 16px;
		align-items: center;
		justify-content: center;
	}
	:global(.button-icon) {
		height: 20px;
		width: 20px;
		position: relative;
	}
	:global(button:disabled) {
		background-color: var(--muted);
		color: var(--muted-foreground);
	}
	:global(.hidden) {
		display: none;
	}
	:global(.dropdown) {
		position: relative;
		display: inline-block;
	}
	:global(.dropdown-content) {
		background-color: var(--background);
		border: 2px solid var(--border);
		border-radius: var(--radius);
		padding: 16px;
		width: max-content;
		position: absolute;
	}
	:global(.dropdown-top) {
		top: 30px;
	}
	:global(.dropdown-right) {
		right: 0;
	}
	:global(.dropdown-bottom) {
		bottom: 30px;
	}
	:global(.dropdown-hidden) {
		display: none;
	}
	:global(.dropdown-shown) {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	:global(.space-between) {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	:global(.center) {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	:global(.gap8) {
		gap: 8px;
	}
	:global(.padding8) {
		padding: 8px;
	}
	:global(.inline) {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
	}
	:global(.column) {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	:global(hr) {
		width: 90%;
		border: 1px solid var(--primary);
	}
	:global(menu) {
		padding: 0;
		margin: 10px 0px;
	}
</style>
