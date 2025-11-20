<script lang="ts">
	import type { PlayUnit } from "../../../types/types";
	import { getCritNameFromCode } from "../../utilities/playmodeUtilities";
	import { Dialog } from "$lib/generic/";

	type Props = {
		unit: PlayUnit;
	};

	let { unit }: Props = $props();


</script>

<Dialog title="Remove Critical">
	{#snippet trigger()}
		Remove Criticals
	{/snippet}

	{#snippet description()}
		<p>
			Remove previously suffered criticals. <span class="error"
				>NOTE: critical order can matter, and there is currently no way to readd a critical to the middle of the list. Proceed with caution.</span
			>
		</p>
	{/snippet}


</Dialog>

<style>

</style>
