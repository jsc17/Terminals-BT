<script lang="ts">
	import { appWindow } from "$lib/stores/appWindow.svelte.js";
	import { type Filter } from "$lib/types/filter";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { Select } from "$lib/generic";
	import { getTags, getUnitsWithTags } from "$lib/remote/collection.remote";
	import { getContext } from "svelte";
	import { toastController } from "$lib/stores";
	import { watch } from "runed";
	import { nanoid } from "nanoid";

	type Props = {
		resultList: ResultList;
	};

	let { resultList = $bindable() }: Props = $props();

	let tabId = $state(nanoid());
	$inspect(tabId);
	let showFilters = $state(false);
	let showAdditionalFilters = $state(false);
	let showAbilitiesDropdown = $state(false);

	const tags = getTags();
	const filterTags = $derived(tags.current?.map((t) => ({ value: t.id.toString(), label: t.label })) ?? []);
	let selectedTags = $state<string[]>([]);

	let user: { username: string | undefined } = getContext("user");

	let tempFilters = $state<Filter[]>($state.snapshot(resultList.filters));
	let tempAdditionalFilters = $state<Filter[]>($state.snapshot(resultList.additionalFilters));

	let debounceTimeout: ReturnType<typeof setTimeout> | undefined;

	watch([() => $state.snapshot(tempFilters), () => $state.snapshot(tempAdditionalFilters)], () => {
		if (debounceTimeout) clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(() => {
			resultList.filters = $state.snapshot(tempFilters);
			resultList.additionalFilters = $state.snapshot(tempAdditionalFilters);
		}, 350);
	});

	function resetFilters() {
		tempFilters.concat(tempAdditionalFilters).forEach((filter) => {
			if (filter.type == "number") {
				filter.valueMin = undefined;
				filter.valueMax = undefined;
			} else if (filter.type == "numberGroup") {
				filter.values!.forEach((value, index, values) => {
					values[index] = {};
				});
			} else if (filter.type == "select") {
				filter.value = [];
			} else if (filter.type == "movement") {
				filter.speedMaxValue = undefined;
				filter.speedMinValue = undefined;
				filter.typeValue = [];
			} else if (filter.type != "unique") {
				filter.value = "";
			}
		});
	}
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
		<form
			class="tag-container"
			{...getUnitsWithTags.for(tabId).enhance(async ({ submit }) => {
				if (resultList.taggedUnits.length == 0 && selectedTags.length) {
					await submit();
					resultList.taggedUnits = getUnitsWithTags.for(tabId).result?.data ?? [];
					if (getUnitsWithTags.for(tabId).result?.data?.length == 0) {
						toastController.addToast("No units found that match all selected tags");
					} else if (getUnitsWithTags.for(tabId).result?.message == "failed") {
						toastController.addToast(getUnitsWithTags.for(tabId).result?.message ?? "Invalid message recieved");
					}
				} else {
					resultList.taggedUnits = [];
					toastController.addToast("Tag filters removed");
				}
			})}
		>
			<div class="tag-header">
				<Select bind:value={selectedTags} items={filterTags} type="multiple" placeholder="Tags" disabled={resultList.taggedUnits.length != 0} />
				<button class="tag-filter-button" disabled={user.username == undefined || selectedTags.length == 0}
					>{resultList.taggedUnits.length == 0 ? `Filter` : "Remove Filter"}</button
				>
				<a class="collection-link" href="/collection" target="_blank">Edit Collection</a>
			</div>
			<div class="tag-list">
				{#if user.username}
					{#each selectedTags as tag, index}
						{@const currentTag = tags.current?.find((t) => t.id.toString() == tag)}
						{@const rgb = JSON.parse(currentTag?.color ?? `{"r":"0.2","g":"0.2","b":"0.2"}`)}
						{@const rgbString = `rgb(${Number(rgb.r) * 255} ${Number(rgb.g) * 255} ${Number(rgb.b) * 255})`}
						<input type="hidden" name="tagId[]" value={tag} />
						<button
							type="button"
							class="tag"
							style={`background-color: ${rgbString}; color: hwb(from oklch(from ${rgbString} l 0 0) h calc(((b - 50) * 999)) calc(((w - 50) * 999)));`}
							onclick={() => {
								if (resultList.taggedUnits.length != 0) {
									toastController.addToast("Remove the tag filter to continue editting tags");
								} else {
									selectedTags.splice(index, 1);
								}
							}}>{currentTag?.label}</button
						>
					{/each}
				{:else}
					<p class="muted">Log in to use custom tag filtering</p>
				{/if}
			</div>
		</form>
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
		{@render filters(tempFilters)}
		<div class="space-between filter-buttons">
			<button
				class="transparent-button"
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
			<button class="clear" onclick={() => resetFilters()}>Clear Filters</button>
		</div>
		{#if showAdditionalFilters}
			{@render filters(tempAdditionalFilters)}
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
	.select-filter-wrapper {
		width: 5em;
	}
	.tag-container {
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-width: 300px;
	}
	.tag-header {
		display: grid;
		grid-template-columns: 100px max-content 1fr;
		gap: 8px;
	}
	.tag-filter-button {
		width: max-content;
		height: max-content;
	}
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
	}
	.tag {
		font-size: 0.9em;
		background-color: var(--background);
		border: 1px solid var(--border);
		padding: 2px 4px;
		border-radius: var(--radius);
		display: flex;
		gap: 8px;
		color: var(--muted-foreground);
		height: max-content;
	}
	.tag:hover {
		cursor: pointer;
	}
	.collection-link {
		font-size: 0.85em;
		height: max-content;
	}
</style>
