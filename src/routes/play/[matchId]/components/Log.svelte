<script lang="ts">
	import { Drawer } from "$lib/generic";
	import type { PlayList } from "$lib/playmode/types";
	import type { LogRound, LogEntry } from "$lib/playmode/types";

	type Props = {
		open: boolean;
		currentRoundLog: LogRound;
		fullLogs: LogRound[];
		playList: PlayList;
	};

	let { open = $bindable(), currentRoundLog, fullLogs, playList }: Props = $props();
	let undoDisabled = $derived.by(() => {
		let undoDisabled = false;
		for (const log of currentRoundLog.logs) {
			if (log.damageUndone != undefined) undoDisabled = true;
		}
		if (!undoDisabled) {
			for (const round of fullLogs) {
				for (const log of round.logs) {
					if (log.damageUndone != undefined) {
						undoDisabled = true;
					}
				}
			}
		}
		return undoDisabled;
	});
	function handleUndo(log: LogEntry) {
		if (undoDisabled) return;

		const unit = playList.units.find(({ id }) => {
			return log.unitId == id;
		});
		if (!unit) {
			alert("Unit not found");
			return;
		}
		if (!log.undone) {
			if (log.damageTaken) {
				if (log.applied) {
					unit.current.damage -= log.damageTaken;
				} else {
					unit.pending.damage -= log.damageTaken;
				}
			} else if (log.crit) {
				if (log.applied) {
					log.crit.index = unit.current.crits.findIndex(({ id }) => {
						return id == log.crit?.id;
					});
					unit.current.crits.splice(log.crit.index, 1);
				} else {
					log.crit.index = unit.pending.crits.findIndex(({ id }) => {
						return id == log.crit?.id;
					});
					unit.pending.crits.splice(log.crit.index, 1);
				}
			} else if (log.damageUndone) {
				unit.current.damage += log.damageUndone;
			}
			log.undone = true;
		} else {
			if (log.damageTaken) {
				if (log.applied) {
					unit.current.damage += log.damageTaken;
				} else {
					unit.pending.damage += log.damageTaken;
				}
			} else if (log.crit) {
				if (log.applied) {
					unit.current.crits.splice(log.crit.index ?? unit.current.crits.length - 1, 0, { id: log.crit.id, type: log.crit.type });
				} else {
					unit.pending.crits.splice(log.crit.index ?? unit.current.crits.length - 1, 0, { id: log.crit.id, type: log.crit.type });
				}
			} else if (log.damageUndone) {
				unit.current.damage -= log.damageUndone;
			}
			log.undone = false;
		}
	}
</script>

<Drawer bind:open side={"right"}>
	<div class="log-body">
		{#each fullLogs as previousRound}
			<div class="log-round">
				<div class="log-header">Round {previousRound.round}</div>
				{#if previousRound.logs.length}
					{#each previousRound.logs as log}
						<div class="log-entry">
							<p class="log-text" class:strikethrough={log.undone}>
								<span class="muted">{log.unitName} suffered:</span>
								{#if log.damageTaken}{log.damageTaken} damage{/if}{log.crit?.name}
								{#if log.damageUndone}{log.damageUndone} damage removed{/if}
								{#if !log.applied}(<span class="italic">pending</span>){/if}
							</p>
							{#if !undoDisabled}<button class="undo-button" onclick={() => handleUndo(log)}>{log.undone ? "redo" : "undo"}</button>{/if}
						</div>
					{/each}
				{:else}
					<div class="log-entry"><p class="log-text">No actions taken</p></div>
				{/if}
			</div>
		{/each}
		<div class="log-round">
			<div class="log-header">Round {currentRoundLog.round}</div>
			{#if currentRoundLog.logs.length}
				{#each currentRoundLog.logs as log}
					<div class="log-entry">
						<p class="log-text" class:strikethrough={log.undone}>
							<span class="muted">{log.unitName} suffered:</span>
							{#if log.damageTaken}{log.damageTaken} damage{/if}{log.crit?.name}
							{#if log.damageUndone}{log.damageUndone} damage removed{/if}
							{#if !log.applied}(<span class="italic">pending</span>){/if}
						</p>
						{#if !undoDisabled}<button class="undo-button" onclick={() => handleUndo(log)}>{log.undone ? "redo" : "undo"}</button>{/if}
					</div>
				{/each}
			{:else}
				<div class="log-entry"><p class="log-text">No actions taken</p></div>
			{/if}
		</div>
	</div>
</Drawer>

<style>
	.log-body {
		padding: 4px;
		width: min(400px, 90dvw);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.log-round {
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	.log-header {
		background-color: var(--muted);
		border-bottom: 1px solid var(--border);
		padding: 8px;
	}
	.log-entry {
		display: flex;
		gap: 6px;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--border);
		margin: 0px 16px;
		padding: 8px 0px;
	}
	.log-entry:hover {
		background-color: var(--muted);

		p {
			color: var(--muted-foreground);
		}
	}
	.log-text {
		font-size: 0.9em;
	}
	.strikethrough {
		text-decoration: line-through solid var(--muted-foreground);
		font-style: italic;
	}
	.undo-button {
		background-color: transparent;
		color: var(--muted-foreground);
	}
	.undo-button:hover {
		cursor: pointer;
	}
	.muted {
		color: var(--muted-foreground);
	}
</style>
