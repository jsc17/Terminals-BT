<script lang="ts">
	import { Dialog } from "$lib/components/global/";
	import { abilityReferences } from "$lib/data";
	import type { UnitAbility } from "$lib/data/abilities";

	type Props = {
		ability?: UnitAbility;
		open: boolean;
	};

	let { ability, open = $bindable(false) }: Props = $props();

	let abilityDetails = $derived(abilityReferences.find((reference) => reference.abbr == ability?.name));
</script>

<Dialog bind:open title={ability?.name ?? "No ability selected"}>
	<p>{abilityDetails?.name} (<span class="italic">{abilityDetails?.page}</span>)</p>
</Dialog>

<style>
	p {
		font-size: 18px;
		padding: 16px;
	}
</style>
