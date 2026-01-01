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
		open: boolean;
	};

	let { matchLogs, matchUnits, playerList, open = $bindable() }: Props = $props();
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
	<div class="log-header">
		<p>Match Log</p>
		<button
			class="transparent-button"
			onclick={() => {
				open = !open;
			}}>{open ? "Hide..." : "Show ..."}</button
		>
	</div>
	{#if open}
		<div class="log-container">
			{#each matchLogs as log}
				<MatchLogEntry {log} unit={log.unitId ? matchUnits.get(log.unitId) : undefined} submitter={playerList.find((p) => p.id == log.submitterId)} />
			{/each}
		</div>
	{/if}
</div>

<style>
	.match-log {
		height: max-content;
		max-height: 15%;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
	}
	.log-header {
		flex-shrink: 0;
		background-color: var(--surface-color);
		padding: 6px 16px;
		border-top: 1px solid var(--primary);
		border-bottom: 1px solid var(--border);
		display: flex;
		gap: 24px;
	}
	.log-container {
		overflow: auto;
		scroll-snap-type: mandatory;
		padding: 0px 16px;
	}
</style>
