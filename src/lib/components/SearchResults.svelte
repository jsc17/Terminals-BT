<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import VirtualList from "$lib/VirtualList/VirtualList.svelte";
	import { enhance } from "$app/forms";
	import { type ActionResult } from "@sveltejs/kit";
	import { eras, factions } from "$lib/data/erasFactionLookup";
	import { getTextWidth } from "$lib/VirtualList/utils/utilities";
	import type { Unit } from "$lib/types/unit";
	import { ResultList } from "$lib/types/resultList.svelte";
	import type { UnitList } from "$lib/types/list.svelte";
	import { getContext } from "svelte";

	let list: UnitList = getContext("list");
	const resultList: ResultList = getContext("resultList");

	let headers = $derived(appWindow.isMobile ? ["Type", "PV", "Move", "Health"] : ["Type", "PV", "Size", "Move", "TMM", "Health (A+S)"]);

	let itemCount = $derived(resultList.filteredList.length);
	let listHeight = $state(500);
	let listWidth = $state(0);

	let itemSize = $derived.by(() => {
		return resultList.filteredList.map((unit: Unit) => {
			let lines = 1;
			let words = unit.name.split(" ");
			let currentWidth = 0;
			for (const word of words) {
				const width = getTextWidth(word);
				if (currentWidth + width > listWidth - 20) {
					lines++;
					currentWidth = width;
				} else {
					currentWidth += width;
				}
			}
			const height = 23 * lines + 30;
			return height;
		});
	});

	let availabilityDialog = $state<HTMLDialogElement>();
	let availabilityResults = $state<any[]>([]);

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
	async function showAvailability() {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type == "success") {
				const order = [...eras].map(([key, value]) => {
					return key;
				});
				availabilityResults = result.data?.unitAvailability.sort((a: any, b: any) => {
					return order.indexOf(a.era) - order.indexOf(b.era);
				});

				availabilityDialog?.showModal();
			}
		};
	}
</script>

