<script lang="ts">
	import type { Match } from "$lib/generated/prisma/browser";
	import { onMount } from "svelte";

	type Props = {
		matchData?: Match;
	};

	let { matchData }: Props = $props();

	let interval = $state<NodeJS.Timeout>();

	const totalDurationMs = $derived((matchData?.matchDuration ?? 0) * 60 * 1000);
	let remainingMS = $state<number>();
	const remainingMinutes = $derived(Math.floor((remainingMS ?? totalDurationMs) / 60000));
	const remainingSeconds = $derived(
		Math.floor(((remainingMS ?? totalDurationMs) % 60000) / 1000)
			.toString()
			.padStart(2, "0")
	);

	function calculateRemainingMs() {
		if (remainingMS == 0) return;
		if (!matchData?.timeStarted) {
			remainingMS = totalDurationMs;
			return;
		}
		if (matchData.timePaused && remainingMS !== undefined) return;

		const elapsed = Date.now() - matchData!.timeStarted!.getTime() - matchData!.timePausedDurationMs;
		remainingMS = Math.max(0, totalDurationMs - elapsed);
	}

	$effect(() => {
		if (!matchData?.timeStarted) {
			remainingMS = undefined;
			return;
		}
		calculateRemainingMs();

		interval = setInterval(calculateRemainingMs, 250);
		return () => clearInterval(interval);
	});
</script>

{#if matchData?.matchDuration}
	{#if remainingMS != undefined}
		<p class={{ paused: matchData.timePaused, ended: remainingMS == 0 }}>{remainingMinutes}:{remainingSeconds}</p>
	{:else}
		<p>{matchData?.matchDuration}:00</p>
	{/if}
{/if}

<style>
	.paused {
		color: yellow;
		animation: blink 1s infinite;
	}
	.ended {
		color: red;
		animation: blink 1s infinite;
	}

	@keyframes blink {
		0% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 1;
		}
	}
</style>
