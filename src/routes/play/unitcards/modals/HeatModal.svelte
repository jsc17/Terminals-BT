<script lang="ts">
	import { Dialog } from "$lib/components/Generic";
	import type { MulUnit, PlayUnit } from "$lib/types/unit";
	import { watch } from "runed";

	type Props = {
		unit: PlayUnit;
		open: boolean;
		reference: MulUnit;
	};

	let { unit, open = $bindable(false), reference }: Props = $props();

	let newHeatLevel = $state(0);

	watch(
		() => open,
		() => {
			if (open) {
				newHeatLevel = unit.current.heat;
			}
		}
	);

	function setNewLevel(newLevel: number) {
		if (newLevel >= 0 && 4 >= newLevel) {
			newHeatLevel = newLevel;
		}
	}

	function applyHeat() {
		if (newHeatLevel < 0) newHeatLevel = 0;
		if (newHeatLevel > 4) newHeatLevel = 4;
		unit.current.heat = newHeatLevel;
		open = false;
	}
</script>

<Dialog bind:open title={`Heat ${reference.name}`}>
	<div class="heat-modal-body">
		<div class="heatscale">
			New Heat Level:
			<button class="heat-level heat-level-first" class:heat-level-1={newHeatLevel >= 1} onclick={() => setNewLevel(0)}>0</button>
			<button class="heat-level" class:heat-level-1={newHeatLevel >= 1} onclick={() => setNewLevel(1)}>1</button>
			<button class="heat-level" class:heat-level-2={newHeatLevel >= 2} onclick={() => setNewLevel(2)}>2</button>
			<button class="heat-level" class:heat-level-3={newHeatLevel >= 3} onclick={() => setNewLevel(3)}>3</button>
			<button class="heat-level heat-level-last" class:heat-level-4={newHeatLevel >= 4} onclick={() => setNewLevel(4)}>S</button>
		</div>
		<div class="heat-buttons">
			<button
				style="background-color: aqua;"
				onclick={() => {
					setNewLevel(0);
				}}>Remove all heat</button
			>
			<button
				style="background-color:aquamarine;"
				onclick={() => {
					setNewLevel(newHeatLevel - 1);
				}}>Remove one heat</button
			>
			<button
				class="heat-level-2"
				onclick={() => {
					setNewLevel(newHeatLevel + 1);
				}}>Add one heat</button
			>
		</div>
		<div class="apply-buttons">
			<button onclick={applyHeat}>Apply Now</button>
			<div class="temp-div">
				<button disabled>Apply At End of Round <br /> (not implemented yet)</button>
			</div>
		</div>
	</div>
</Dialog>

<style>
	.heat-modal-body {
		margin-top: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.apply-buttons {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 24px;
		margin-top: 16px;

		button {
			padding: 8px;
			font-size: 18px;
		}
	}
	.heatscale {
		display: flex;
		align-items: center;
		font-size: 24px;
		justify-content: center;
	}
	.heat-level {
		border-radius: 0%;
		background-color: rgb(158, 158, 158);
		border: 1px solid black;
		font-weight: bold;
		color: white;
		text-shadow:
			-1px -1px 0 black,
			1px -1px 0 black,
			-1px 1px 0 black,
			1px 1px 0 black;
		text-align: center;
		font-size: 20px;
		padding: 8px 16px;
	}
	.heat-level-first {
		margin-left: 4px;
		border-top-left-radius: var(--radius);
		border-bottom-left-radius: var(--radius);
	}
	.heat-level-last {
		border-top-right-radius: var(--radius);
		border-bottom-right-radius: var(--radius);
	}
	.heat-buttons {
		width: 100%;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;

		button {
			padding: 8px;
			font-size: 18px;
		}
	}
	.heat-level-1 {
		background-color: yellow;
	}
	.heat-level-2 {
		background-color: orange;
	}
	.heat-level-3 {
		background-color: orangered;
	}
	.heat-level-4 {
		background-color: red;
	}
</style>
