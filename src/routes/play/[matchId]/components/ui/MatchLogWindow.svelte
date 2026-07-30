<script lang="ts">
	import type { MatchLog } from "$lib/generated/prisma/browser";
	import type { SvelteMap } from "svelte/reactivity";
	import type { PlayBFS, PlayList, PlayUnit } from "../../../types/types";
	import MatchLogEntry from "./MatchLogEntry.svelte";
	import { tick } from "svelte";
	import { Drawer } from "$lib/generic";

	type Props = {
		matchLogs: MatchLog[];
		matchUnits: SvelteMap<number, PlayUnit>;
		matchBFS: SvelteMap<number, PlayBFS>;
		playerList: { id: number; team?: number; nickname: string; list?: PlayList }[];
		open: boolean;
	};

	let { matchLogs, matchUnits, matchBFS, playerList, open = $bindable() }: Props = $props();
	let logElement = $state<HTMLDivElement>();

	$effect.pre(() => {
		if (!logElement) return;
		matchLogs.length;
		tick().then(() => {
			logElement!.scrollTo(0, logElement!.scrollHeight);
		});
	});

	const visibleLogs = ["MATCH_START", "ROUND_END", "UNIT_DAMAGE", "UNIT_DAMAGE_REMOVED", "UNIT_HEAT", "UNIT_CRIT", "UNIT_CRIT_REMOVED", "BFS_USED", "BFS_RESTORED"];
</script>

<Drawer bind:open side="right" title="Match Logs">
	<div class="log-container">
		{#each matchLogs.filter((l) => visibleLogs.includes(l.type)) as log}
			<MatchLogEntry {log} {matchUnits} {matchBFS} submitter={playerList.find((p) => p.id == log.submitterId)} />
		{:else}
			<p>No actions have been taken yet</p>
		{/each}
	</div>
</Drawer>

<style>
	.log-container {
		position: relative;
		overflow: auto;
		scroll-snap-type: mandatory;
		width: 100%;
		border-top: 1px solid var(--border);
	}
	p {
		padding: 16px 16px;
	}
</style>
