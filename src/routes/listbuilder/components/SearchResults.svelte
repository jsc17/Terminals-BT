<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { resultList } from "../resultList.svelte";
	import VirtualList from "$lib/VirtualList/VirtualList.svelte";
	import { list } from "../list.svelte"

	let { status = $bindable() } = $props();
	let headers = $derived(appWindow.isMobile ? ["Type", "PV", "Move", "Health"] : ["Type", "PV", "Size", "Move", "TMM", "Health (A+S)"]);

	let iconAsc = $derived(appWindow.isMobile ? "/icons/arrow-down-bold.svg" : "/icons/sort-ascending.svg");
	let iconDes = $derived(appWindow.isMobile ? "/icons/arrow-up-bold.svg" : "/icons/sort-descending.svg");
	let iconSort = $derived(appWindow.isMobile ? "/icons/swap-vertical.svg" : "/icons/sort.svg");

	let itemSize = 50;
	let itemCount = $derived(resultList.filteredList.length);
	let listHeight = $state(500);

	function sort(event: Event) {
		if (event.target instanceof HTMLElement) {
			const target = event.currentTarget as HTMLElement;
			const targetName = target.dataset.sort!;
			if (resultList.sort.key != targetName) {
				resultList.sort.key = targetName;
				resultList.sort.order = "asc";
			} else {
				if (resultList.sort.order == "asc") {
					resultList.sort.order = "des";
				} else {
					resultList.sort.key = "";
				}
			}
		}
	}
</script>

<div class="search-results">
	<div class:result-list-header={!appWindow.isMobile} class:result-list-header-mobile={appWindow.isMobile}>
		<button class:sort-header-button={!appWindow.isMobile} class:sort-header-button-mobile={appWindow.isMobile} data-sort="name" onclick={sort}>
			{appWindow.isMobile ? "Name" : `Name - ${resultList.filteredList.length}/${resultList.availableList.length} results shown`}
			{#if resultList.sort.key == "name"}
				<img class="sort-selected button-icon" src={resultList.sort.order == "asc" ? iconAsc : iconDes} alt="sort" />
			{:else}
				<img class="sort button-icon" src={iconSort} alt="sort" />
			{/if}
		</button>
		{#each headers as header}
			<button class:sort-header-button={!appWindow.isMobile} class:sort-header-button-mobile={appWindow.isMobile} data-sort={header.toLowerCase()} onclick={sort}>
				{header}
				{#if resultList.sort.key == header.toLowerCase()}
					<img class="sort-selected button-icon" src={resultList.sort.order == "asc" ? iconAsc : iconDes} alt="sort" />
				{:else}
					<img class="sort button-icon" src={iconSort} alt="sort" />
				{/if}
			</button>
		{/each}
		<button class:sort-header-button={!appWindow.isMobile} class:sort-header-button-mobile={appWindow.isMobile}> DMG S/M/L-OV</button>
	</div>
	<div class="virtual-list-container" bind:clientHeight={listHeight}>
		<VirtualList height={listHeight} width="auto" {itemCount} {itemSize}>
			{#snippet children({ style, index })}
				{@const unit = resultList.filteredList[index]}
				{#if unit}
					<div {style} class:virtual-list-row={!appWindow.isMobile} class:virtual-list-row-mobile={appWindow.isMobile}>
						<a href="http://masterunitlist.info/Unit/Details/{unit.mulId}" target="_blank">{unit.name}</a>
						<div class="align-center">{unit.subtype}</div>
						<div class="align-center">{unit.pv}</div>
						{#if !appWindow.isMobile}
							<div class="align-center">{unit?.size ?? "-"}</div>
						{/if}
						<div class="align-center">
							{#if unit?.move == undefined}
								-
							{:else}
								{#each unit.move as movement, index}
									{#if index != 0}
										{"/ "}
									{/if}
									{`${movement.speed}"${movement.type ?? ""}`}
								{/each}
							{/if}
						</div>
						{#if !appWindow.isMobile}
							<div class="align-center">{unit.tmm ?? "-"}</div>
						{/if}
						<div class="align-center">
							{#if unit.health == undefined}
								-
							{:else}
								{unit.health + " (" + unit.armor + "+" + unit.structure + ")"}
							{/if}
						</div>
						<div class="align-center">
							{#if unit.damageS == undefined}
								-
							{:else}
								{unit.damageS}{unit.damageSMin ? "*" : ""}{"/" + unit.damageM}{unit.damageMMin ? "*" : ""}{"/" + unit.damageL}{unit.damageLMin ? "*" : ""}{" - " + unit.overheat}
							{/if}
						</div>
						<div class="align-center"><button onclick={() => list.addUnit(unit)}>+</button></div>
						<div class="abilities">{unit.abilities}</div>
						<!-- <div class="align-center factions">Availability</div> -->
					</div>
				{/if}
			{/snippet}
		</VirtualList>
	</div>
</div>

<style>
	.search-results {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.result-list-header {
		display: grid;
		grid-template-columns: 1fr repeat(5, 7%) 12% 15% 2%;
	}
	.result-list-header-mobile {
		display: grid;
		grid-template-columns: 1fr repeat(4, 7%) 15% 2%;
	}
	.virtual-list-container {
		flex: 1;
	}
	.sort-header-button,
	.sort-header-button-mobile {
		background-color: var(--card);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--foreground);
		height: 100%;
		width: 100%;
		gap: 4px;
		border: 1px solid var(--border);
		border-radius: 0%;
	}
	.sort-header-button-mobile {
		img {
			width: 10px;
			height: 10px;
		}
		gap: 0px;
	}
	:global(.sort-selected) {
		filter: var(--primary-filter);
	}
	.virtual-list-row {
		padding: 8px;
		background-color: var(--card);
		height: 100%;
		width: 100%;
		display: grid;
		grid-template-columns: 1fr repeat(5, 7%) 12% 15%;
		row-gap: 12px;
	}
	.virtual-list-row-mobile {
		display: grid;
		grid-template-columns: 1fr repeat(4, 7%) 15%;
	}
	.virtual-list-row:not(:last-child),
	.virtual-list-row-mobile:not(:last-child) {
		border-bottom: 1px solid var(--border);
	}
	.align-center {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.abilities {
		font-size: 0.75rem;
		display: flex;
		align-items: center;
		grid-column-start: 1;
		grid-column-end: -2;
	}
	.factions {
		color: var(--primary);
		display: flex;
		align-items: center;
	}
</style>
