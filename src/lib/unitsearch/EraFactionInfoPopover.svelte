<script lang="ts">
	import { Popover } from "bits-ui";
</script>

<Popover.Root>
	<Popover.Trigger class="info-popover-trigger">
		<img class="info-button-icon" src="/icons/information.svg" alt="information" />
	</Popover.Trigger>
	<Popover.Content class="info-popover-content">
		<ul>
			<li>Choosing Any will return units that appear in any of the selected eras/factions</li>
			<li>
				Choosing Every will only return units that appear in <span class="primary-span">all</span> the selected eras/factions
				<ul>
					<li>
						Ex. Choosing Clan Invasion for the era, selecting Clan Ghost Bear and Clan Wolf for the factions, and then choosing Every for the faction selection will only return
						units both CGB and CW are both able to take in the Clan Invasion era
					</li>
				</ul>
			</li>
			<li>You can choose Any or Every for both era and faction separately, allowing for precise control of what you want returned.</li>
			<li><span class="primary-span">Note:</span> When using Every selection for factions, it won't show units they are both able to take from the general availability lists.</li>
		</ul>
	</Popover.Content>
</Popover.Root>

<style>
	:global(.info-popover-content) {
		background-color: var(--background);
		border-radius: var(--radius);
		border: 1px solid var(--border);
		z-index: 5;
		padding: 8px;
		margin-left: 8px;
		max-width: max(50dvw, 25em);
	}
	:global(.info-popover-content li) {
		margin-bottom: 4px;
	}
	:global(.info-popover-trigger) {
		background-color: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	:global(.info-button-icon) {
		filter: var(--surface-color-light-filter);
		height: 1em;
		width: 1em;
	}
</style>
