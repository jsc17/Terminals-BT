<script lang="ts">
	import { Popover } from "bits-ui";
	import type { Options } from "$lib/playmode/types";

	type Props = {
		options: Options;
	};

	let { options = $bindable() }: Props = $props();

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger class="popover-play-toolbar-button">Settings</Popover.Trigger>
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
		<div class="option-row">
			<label><input type="checkbox" bind:checked={options.renderOriginal} /> Display Original Values when damaged</label>
		</div>
		<div class="option-row">
			<label><input type="checkbox" bind:checked={options.showPhysical} /> Show physical damage on unit card</label>
		</div>
		<div class="option-row">
			<label><input type="checkbox" bind:checked={options.showCrippled} /> Show unit crippled at half structure</label>
		</div>
		<div class="option-row">
			<label><input type="checkbox" bind:checked={options.showJumpTMM} /> Show units jump TMM</label>
		</div>
		<div class="option-row">
			<label><input type="checkbox" bind:checked={options.groupByFormation} /> Group units by formation</label>
		</div>
		<fieldset class="option-field">
			<legend>Measurement Units</legend>
			<label><input type="radio" bind:group={options.measurementUnits} value="inches" /> Inches</label>
			<label><input type="radio" bind:group={options.measurementUnits} value="hexes" /> Hexes</label>
		</fieldset>
		<fieldset class="option-field">
			<legend>Damage Pip Direction:</legend>
			<label><input type="radio" bind:group={options.damageDirection} value="left" /> Right to Left, as Blake intended</label>
			<label><input type="radio" bind:group={options.damageDirection} value="right" /> Left to Right, like a Nicholai Malthus Fanboy</label>
		</fieldset>
	</Popover.Content>
</Popover.Root>

<style>
	:global(.popover-play-toolbar-button) {
		height: 100%;
		width: 100%;
		background-color: transparent;
		border-radius: 0;
		color: var(--primary);
	}
	:global(.popover-play-toolbar-button:hover) {
		background-color: var(--surface-color-light);
		color: var(--surface-color-light-text-color);
	}
	:global(.popover-play-toolbar-display-body) {
		background-color: var(--surface-color);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 8px;
		padding: 16px;
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
