<script lang="ts">
	import { appWindow } from "$lib/global/stores/appWindow.svelte.js";
	import { type Filter } from "$lib/types/filter";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { getContext } from "svelte";
	import { Select } from "$lib/global/components/";

	type Props = {
		resultList: ResultList;
	};

	let { resultList = $bindable() }: Props = $props();

	let showFilters = $state(false);
	let showAdditionalFilters = $state(false);
	let showAbilitiesDropdown = $state(false);
</script>

{#snippet filters(filterList: Filter[])}
	<div class="filter-list">
		{#each filterList as filter}
			<div class="filter">
				<label for={filter.name}>{filter.label}</label>
				{#if filter.type == "string"}
					<input id={filter.name} type="text" bind:value={filter.value} placeholder={filter.label} />
				{:else if filter.type == "number"}
					<div class="filter-number">
						<input id={filter.name} type="number" min="0" bind:value={filter.valueMin} placeholder="min" />
						-
						<input id={filter.name + "max"} type="number" min="0" bind:value={filter.valueMax} placeholder="max" />
					</div>
				{:else if filter.type == "numberGroup"}
					<div class="inline">
						{#each filter.properties! as property, propertyIndex}
							<label for={property}>{filter.labels![propertyIndex]}</label>
							<div class="filter-number">
								<input id={property} type="number" min="0" bind:value={filter.values![propertyIndex].min} placeholder="min" />
								-
								<input id={property} type="number" min="0" bind:value={filter.values![propertyIndex].max} placeholder="max" />
							</div>
						{/each}
					</div>
				{:else if filter.type == "abilities"}
					<div class="dropdown">
						<input
							id={filter.name}
							onmouseenter={() => {
								showAbilitiesDropdown = true;
							}}
							onmouseleave={() => {
								showAbilitiesDropdown = false;
							}}
							type="text"
							bind:value={filter.value}
							placeholder={filter.label}
						/>
						<div class="dropdown-content" class:dropdown-hidden={!showAbilitiesDropdown} class:dropdown-shown={showAbilitiesDropdown}>
							<ul>
								<li>Abilities are not case-sensitive</li>
								<li>
									Enter abilities separated by comma's to search for units with all entered abilities (ex. tag,ecm will search for units that have both the TAG and ECM special
									abilities)
								</li>
								<li>Add an = before the ability to only search for an exact match. (AM will return units with AM and AMS, =AM will return only units that have AM)</li>
								<li>
									Enter abilities followed by numbers to search for values, using + or - at the end for greater than/less than (ex. jmps2 will return all units with jmpw2, and
									car4- will return all units with car4 or below)
								</li>
								<li>You can also search for values on weapon abilities (lrm2+/2+/2+ would return units that have at least 2 LRM damage at each range bracket)</li>

								<li>
									Enter abilities surrounded by parenthesis to search for units with either ability. (ex. (tag,ecm) will search for units that have either the TAG or the ECM
									special abilities. You can include as many as you want (tag, ecm, prb, rcn) and it will return units with any of them)
								</li>
								<li>
									You can use combinations of the above for detailed searchs. (ex. snarc,(lrm,srm) will search for units with SNARC, and either the LRM or SRM special abilities)
								</li>
							</ul>
						</div>
					</div>
				{:else if filter.type == "select"}
					<div class="select-filter-wrapper"><Select bind:value={filter.value} type="multiple" items={filter.possibleValues} placeholder="Any"></Select></div>
				{:else if filter.type == "movement"}
					<div class="filter-number">
						<input id={filter.name} type="number" min="0" bind:value={filter.speedMinValue} placeholder="min" />
						-
						<input id={filter.name + "max"} type="number" min="0" bind:value={filter.speedMaxValue} placeholder="max" />
					</div>
					<div class="select-filter-wrapper"><Select bind:value={filter.typeValue} type="multiple" items={filter.possibleTypeValues} placeholder="Any"></Select></div>
				{:else if filter.type == "unique"}
					<input type="checkbox" name={filter.name} id={filter.name} bind:checked={filter.checked} />
				{/if}
			</div>
		{/each}
	</div>
{/snippet}

<main>
	<button
		class="accordian"
		class:hidden={!appWindow.isNarrow}
		onclick={() => {
			showFilters = !showFilters;
		}}
	>
		<div class="space-between">
			<div></div>
			<div>Filters - {resultList.filteredList.length}/{resultList.restrictedList.length}</div>
			<div>
				{#if showFilters}
					-
				{:else}
					+
				{/if}
			</div>
		</div></button
	>

	<div class="card" class:hidden={appWindow.isNarrow && !showFilters}>
		{@render filters(resultList.filters)}
		<div class="space-between filter-buttons">
			<button
				class="backgroundless-button"
				onclick={() => {
					showAdditionalFilters = !showAdditionalFilters;
				}}
			>
				Additional Filters
				{#if showAdditionalFilters}
					-
				{:else}
					+
				{/if}
			</button>
			{#if resultList.options?.name != "noRes"}
				<label><input type="checkbox" bind:checked={resultList.filterByRules} /> Filter Results to Selected Ruleset</label>
			{/if}
			<button class="clear" onclick={() => resultList.resetFilters()}>Clear Filters</button>
		</div>
		{#if showAdditionalFilters}
			{@render filters(resultList.additionalFilters)}
		{/if}
	</div>
</main>

<style>
	main {
		width: 100%;
	}
	.filter-list {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}
	.filter {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 2px;
	}
	.filter-number {
		display: flex;
	}
	input[type="number"] {
		width: 35px;
		-moz-appearance: textfield;
		appearance: textfield;
	}
	input::-webkit-inner-spin-button,
	input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		appearance: none;
	}
	.filter-buttons {
		margin: 8px;
	}
	label {
		margin-left: 4px;
	}
	.accordian {
		width: 100%;
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		color: var(--card-foreground);
		padding: 8px;
	}
	li {
		margin-top: 6px;
	}
	input::-webkit-inner-spin-button,
	input::-webkit-outer-spin-button {
		-webkit-appearance: none;
		appearance: none;
	}
	.backgroundless-button {
		background-color: transparent;
		color: var(--primary);
	}
	.select-filter-wrapper {
		width: 5em;
	}
</style>