<div class="search-results">
	<div class:result-list-header={!appWindow.isMobile} class:result-list-header-mobile={appWindow.isMobile}>
		<button class:sort-header-button={!appWindow.isMobile} class:sort-header-button-mobile={appWindow.isMobile} data-sort="name" onclick={sort} bind:clientWidth={listWidth}>
			{appWindow.isMobile ? `Name` : `Name - ${resultList.filteredList.length}/${resultList.availableList.length} results shown`}
			{#if resultList.sort.key == "name"}
				<img class="sort-selected button-icon" src={resultList.sort.order == "asc" ? "/icons/sort-ascending.svg" : "/icons/sort-descending.svg"} alt="sort" />
			{:else}
				<img class="sort button-icon" src="/icons/sort.svg" alt="sort" />
			{/if}
		</button>
		{#each headers as header}
			<button class:sort-header-button={!appWindow.isMobile} class:sort-header-button-mobile={appWindow.isMobile} data-sort={header.toLowerCase()} onclick={sort}>
				{header}
				{#if resultList.sort.key == header.toLowerCase()}
					<img class="sort-selected button-icon" src={resultList.sort.order == "asc" ? "/icons/sort-ascending.svg" : "/icons/sort-descending.svg"} alt="sort" />
				{:else}
					<img class="sort button-icon" src="/icons/sort.svg" alt="sort" />
				{/if}
			</button>
		{/each}
		<button class:sort-header-button={!appWindow.isMobile} class:sort-header-button-mobile={appWindow.isMobile}> {appWindow.isMobile ? `DMG` : `DMG S/M/L-OV`}</button>
		<button class:sort-header-button={!appWindow.isMobile} class:sort-header-button-mobile={appWindow.isMobile}></button>
	</div>
	{#if resultList.status == "waiting"}
		<div class="loading-message">Choose an Era and Faction to display available units</div>
	{:else if resultList.status == "loading"}
		<div class="loading-message">Loading. Please wait ...</div>
	{:else if resultList.status == "loaded"}
		<div class="virtual-list-container" bind:clientHeight={listHeight}>
			<VirtualList height={listHeight} width="auto" {itemCount} {itemSize}>
				{#snippet children({ style, index }: { style: string; index: number })}
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
									{appWindow.isMobile ? unit.health : unit.health + " (" + unit.armor + "+" + unit.structure + ")"}
								{/if}
							</div>
							<div class="align-center">
								{#if unit.damageS == undefined}
									-
								{:else}
									{unit.damageS}{unit.damageSMin ? "*" : ""}{"/" + unit.damageM}{unit.damageMMin ? "*" : ""}{"/" + unit.damageL}{unit.damageLMin ? "*" : ""}{" - " + unit.overheat}
								{/if}
							</div>
							{#if list}
								<div class="align-center"><button onclick={() => list.addUnit(unit)}>+</button></div>
							{:else}
								<div></div>
							{/if}
							<div class="abilities">{unit.abilities}</div>
							<form method="post" action="/?/getUnitAvailability" use:enhance={showAvailability} class="align-center">
								<input type="hidden" name="mulId" value={unit.mulId} />
								<button class="availability-button">Availability</button>
							</form>
						</div>
					{/if}
				{/snippet}
			</VirtualList>
		</div>
	{/if}
</div>

<dialog bind:this={availabilityDialog}>
	<div class="availability-dialog">
		<div class="availability-header">
			<h2>Unit availability</h2>
			<button
				onclick={() => {
					availabilityDialog?.close();
				}}>Close</button
			>
		</div>
		<div class="availability-result-container">
			{#each availabilityResults as result}
				<div class="availability-result-era">{eras.get(result.era)}:</div>
				<div>
					{result.factionList
						.map((faction: number) => {
							return factions.get(faction);
						})
						.sort()
						.join(", ")}
				</div>
				<div class="separator-line"></div>
			{/each}
		</div>
	</div>
</dialog>

<style>
	.search-results {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.result-list-header {
		display: grid;
		grid-template-columns: 1fr repeat(5, 7%) 12% 15% 5%;
		height: 25px;
	}
	.result-list-header-mobile {
		display: grid;
		grid-template-columns: 1fr repeat(4, 10%) 15% 5%;
		height: 30px;
	}
	.virtual-list-container {
		flex: 1;
	}
	.loading-message {
		padding-top: 24px;
		padding-left: 24px;
		width: 100%;
		display: flex;
		font-size: x-large;
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
		display: flex;
		flex-direction: column;
		img {
			width: 10px;
			height: 10px;
		}
		gap: 0px;
	}
	.sort {
		filter: var(--muted-filter);
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
		grid-template-columns: 1fr repeat(5, 7%) 12% 15% 3%;
		row-gap: 12px;
	}
	.virtual-list-row-mobile {
		padding: 8px;
		background-color: var(--card);
		height: 100%;
		width: 100%;
		row-gap: 12px;
		display: grid;
		grid-template-columns: 1fr repeat(4, 10%) 15% 5%;
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
		grid-column-end: -3;
	}
	.availability-button {
		padding: 4px 16px;
		background-color: transparent;
		color: var(--primary);
		border-radius: 3px;
	}
	.availability-dialog {
		display: flex;
		flex-direction: column;
	}
	.availability-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		border-bottom: 1px solid border;
	}
	.availability-result-container {
		padding: 16px;
		row-gap: 8px;
		column-gap: 24px;
		display: grid;
		grid-template-columns: min(max-content, 20%) auto;
		max-height: 90dvh;
		overflow: auto;
	}
	.availability-result-container > *:nth-child(3n) {
		grid-column: span 2;
	}
	.availability-result-era {
		display: flex;
		justify-content: end;
	}
	.separator-line {
		content: "";
		flex: 1;
		border-bottom: 1px solid var(--border);
		margin: 10px;
	}
	@supports (-webkit-touch-callout: none) {
		.availability-result-container {
			overflow: scroll;
		}
	}
</style>
