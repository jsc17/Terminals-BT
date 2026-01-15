<script lang="ts">
	import { setContext } from "svelte";
	import "$lib/styles/global.css";
	import "$lib/styles/generic.css";
	import "$lib/styles/theme.css";
	import "$lib/styles/animations.css";

	import { Footer, Header, Toast } from "$lib/ui";
	import { type Notification } from "$lib/generic/types.js";
	import { ModeWatcher } from "mode-watcher";
	import { IconContext } from "phosphor-svelte";
	import { innerWidth } from "svelte/reactivity/window";
	import { PersistedState } from "runed";
	import { SettingsSchema, type SettingsOutput } from "./listbuilder/types/settings.js";
	import { parse } from "valibot";

	const { data, children } = $props();
	let user = $state({ username: data.username });
	let notifications: Notification[] = $derived(data.notifications ?? []);
	setContext("user", user);

	let settings = new PersistedState<SettingsOutput>("listbuilderSettings", {
		print: {
			printStyle: "detailed",
			printFormations: true,
			printCardsByFormation: false,
			printFormationBonuses: true,
			cardStyle: "generated",
			formationHeaderStyle: "inline",
			measurementUnits: "inches",
			printReferences: true,
			printDuplicateMarkings: true,
			printDuplicateMarkingsType: "numbers"
		},
		sublistUI: {
			sublistOrientation: "vertical",
			sublistSortOrder: "pv",
			sublistPrintListSettings: {
				printStyle: "detailed",
				printFormations: true,
				printCardsByFormation: false,
				printFormationBonuses: true,
				cardStyle: "generated",
				formationHeaderStyle: "inline",
				measurementUnits: "inches",
				printReferences: true,
				printDuplicateMarkings: true,
				printDuplicateMarkingsType: "numbers"
			},
			sublistPrintAllOrientation: "vertical",
			sublistPrintAllGroupByScenario: false
		}
	});
	settings.current = parse(SettingsSchema, settings.current);
	settings.current = setContext("listbuilderSettings", settings.current);
</script>

<Toast></Toast>
<ModeWatcher defaultTheme="green" />
<IconContext values={{ size: 25, color: `var(--primary)` }}>
	<div class="main">
		<Header {notifications} />
		<div class="child-wrapper">{@render children()}</div>
		{#if innerWidth.current && innerWidth.current >= 1000}
			<Footer />
		{/if}
	</div>
</IconContext>

<style>
	.main {
		display: flex;
		flex-direction: column;
		height: 100dvh;
	}
	.child-wrapper {
		flex: 1;
		overflow: auto;
	}
	.child-wrapper:not(:last-child) {
		margin-bottom: 10px;
	}
	:global(*) {
		box-sizing: border-box;
		color: var(--text-color);
		min-width: 0;
		min-height: 0;
		scrollbar-color: var(--scrollbar-slide) var(--scrollbar-background);
		scrollbar-width: thin;
		overscroll-behavior: contain;
	}
	:global(body) {
		margin: 0;
		padding: 0;
		width: 100dvw;
		min-height: 100dvh;
		overflow-x: hidden;
		background-color: var(--background);
		font-family: Arial, Helvetica, sans-serif;
		display: flex;
		flex-direction: column;
		scrollbar-gutter: stable;
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
		color: var(--button-text-color);
		border: none;
		border-radius: var(--radius);
	}
	:global(input) {
		background-color: var(--input);
		border: 1px solid var(--border);
	}
	:global(input[type="radio"]) {
		accent-color: var(--primary);
	}
	:global(input[type="checkbox"]) {
		accent-color: var(--primary);
	}
	:global(select) {
		background-color: var(--input);
		color: var(--text-color);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding-left: 4px;
	}
	:global(dialog) {
		padding: 0;
		width: 30%;
		background-color: var(--background);
		color: var(--text-color);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		min-height: fit-content;
		max-height: 95dvh;
		max-width: 98dvw;
		overflow: auto;
		transition:
			display 0.2s allow-discrete,
			overlay 0.2s allow-discrete,
			opacity 0.2s;
		opacity: 0;

		&[open] {
			opacity: 1;

			@starting-style {
				opacity: 0;
			}
		}
	}

	:global(.dialog-wide) {
		width: 90%;
		height: 90%;
		overflow: auto;
	}
	:global(.dialog-body) {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		position: relative;
		height: max(100%, 400px);
		width: 100%;
		overflow: auto;
	}
	:global(.dialog-header) {
		display: flex;
		gap: 24px;
		align-items: center;
		justify-content: space-between;
		padding: 0px 2px 4px 2px;
		border-bottom: 1px solid var(--border);
		margin-bottom: 4px;
	}
	:global(.dialog-header h2) {
		margin: 0;
	}
	:global(dialog::backdrop) {
		background: rgba(0, 0, 0, 0.7);
	}
	@media (max-width: 500px) {
		:global(dialog) {
			width: 98dvw;
		}
		:global(.dialog-body) {
			padding: 4px;
		}
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
		background-color: var(--surface-color-light);
		color: var(--surface-color-light-text-color);
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
		max-width: 30dvw;
		position: absolute;
		z-index: 8;
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
		gap: 4px;
	}
	:global(.align-right) {
		display: flex;
		align-items: center;
		justify-content: end;
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
		margin: 0;
	}
	:global(.muted-separator) {
		border: 1px solid var(--border);
		margin: 4px 0px;
	}
	:global(.primary-span) {
		color: var(--primary);
	}
	:global(.info-text) {
		color: var(--surface-color-light-text-color);
		font-size: 0.85rem;
	}
</style>
