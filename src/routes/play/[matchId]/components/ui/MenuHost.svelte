<script lang="ts">
	import { DropdownMenu } from "$lib/generic";
	import type { MenuItem } from "$lib/generic/types";
	import type { Match } from "$lib/generated/prisma/browser";
	import { resetMatch, startGame } from "../../remote/matchManagement.remote";
	import { deleteMatch } from "../../remote/matchData.remote";
	import { resumeTimer, pauseTimer } from "../../remote/timer.remote";

	type Props = {
		matchData?: Match;
		componentsOpen: { addList: boolean; management: boolean; matchLog: boolean; matchResults: boolean; matchOverAlert: boolean; endRound: boolean };
		autodecline: boolean;
	};

	let { matchData, componentsOpen, autodecline = $bindable() }: Props = $props();

	const menuOptions: MenuItem[] = $derived([
		{
			type: "item",
			label: matchData!?.currentRound == 0 ? "Start Match" : "End Round",
			onSelect: () => (matchData?.currentRound == 0 ? startGame(matchData!.id) : (componentsOpen.endRound = true))
		},
		matchData?.timePaused
			? {
					type: "item",
					label: "Resume Timer",
					onSelect: () => resumeTimer(matchData!.id)
				}
			: matchData?.timeStarted
				? {
						type: "item",
						label: "Pause Timer",
						onSelect: () => pauseTimer(matchData!.id)
					}
				: {
						type: "info",
						label: "Start match to start timer"
					},
		{ type: "separator" },
		{ type: "item", label: "Manage Match", onSelect: () => (componentsOpen.management = true) },
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
		},
		{
			type: "check",
			label: "Auto-decline attempts to join match",
			checked: autodecline,
			onCheckedChange: (v) => {
				autodecline = v;
			}
		},
		{ type: "separator" },
		{ type: "hiddenInfo", label: `Match Id`, hidden: `${matchData!.id}` },
		{ type: "info", label: "Join code no longer required. Host will now approve player joining" }
	]);
</script>

<DropdownMenu items={menuOptions} triggerClasses="detailed-button">
	{#snippet trigger()}
		Host Menu
	{/snippet}
</DropdownMenu>
