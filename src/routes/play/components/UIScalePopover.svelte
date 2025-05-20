<script lang="ts">
	import { Slider } from "$lib/components/Generic";
	import { Popover } from "bits-ui";

	type Props = {
		uiScale: number;
	};

	let { uiScale = $bindable() }: Props = $props();

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger class="popover-play-toolbar-button">UI Scale</Popover.Trigger>
	<Popover.Content>
		<div class="slider-row">
			<div class="slider-container">
				<Slider bind:value={uiScale} type="single"></Slider>
			</div>
			<p>x{(uiScale + 50) / 100}</p>
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
	.slider-row {
		margin-top: 8px;
		display: flex;
		gap: 16px;
		align-items: center;
		padding: 16px;
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	.slider-container {
		width: 250px;
	}
</style>
