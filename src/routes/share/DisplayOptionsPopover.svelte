<script lang="ts">
	import { Popover } from "bits-ui";
	import type { PlaymodeOptionsOutput } from "$routes/play/schema/playmode";

	type Props = {
		options: PlaymodeOptionsOutput;
	};

	let { options = $bindable() }: Props = $props();

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger class="detailed-button">Settings</Popover.Trigger>
	<Popover.Content class="popover-play-toolbar-display-body">
		<div class="option-row">
			Cards per row: <button
				class="card-button"
				onclick={() => {
					if (options.cardsPerRow > 1) options.cardsPerRow--;
				}}>-</button
			>
			{options.cardsPerRow}
			<button class="card-button" onclick={() => options.cardsPerRow++}>+</button>
		</div>
		<fieldset class="option-field">
			<legend>Measurement Units</legend>
			<label><input type="radio" bind:group={options.measurementUnits} value="inches" /> Inches</label>
			<label><input type="radio" bind:group={options.measurementUnits} value="hexes" /> Hexes</label>
		</fieldset>
	</Popover.Content>
</Popover.Root>

<style>
	:global(.popover-play-toolbar-display-body) {
		background-color: var(--surface-color);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 8px;
		padding: 16px;
		z-index: 10;
	}
	.option-row {
		display: flex;
		gap: 16px;
		align-items: center;
	}
	.option-field {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--primary-dark);
	}
</style>
