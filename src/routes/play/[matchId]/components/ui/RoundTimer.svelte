<script lang="ts">
	import type { Match } from "$lib/generated/prisma/browser";
	import { watch } from "runed";

	type Props = {
		matchData?: Match;
	};

	let { matchData }: Props = $props();

	let interval = $state<NodeJS.Timeout>();

	const totalDurationMs = $derived((matchData?.matchDuration ?? 0) * 60 * 1000);
	let remainingMS = $state<number>();
	const remainingHours = $derived(Math.floor((remainingMS ?? totalDurationMs) / 3600000));
	const remainingMinutes = $derived(
		Math.floor(((remainingMS ?? totalDurationMs) % 3600000) / 60000)
			.toString()
			.padStart(2, "0")
	);
	const remainingSeconds = $derived(
		Math.floor(((remainingMS ?? totalDurationMs) % 60000) / 1000)
			.toString()
			.padStart(2, "0")
	);

	function calculateRemainingMs() {
		if (!matchData?.timeStarted) {
			clearInterval(interval);
			remainingMS = totalDurationMs;
			return;
		}

		if (matchData.timePaused && remainingMS !== undefined) return;

		const elapsed = Date.now() - matchData!.timeStarted!.getTime() - matchData!.timePausedDurationMs;
		remainingMS = Math.max(0, totalDurationMs - elapsed);

		if (remainingMS == 0 || matchData.timeEnded) clearInterval(interval);
	}

	watch.pre(
		() => matchData?.timeStarted,
		() => {
			calculateRemainingMs();
			interval = setInterval(calculateRemainingMs, 250);
		}
	);
</script>

{#if matchData?.matchDuration}
	<p class={{ paused: matchData.timePaused, ended: remainingMS == 0 }}>{remainingHours}:{remainingMinutes}:{remainingSeconds}</p>
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
