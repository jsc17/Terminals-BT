<script lang="ts">
	import { DropdownMenu, MenuBar } from "$lib/generic";
	import type { MenuBarItem, MenuItem } from "$lib/generic/types";
	import type { Match } from "$lib/generated/prisma/browser";
	import { resetMatch, startGame } from "../../remote/matchManagement.remote";
	import { deleteMatch } from "../../remote/matchData.remote";
	import { resumeTimer, pauseTimer } from "../../remote/timer.remote";

	type Props = {
		matchData: Match;
		componentsOpen: { addList: boolean; management: boolean; matchLog: boolean; matchResults: boolean; matchOverAlert: boolean; endRound: boolean };
		autodecline: boolean;
	};

	let { matchData, componentsOpen, autodecline = $bindable() }: Props = $props();

	const hostMenuOptions: MenuItem[] = $derived([
		{ type: "item", label: "Manage Match", onSelect: () => (componentsOpen.management = true) },
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
		{ type: "info", label: "Join code no longer required. Host will now approve player joining" },
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

	const menubarItems: MenuBarItem[] = $derived([
		...((matchData.matchDuration && matchData.timeStarted
			? [
					matchData?.timePaused
						? { type: "item", label: "Resume Timer", onSelect: () => resumeTimer(matchData!.id) }
						: { type: "item", label: "Pause Timer", onSelect: () => pauseTimer(matchData!.id) }
				]
			: []) satisfies MenuBarItem[]),
		...((!matchData.currentRound
			? [{ type: "item", label: "Start Match", onSelect: () => startGame(matchData!.id) }]
			: [{ type: "item", label: "End Round", onSelect: () => (componentsOpen.endRound = true) }]) satisfies MenuBarItem[]),

		{ type: "submenu", label: "Host Menu", subitems: hostMenuOptions }
	]);
</script>

<MenuBar items={menubarItems} />
