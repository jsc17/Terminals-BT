<script lang="ts">
	import type { MatchLog } from "$lib/generated/prisma/browser";
	import type { MulUnit } from "$lib/types/listTypes";
	import type { PlayList, PlayUnit } from "../../../types/types";

	type Props = {
		log: MatchLog;
		unit?: { data: PlayUnit; reference?: MulUnit; image?: string };
		player?: { id: number; team?: number; nickname: string; list?: PlayList };
	};

	let { log }: Props = $props();
</script>

<div class="log">
	<p>{log.type}</p>
</div>

<style>
	.log {
		scroll-snap-align: start;
	}
</style>
