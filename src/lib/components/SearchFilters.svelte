<script lang="ts">
	import { resultList } from "$lib/utilities/resultList.svelte.js";
	import { appWindow } from "$lib/utilities/responsive.svelte.js";

	let showFilters = $state(false);
	let showAbilitiesDropdown = $state(false);
	function clearFilters() {
		resultList.filters.forEach((filter) => {
			if (filter.type == "minMax") {
				filter.value = filter.default;
				filter.maxValue = filter.maxDefault;
			} else if (filter.type == "minGroup") {
				filter.values!.forEach((value, index, values) => {
					values[index] = filter.defaults![index];
				});
			} else {
				filter.value = filter.default;
			}
		});
	}
</script>

<main>
	<button
		class="accordian"
		class:hidden={!appWindow.isMobile}
		on:click={() => {
			showFilters = !showFilters;
		}}>
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
		</div></button>
	<div class="card" class:hidden={appWindow.isMobile && !showFilters}>
		<div class="filter-list">
			{#each resultList.filters as filter, index}
				<div class="filter">
					<label for={filter.name}>{filter.label}</label>
					{#if filter.type == "string"}
						<input id={filter.name} type="text" bind:value={filter.value} placeholder={filter.label} />
					{:else if filter.type == "min" || filter.type == "max"}
						<input id={filter.name} type="number" min="0" bind:value={filter.value} placeholder={filter.default.toString()} />
					{:else if filter.type == "minMax"}
						<div>
							<input id={filter.name} type="number" min="0" bind:value={filter.value} placeholder={filter.default.toString()} />
							-
							<input id={filter.name + "max"} type="number" min="0" bind:value={filter.maxValue} placeholder={filter.maxDefault!.toString()} />
						</div>
					{:else if filter.type == "minGroup"}
						<div class="min-group">
							{#each filter.properties! as property, propertyIndex}
								<label for={property}>{filter.labels![propertyIndex]}</label>
								<input id={property} type="number" min="0" bind:value={filter.values![propertyIndex]} placeholder={filter.defaults![propertyIndex].toString()} />
							{/each}
						</div>
					{:else if filter.type == "abilities"}
						<div class="dropdown">
							<input
								id={filter.name}
								on:mouseenter={() => {
									showAbilitiesDropdown = true;
								}}
								on:mouseleave={() => {
									showAbilitiesDropdown = false;
								}}
								type="text"
								bind:value={filter.value}
								placeholder={filter.label} />
							<div class="dropdown-content" class:dropdown-hidden={!showAbilitiesDropdown} class:dropdown-shown={showAbilitiesDropdown}>
								<ul>
									<li>
										Enter abilities separated by comma's to search for units with all entered abilities (ex. tag,ecm will search for units that have both the TAG and ECM special
										abilities)
									</li>
									<li>
										Enter abilities separated by ^ to search for units with either ability. (ex. tag^ecm will search for units that have either the TAG or the ECM special
										abilities)
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
					{/if}
				</div>
			{/each}
			<button class="clear" on:click={clearFilters}>Clear Filters</button>
		</div>
	</div>
</main>

<style>
	main {
		width: 100%;
		position: sticky;
		top: 35px;
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
	input[type="number"] {
		width: 50px;
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
</style>
