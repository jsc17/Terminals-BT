<script lang="ts">
	import { Slider } from "$lib/components/Generic";
	import { Popover } from "bits-ui";
	import type { Options } from "../types";

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
			UI Scale:
			<div class="slider-container">
				<Slider bind:value={options.uiScale} type="single"></Slider>
			</div>
			<p>x{(options.uiScale + 50) / 100}</p>
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
	</Popover.Content>
</Popover.Root>

<style>
	:global(.popover-play-toolbar-button) {
		padding: 12px;
		font-size: 16px;
		background-color: transparent;
		border-radius: 0;
		color: var(--card-foreground);
	}
	:global(.popover-play-toolbar-button:hover) {
		background-color: var(--muted);
		color: var(--muted-foreground);
	}
	:global(.popover-play-toolbar-display-body) {
		background-color: var(--card);
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
	.slider-container {
		width: 250px;
	}
</style>
