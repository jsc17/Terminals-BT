<script lang="ts">
	import type { MatchLog } from "$lib/generated/prisma/browser";
	import type { SvelteMap } from "svelte/reactivity";
	import type { PlayList, PlayUnit } from "../../../types/types";
	import MatchLogEntry from "./MatchLogEntry.svelte";
	import { tick } from "svelte";

	type Props = {
		matchLogs: MatchLog[];
		matchUnits: SvelteMap<number, PlayUnit>;
		playerList: { id: number; team?: number; nickname: string; list?: PlayList }[];
	};

	let { matchLogs, matchUnits, playerList }: Props = $props();
	let logElement = $state<HTMLDivElement>();

	$effect.pre(() => {
		if (!logElement) return;
		matchLogs.length;
		tick().then(() => {
			logElement!.scrollTo(0, logElement!.scrollHeight);
		});
	});
</script>

<div class="match-log" bind:this={logElement}>
	{#each matchLogs as log}
		<MatchLogEntry {log} unit={log.unitId ? matchUnits.get(log.unitId) : undefined} submitter={playerList.find((p) => p.id == log.submitterId)} />
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
