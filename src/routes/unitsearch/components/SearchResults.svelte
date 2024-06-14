<script lang="ts">
	import { appWindow } from "$lib/utilities/responsive.svelte";
	import { resultList } from "../resultList.svelte";

	let { status = $bindable() } = $props();
	let headers = $derived(appWindow.isMobile ? ["Type", "PV", "Move", "Health"] : ["Type", "PV", "Size", "Move", "TMM", "Health (A+S)"]);

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

<table>
	<colgroup>
		<col />
		<col style="width:7%" />
		<col style="width:7%" />
		{#if !appWindow.isMobile}
			<col style="width:7%" />
		{/if}
		<col style="width:7%" />
		<col style="width:7%" />
		{#if !appWindow.isMobile}
			<col style="width:12%" />
		{/if}
		<col style="width:15%" />
	</colgroup>
	<thead>
		<tr>
			<th>
				<div class="table-header">
					{#if !appWindow.isMobile}
						<button class="sort-header-button" data-sort="name" onclick={sort}>
							Name - <em>{resultList.filtered.length}/{resultList.results.length} results shown</em>
							{#if resultList.sort.key == "name"}
								{#if resultList.sort.order == "asc"}
									<img class="sort-selected button-icon" src="/icons/sort-ascending.svg" alt="sort" />
								{:else}
									<img class="sort-selected button-icon" src="/icons/sort-descending.svg" alt="sort" />
								{/if}
							{:else}
								<img class="sort button-icon" src="/icons/sort.svg" alt="sort" />
							{/if}
						</button>
					{:else}
						<button class="sort-header-button-mobile" data-sort="name" onclick={sort}>
							<p>Name</p>
							{#if resultList.sort.key == "name"}
								{#if resultList.sort.order == "asc"}
									<img class="sort-selected button-icon" src="/icons/arrow-down-bold.svg" alt="sort" />
								{:else}
									<img class="sort-selected button-icon" src="/icons/arrow-up-bold.svg" alt="sort" />
								{/if}
							{:else}
								<img class="sort button-icon" src="/icons/swap-vertical.svg" alt="sort" />
							{/if}
						</button>
					{/if}
				</div>
			</th>
			{#each headers as header}
				<th>
					<div class="table-header">
						{#if !appWindow.isMobile}
							<button class="sort-header-button" data-sort={header.toLowerCase()} onclick={sort}>
								{header}
								{#if resultList.sort.key == header.toLowerCase()}
									{#if resultList.sort.order == "asc"}
										<img class="sort-selected button-icon" src="/icons/sort-ascending.svg" alt="sort" />
									{:else}
										<img class="sort-selected button-icon" src="/icons/sort-descending.svg" alt="sort" />
									{/if}
								{:else}
									<img class="sort button-icon" src="/icons/sort.svg" alt="sort" />
								{/if}
							</button>
						{:else}
							<button class="sort-header-button-mobile" data-sort={header.toLowerCase()} onclick={sort}>
								{header}
								{#if resultList.sort.key == header.toLowerCase()}
									{#if resultList.sort.order == "asc"}
										<img class="sort-selected button-icon" src="/icons/arrow-down-bold.svg" alt="sort" />
									{:else}
										<img class="sort-selected button-icon" src="/icons/arrow-up-bold.svg" alt="sort" />
									{/if}
								{:else}
									<img class="sort button-icon" src="/icons/swap-vertical.svg" alt="sort" />
								{/if}
							</button>
						{/if}
					</div>
				</th>
			{/each}
			<th><div class="table-header">DMG S/M/L-OV</div></th>
		</tr>
	</thead>
	{#if status == "loaded"}
		<tbody>
			{#each resultList.filtered as unit}
				<tr class="stats" class:mobile-cell={appWindow.isMobile}>
					<td><a href="http://masterunitlist.info/Unit/Details/{unit.mulId}" target="_blank">{unit.name}</a></td>
					<td class="align-center">{unit.type}</td>
					<td class="align-center">{unit.pv}</td>
					{#if !appWindow.isMobile}
						<td class="align-center">{unit.size ?? "-"}</td>
					{/if}
					<td class="align-center">
						{#if unit.move == undefined}
							-
						{:else}
							{#each unit.move as movement, index}
								{#if index != 0}
									{"/ "}
								{/if}
								{`${movement.speed}"${movement.type ?? ""}`}
							{/each}
						{/if}
					</td>
					{#if !appWindow.isMobile}
						<td class="align-center">{unit.tmm ?? "-"}</td>
					{/if}
					<td class="align-center">
						{#if unit.health == undefined}
							-
						{:else}
							{unit.health + " (" + unit.armor + "+" + unit.structure + ")"}
						{/if}
					</td>
					<td class="align-center">
						{#if unit.damageS == undefined}
							-
						{:else}
							{unit.damageS}{unit.damageSMin ? "*" : ""}{"/" + unit.damageM}{unit.damageMMin ? "*" : ""}{"/" + unit.damageL}{unit.damageLMin ? "*" : ""}{" - " + unit.overheat}
						{/if}
					</td>
				</tr>
				<tr class="abilities" class:mobile-cell={appWindow.isMobile}>
					<td colspan="9">{unit.abilities}</td>
				</tr>
			{/each}
		</tbody>
	{/if}
</table>

{#if status == "waiting"}
	<p>Choose an Era and faction to display results</p>
{:else if status == "loading"}
	<p>Loading results. Please wait.</p>
{:else if status == "error"}
	<p>No results. Possibly an invalid Era and Faction</p>
{/if}

<style>
	table {
		width: 100%;
		max-height: 100%;
		border-collapse: collapse;
		background-color: var(--card);
		overflow: auto;
		position: relative;
	}

	th {
		border: 1px solid var(--border);
		background-color: var(--card);
		height: 100%;
	}
	.table-header {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.75rem;
		height: 100%;
		width: 100%;
		gap: 0px;
	}
	.sort-header-button {
		background-color: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--foreground);
		height: 100%;
		width: 100%;
		gap: 4px;
	}
	.sort-header-button-mobile {
		img {
			width: 10px;
			height: 10px;
		}
		background-color: transparent;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--foreground);
		height: 100%;
		width: 100%;
		gap: 0px;
	}
	td {
		padding: 5px;
	}
	.align-center {
		text-align: center;
	}
	.abilities {
		font-size: 0.75em;
		border-bottom: 1px solid var(--border);
	}
	.abilities td {
		padding-left: 15px;
	}
	.sort {
		filter: var(--muted-filter);
	}
	.mobile-cell {
		font-size: 0.75rem;
	}
	:global(.sort-selected) {
		filter: var(--primary-filter);
	}
</style>
