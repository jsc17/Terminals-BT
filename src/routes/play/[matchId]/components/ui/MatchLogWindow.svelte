<script lang="ts">
	import type { MatchLog } from "$lib/generated/prisma/browser";
	import type { MulUnit } from "$lib/types/listTypes";
	import type { SvelteMap } from "svelte/reactivity";
	import type { PlayList, PlayUnit } from "../../../types/types";
	import MatchLogEntry from "./MatchLogEntry.svelte";

	type Props = {
		matchLogs: MatchLog[];
		matchUnits: SvelteMap<number, { data: PlayUnit; reference?: MulUnit; image?: string }>;
		playerList: { id: number; team?: number; nickname: string; list?: PlayList }[];
	};

	let { matchLogs, matchUnits, playerList }: Props = $props();
</script>

<div class="match-log">
	{#each matchLogs as log}
		<MatchLogEntry {log} unit={log.unitId ? matchUnits.get(log.unitId) : undefined} player={playerList.find((p) => p.id == log.submitterId)} />
	{/each}
</div>

<style>
	.match-log {
		height: 15%;
		flex-shrink: 0;
		border-top: 1px solid var(--primary);
		overflow: auto;
		scroll-snap-type: mandatory;
		padding: 0px 16px;
	}
</style>
