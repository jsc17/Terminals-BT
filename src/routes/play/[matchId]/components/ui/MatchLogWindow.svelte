<script lang="ts">
	import type { MatchLog } from "$lib/generated/prisma/browser";
	import type { SvelteMap } from "svelte/reactivity";
	import type { PlayBFS, PlayList, PlayUnit } from "../../../types/types";
	import MatchLogEntry from "./MatchLogEntry.svelte";
	import { tick } from "svelte";
	import { Drawer } from "$lib/generic";
	import { CloseIcon } from "$lib/icons";

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

	let matchLogsOpen = $state(false);
</script>

<button onclick={() => (matchLogsOpen = true)}>Match Logs</button>

<Drawer bind:open={matchLogsOpen} side="right">
	<div class="log-container">
		{#each matchLogs as log}
			<MatchLogEntry {log} {matchUnits} {matchBFS} submitter={playerList.find((p) => p.id == log.submitterId)} />
		{/each}
	</div>
</Drawer>

<style>
	/* .match-log {
		height: 100%;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		z-index: 15;
	}
	.log-header {
		flex-shrink: 0;
		background-color: var(--surface-color);
		padding: 6px 16px;
		border-top: 1px solid var(--primary);
		border-bottom: 1px solid var(--border);
		display: flex;
		gap: 24px;
	} */
	.log-container {
		position: relative;
		overflow: auto;
		scroll-snap-type: mandatory;
		width: 33dvw;
		border-top: 1px solid var(--border);
	}
</style>
