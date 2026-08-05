<script lang="ts">
	import { type Filter } from "$lib/types/filter";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { Select, Popover } from "$lib/generic";
	import { getContext } from "svelte";
	import { watch } from "runed";
	import { nanoid } from "nanoid";
	import { AlertIcon, InformationIcon } from "$lib/icons";
	import TagFilterDialog from "./TagFilterDialog.svelte";
	import { type RGB } from "svelte-color-select";
	import { capitalize, reviveNumber } from "$lib/utilities/utilities";
	import { getUnitsWithTags } from "$lib/remote/collection.remote";

	type Props = {
		resultList: ResultList;
	};

	let { resultList = $bindable() }: Props = $props();

	let tabId = $state(nanoid());
	let showAdditionalFilters = $state(false);
	let showAbilitiesDropdown = $state(false);

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
			} else if (filter.type == "tag") {
				filter.all = [];
				filter.any = [];
				filter.none = [];
				filter.maximumBehavior = "none";
				resultList.applyCollectionFilters();
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
				{#if filter.name == "date"}
					<Popover>
						{#snippet trigger()}
							<InformationIcon fill="var(--surface-color-light-text-color)" width="15" height="15" />
						{/snippet}
						<div class="era-dates-popover">
							<p>Star League</p>
							<p class="muted">2571-2780</p>
							<p>Early Succession War</p>
							<p class="muted">2781-2900</p>
							<p>Late Succession War</p>
							<p class="muted">2901-3019</p>
							<p>Late Succession War - Renaissance</p>
							<p class="muted">3020-3049</p>
							<p>Clan Invasion</p>
							<p class="muted">3050-3061</p>
							<p>Civil War</p>
							<p class="muted">3062-3067</p>
							<p>Jihad</p>
							<p class="muted">3068-3080</p>
							<p>Early Republic</p>
							<p class="muted">3081-3100</p>
							<p>Late Republic</p>
							<p class="muted">3101-3130</p>
							<p>Dark Age</p>
							<p class="muted">3131-3150</p>
							<p>ilClan</p>
							<p class="muted">3151-Present</p>
						</div>
					</Popover>
				{/if}
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
								<li>Add an ! before the ability to only search for units that don't have that ability. (!LRM will return only units without LRM)</li>
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
				{:else if filter.type == "tag"}
					<TagFilterDialog {filter} updateResults={() => resultList.applyCollectionFilters()} />
					<Popover>
						{#snippet trigger()}
							<div class="tag-list">
								{#each ["any", "all", "none"].filter((type) => filter[type].length) as type (type)}
									<div class="tag">
										{capitalize(type)}: {filter[type].length} Tags
									</div>
								{:else}
									<div class="tag">No Collection Filters</div>
								{/each}
								{#if filter.maximumBehavior != "none"}
									<div class="tag">
										<p>
											{#if filter.maximumBehavior == "warn"}
												Warn <AlertIcon fill="var(--warning)" height="10px" /> by Collection Count
											{:else}
												Filter Results by Collection Count
											{/if}
										</p>
									</div>
								{/if}
							</div>
						{/snippet}

						<div class="popover-body">
							{#if filter.maximumBehavior != "none"}
								<p>
									{#if filter.maximumBehavior == "warn"}
										Mark results with a warning <AlertIcon fill="var(--warning)" height="15px" /> when unit count in list exceeds collection model count
									{:else}
										Hide results when unit count in list exceeds collection model count
									{/if}
								</p>
							{/if}
							<hr />
							{#each ["any", "all", "none"].filter((type) => filter[type].length) as type}
								<fieldset class="tag-list">
									<legend>{capitalize(type)} of</legend>
									{#each filter[type] as tag}
										{const rgb = $derived<RGB>(JSON.parse(tag.color, (key, value) => reviveNumber(key, value)))}
										<div style={`--rgb: rgb(${rgb.r * 255} ${rgb.g * 255} ${rgb.b * 255})`} class="tag">
											{tag.label}
										</div>
									{/each}
								</fieldset>
							{:else}
								<p>Not filtering by any collection tags</p>
							{/each}
						</div>
					</Popover>
				{:else if filter.type == "unique"}
					<input type="checkbox" name={filter.name} id={filter.name} bind:checked={filter.checked} />
				{/if}
			</div>
		{/each}
	</div>
{/snippet}

<main>
	<div class="card">
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
			{#if resultList.options && resultList.options.name != "noRes"}
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
		gap: 4px 12px;
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
		margin: 0px 8px;
	}
	label {
		margin-left: 4px;
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
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 4px 6px;
		padding: var(--responsive-padding);
		align-items: center;
	}
	.tag {
		font-size: 0.75em;
		padding: 4px 8px;
		border-radius: var(--radius);
		display: flex;
		gap: 8px;
		color: var(--surface-color-light-text-color);
		height: max-content;
		background-color: var(--rgb, var(--surface-color-extra-light));
		color: hwb(from oklch(from var(--rgb, var(--surface-color-light)) l 0 0) h calc(((b - 50) * 999)) calc(((w - 50) * 999)));
	}
	.popover-body {
		padding: var(--responsive-padding);
		display: flex;
		flex-direction: column;
		gap: 6px;
		width: min(300px, 90dvw);
	}
	.era-dates-popover {
		display: grid;
		grid-template-columns: max-content max-content;
		gap: 8px;
		padding: 8px;
	}
	.era-dates-popover p {
		font-size: 0.85em;
	}
	.era-dates-popover p:nth-child(odd) {
		text-align: right;
	}
</style>
