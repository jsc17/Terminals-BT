<script lang="ts">
	import { DropdownMenu, MenuBar } from "$lib/generic";
	import type { MenuBarItem, MenuItem } from "$lib/generic/types";
	import type { Match } from "$lib/generated/prisma/browser";
	import { resetMatch, startGame } from "../../remote/matchManagement.remote";
	import { deleteMatch } from "../../remote/matchData.remote";
	import { resumeTimer, pauseTimer } from "../../remote/timer.remote";
	import { appWindow } from "$lib/stores";

	type Props = {
		matchData: Match;
		managementModalOpen: boolean;
		endRoundModalOpen: boolean;
		autodecline: boolean;
	};

	let { matchData, managementModalOpen = $bindable(), endRoundModalOpen = $bindable(), autodecline = $bindable() }: Props = $props();

	const hostMenuOptions: MenuItem[] = $derived([
		{ type: "item", label: "Manage Match", onSelect: () => (managementModalOpen = true) },
		{
			type: "check",
			label: "Auto-decline attempts to join match",
			checked: autodecline,
			onCheckedChange: (v) => {
				autodecline = v;
			}
		},
		{ type: "separator" },
		{ type: "info", label: `Match Id: ${matchData!.id}` },
		{ type: "info", label: "Join code no longer required" },
		{
			type: "item",
			label: "Delete Match",
			onSelect: () => {
				if (confirm("Delete match immediately and end without showing summary screen?")) deleteMatch(matchData!.id);
			}
		},
		{
			type: "item",
			label: "Reset Match",
			onSelect: () => {
				if (confirm("Reset match? This will remove all damage and criticals, and set the round and scores to zero")) resetMatch(matchData!.id);
			}
		}
	]);

	const menuBarItems: MenuBarItem[] = $derived([
		...((matchData.matchDuration && matchData.timeStarted
			? [
					matchData?.timePaused
						? { type: "item", label: "Resume Timer", onSelect: () => resumeTimer(matchData!.id) }
						: { type: "item", label: "Pause Timer", onSelect: () => pauseTimer(matchData!.id) }
				]
			: []) satisfies MenuBarItem[]),
		...((!matchData.currentRound
			? [{ type: "item", label: "Start Match", onSelect: () => startGame(matchData!.id) }]
			: [{ type: "item", label: "End Round", onSelect: () => (endRoundModalOpen = true) }]) satisfies MenuBarItem[]),

		{ type: "submenu", label: "Host Menu", subitems: hostMenuOptions }
	]);

	const dropdownMenuItems: MenuItem[] = $derived([
		...((matchData.matchDuration && matchData.timeStarted
			? [
					matchData?.timePaused
						? { type: "item", label: "Resume Timer", onSelect: () => resumeTimer(matchData!.id) }
						: { type: "item", label: "Pause Timer", onSelect: () => pauseTimer(matchData!.id) }
				]
			: []) satisfies MenuBarItem[]),
		...((!matchData.currentRound
			? [{ type: "item", label: "Start Match", onSelect: () => startGame(matchData!.id) }]
			: [{ type: "item", label: "End Round", onSelect: () => (endRoundModalOpen = true) }]) satisfies MenuBarItem[]),
		...hostMenuOptions
	]);
</script>

{#if !appWindow.isMobile}
	<MenuBar items={menuBarItems} />
{:else}
	<DropdownMenu items={dropdownMenuItems} triggerClasses="matchMenuButtons">
		{#snippet trigger()}
			Host Menu
		{/snippet}
	</DropdownMenu>
{/if}

<style>
	:global(.matchMenuButtons) {
		color: var(--text-color);
		padding: 8px 24px;
		border-radius: var(--radius);
		text-align: center;
		border: 1px solid var(--border);
		background-color: var(--surface-color-light);
	}
</style>
