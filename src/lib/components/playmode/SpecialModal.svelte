<script lang="ts">
	import { Dialog } from "$lib/components/global/";
	import { abilityReferences } from "$lib/data";
	import type { UnitAbility } from "$lib/data/abilities";
	import type { PlayUnit } from "$lib/types/playmode";

	type Props = {
		ability?: UnitAbility;
		open: boolean;
		unit: PlayUnit;
	};

	let { ability, open = $bindable(false), unit }: Props = $props();

	let abilityDetails = $derived(abilityReferences.find((reference) => reference.abbr == ability?.name));

	let disabledIndex = $derived(unit.current.disabledAbilities.findIndex((value) => value == (ability?.name ?? "")));
	function disableAbility() {
		if (disabledIndex == -1) {
			unit.current.disabledAbilities.push(ability!.name);
		} else {
			unit.current.disabledAbilities.splice(disabledIndex, 1);
		}
	}
</script>

<Dialog bind:open title={ability?.name ?? "No ability selected"}>
	<div class="special-dialog-body">
		<p class="ability-reference">{abilityDetails?.name} (<span class="italic">{abilityDetails?.page}</span>)</p>
		<div class="row">
			<button class="disable-ability-button" onclick={disableAbility}>{disabledIndex == -1 ? `Disable Ability` : `Enable Ability`}</button>
			<p class="muted">Disables abilities that have been used. (Ex. C3 Emergency Master that has been used and burnt out)</p>
		</div>
	</div>
</Dialog>

<style>
	.special-dialog-body {
		display: flex;
		flex-direction: column;
	}
	.ability-reference {
		font-size: 18px;
		padding: 16px;
		margin-bottom: 24px;
	}
	.disable-ability-button {
		width: max-content;
		height: max-content;
		padding: 4px 8px;
	}
	.row {
		display: flex;
		gap: 16px;
		align-items: center;
	}
</style>
