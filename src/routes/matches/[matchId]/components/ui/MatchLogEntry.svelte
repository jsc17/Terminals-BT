<script lang="ts">
	import type { MatchLog } from "$lib/generated/prisma/browser";
	import type { PlayList, PlayUnit } from "../../../types/types";

	type Props = {
		log: MatchLog;
		unit?: PlayUnit;
		submitter?: { id: number; team?: number; nickname: string; list?: PlayList };
	};

	let { log, unit, submitter }: Props = $props();

	const visibleLogs = ["MATCH_START", "ROUND_END", "UNIT_DAMAGE", "UNIT_DAMAGE_REMOVED", "UNIT_HEAT", "UNIT_CRIT", "UNIT_CRIT_REMOVED"];
</script>

{#if visibleLogs.includes(log.type)}
	<div class="log">
		{#if log.type == "MATCH_START"}
			<p class="round-header">Round 1 <span class="info">({submitter?.nickname} started the match)</span></p>
			<p class="info">{log.updated_at.toUTCString()}</p>
		{:else if log.type == "ROUND_END"}
			<p class="round-header">Round {log.round}</p>
			<p class="info">{log.updated_at.toUTCString()}</p>
		{:else if log.type == "UNIT_DAMAGE"}
			{@const damage = Number(log.details)}
			<p>
				{unit?.owner}'s {unit?.reference?.class}
				{#if unit?.data.number}
					({unit?.data.number})
				{/if} took {damage} points of damage
			</p>
			<p class="info">
				{log.updated_at.toUTCString()}
				{#if unit?.owner != submitter?.nickname}
					(applied by {submitter?.nickname})
				{/if}
			</p>
		{:else if log.type == "UNIT_DAMAGE_REMOVED"}
			<p>
				{unit?.owner}'s {unit?.reference?.class}
				{#if unit?.data.number}
					({unit?.data.number})
				{/if} removed {log.details} previously taken points of damage
			</p>
			<p class="info">
				{log.updated_at.toUTCString()}
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
				{/if} heat level set to {heat}
			</p>
			<p class="info">
				{log.updated_at.toUTCString()}
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
				{critical.at(0)?.toUpperCase() + critical!.slice(1)} critical hit
			</p>
			<p class="info">
				{log.updated_at.toUTCString()}
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
				{log.updated_at.toUTCString()}
				{#if unit?.owner != submitter?.nickname}
					(applied by {submitter?.nickname})
				{/if}
			</p>
			<!-- {:else}
		<p>{log.type}</p> -->
		{/if}
	</div>
{/if}

<style>
	.log {
		scroll-snap-align: start;
		padding: 4px 6px;
		border-bottom: 1px solid var(--border);
	}
	.round-header {
		font-weight: bold;
	}
	.info {
		font-size: 0.9em;
		color: var(--surface-color-light-text-color);
		font-style: italic;
	}
</style>
