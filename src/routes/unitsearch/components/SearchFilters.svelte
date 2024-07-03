<script lang="ts">
	import { resultList } from "../resultList.svelte";
	import { appWindow } from "$lib/stores/appWindow.svelte.js";

	let showFilters = $state(false);
	let showAdditionalFilters = $state(false);
	let showAbilitiesDropdown = $state(false);
</script>

{#snippet filters(filterList)}
	<div class="filter-list">
		{#each filterList as filter}
			<div class="filter">
				<label for={filter.name}>{filter.label}</label>
				{#if filter.type == "string"}
					<input id={filter.name} type="text" bind:value={filter.value} placeholder={filter.label} />
				{:else if filter.type == "number"}
					<div class="filter-number">
						<input id={filter.name} type="number" min="0" bind:value={filter.value} placeholder="min" />
						-
						<input id={filter.name + "max"} type="number" min="0" bind:value={filter.maxValue} placeholder="max" />
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
								<li>
									Enter abilities separated by comma's to search for units with all entered abilities (ex. tag,ecm will search for units that have both the TAG and ECM special
									abilities)
								</li>
								<li>
									Enter abilities separated by ^ to search for units with either ability. (ex. tag^ecm will search for units that have either the TAG or the ECM special abilities)
								</li>
								<li>
									You can use combinations of the above for detailed searchs. (ex. snarc,lrm^srm will search for units with SNARC, and either the LRM or SRM special abilities)
								</li>
								<li>Abilities are not case-sensitive</li>
							</ul>
						</div>
					</div>
				{:else if filter.type == "select"}
					<select id={filter.name} bind:value={filter.value}>
						{#each filter.possible! as option}
							<option value={option.value}>{option.display}</option>
						{/each}
					</select>
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
		class:hidden={!appWindow.isMobile}
		onclick={() => {
			showFilters = !showFilters;
		}}
	>
		<div class="space-between">
			<div></div>
			<div>Filters</div>
			<div>
				{#if showFilters}
					-
				{:else}
					+
				{/if}
			</div>
		</div></button
	>

	<div class="card" class:hidden={appWindow.isMobile && !showFilters}>
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
			<button class="clear" onclick={resultList.resetFilters}>Clear Filters</button>
		</div>
		{#if showAdditionalFilters}
			{@render filters(resultList.additionalFilters)}
		{/if}
	</div>
</main>

<style>
	main {
		width: 100%;
		z-index: 2;
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
</style>
