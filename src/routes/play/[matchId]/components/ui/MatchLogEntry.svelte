<script lang="ts">
	import type { MatchLog } from "$lib/generated/prisma/browser";
	import type { SvelteMap } from "svelte/reactivity";
	import type { PlayBFS, PlayList, PlayUnit } from "../../../types/types";
	import { getBfsById } from "$lib/data/battlefieldSupport";

	type Props = {
		log: MatchLog;
		matchUnits: SvelteMap<number, PlayUnit>;
		matchBFS: SvelteMap<number, PlayBFS>;
		submitter?: { id: number; team?: number; nickname: string; list?: PlayList };
	};

	let { log, matchUnits, matchBFS, submitter }: Props = $props();

	const unit = $derived(log.unitId ? matchUnits.get(log.unitId) : undefined);

	const visibleLogs = ["MATCH_START", "ROUND_END", "UNIT_DAMAGE", "UNIT_DAMAGE_REMOVED", "UNIT_HEAT", "UNIT_CRIT", "UNIT_CRIT_REMOVED", "BFS_USED", "BFS_RESTORED"];
</script>

{#if visibleLogs.includes(log.type)}
	<div class={{log: true, "round-header": log.type == "MATCH_START" || log.type == "ROUND_END"}}>
		{#if log.type == "MATCH_START"}
			<p>Round 1</p>
			<p class="info">{log.updated_at.toLocaleTimeString()}</p>
		{:else if log.type == "ROUND_END"}
			<p>Round {log.round}</p>
			<p class="info">{log.updated_at.toLocaleTimeString()}</p>
		{:else if log.type == "UNIT_DAMAGE"}
			{@const damage = Number(log.details)}
			<p>
				{unit?.owner}'s {unit?.reference?.class}
				{#if unit?.data.number}
					({unit?.data.number})
				{/if} took {damage} points of damage <span class="pending">{log.applied ? "(Pending)" : ""}</span>
			</p>
			<p class="info">
				{log.updated_at.toLocaleTimeString()}
				{#if unit?.owner != submitter?.nickname}
					(applied by {submitter?.nickname})
				{/if}
			</p>
		{:else if log.type == "UNIT_DAMAGE_REMOVED"}
			<p>
				{unit?.owner}'s {unit?.reference?.class}
				{#if unit?.data.number}
					({unit?.data.number})
				{/if} removed {log.details} previously taken points of damage <span class="pending">{log.applied ? "(Pending)" : ""}</span>
			</p>
			<p class="info">
				{log.updated_at.toLocaleTimeString()}
				{#if unit?.owner != submitter?.nickname}
					(applied by {submitter?.nickname})
				{/if}
			</p>
		{:else if log.type == "UNIT_HEAT"}
			{@const heat = log.details as number}
			<p>
				{unit?.owner}'s {unit?.reference?.class}
				{#if unit?.data.number}
					({unit?.data.number})
				{/if} heat level set to {heat} <span class="pending">{log.applied ? "(Pending)" : ""}</span>
			</p>
			<p class="info">
				{log.updated_at.toLocaleTimeString()}
				{#if unit?.owner != submitter?.nickname}
					(applied by {submitter?.nickname})
				{/if}
			</p>
		{:else if log.type == "UNIT_CRIT"}
			{@const critical = log.details as string}
			<p>
				{unit?.owner}'s {unit?.reference?.class}
				{#if unit?.data.number}
					({unit?.data.number})
				{/if} suffered {RegExp(/[aeiou]/i).test((log.details! as string).at(0)!) ? "an" : "a"}
				{critical.at(0)?.toUpperCase() + critical!.slice(1)} critical hit <span class="pending">{log.applied ? "(Pending)" : ""}</span>
			</p>
			<p class="info">
				{log.updated_at.toLocaleTimeString()}
				{#if unit?.owner != submitter?.nickname}
					(applied by {submitter?.nickname})
				{/if}
			</p>
		{:else if log.type == "UNIT_CRIT_REMOVED"}
			{@const critical = log.details as string}

			<p>
				{unit?.owner}'s {unit?.reference?.class}
				{#if unit?.data.number}
					({unit?.data.number})
				{/if} removed a previously taken
				{critical.at(0)?.toUpperCase() + critical.slice(1)} critical hit
			</p>
			<p class="info">
				{log.updated_at.toLocaleTimeString()}
				{#if unit?.owner != submitter?.nickname}
					(applied by {submitter?.nickname})
				{/if}
			</p>
		{:else if log.type == "BFS_USED"}
				{let bfsId = $derived(matchBFS.get(Number(log.details))?.bfsId)}
			{let bfsData = $derived(bfsId != undefined ? getBfsById(bfsId) : undefined);}
			<p>
				{submitter?.nickname} used {bfsData?.name ?? "(BFS Not Found)"}
			</p>
			<p class="info">
				{log.updated_at.toLocaleTimeString()}
			</p>
		{:else if log.type == "BFS_RESTORED"}
			{let bfsId = $derived(matchBFS.get(Number(log.details))?.bfsId)}
			{let bfsData = $derived(bfsId != undefined ? getBfsById(bfsId) : undefined);}
			<p>
				{submitter?.nickname} restored a use of {bfsData?.name ?? "(BFS Not Found)"}
			</p>
			<p class="info">
				{log.updated_at.toLocaleTimeString()}
			</p>
		{:else}
			<p>{log.type}</p>
		{/if}
	</div>
{/if}

<style>
	.log {
		scroll-snap-align: start;
		padding: 4px 16px;
		border-bottom: 1px solid var(--border);
	}

	.round-header {
		background-color: var(--surface-color)
	}
	.round-header p:not(.info) {
		font-weight: bold;
		font-size: 1.15rem;
	}
	.info, .pending {
		font-size: 0.9em;
		color: var(--surface-color-light-text-color);
		font-style: italic;
	}
</style>
