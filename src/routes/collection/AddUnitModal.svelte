<script lang="ts">
	import type { CollectionModel, CollectionTag } from "$lib/generated/prisma/browser";
	import { Dialog } from "$lib/generic";
	import { getTags, getUnitsWithGroups, addUnitToCollection } from "$lib/remote/collection.remote";
	import { appWindow } from "$lib/stores";
	import { includesIgnoreCase, reviveNumber } from "$lib/utilities/utilities";
	import { type RGB } from "svelte-color-select";
	import { SvelteMap } from "svelte/reactivity";

	type Props = {
		selectedTags: SvelteMap<number, Pick<CollectionTag, "color" | "id" | "label">>;
	};

	let { selectedTags }: Props = $props();

	let open = $state(false);
</script>

<Dialog title={`Add Model`} bind:open>
	{#snippet trigger()}
		{appWindow.isMobile ? `Add` : "Add Unit"}
	{/snippet}
	<div class="edit-unit-body">
		{const tags = $derived(await getTags())}
		{let appliedTags = new SvelteMap(structuredClone([...selectedTags]))}
		{let availableTags = $derived(tags.filter((t) => !appliedTags.has(t.id)))}
		{let availableUnits = $derived(await getUnitsWithGroups())}
		{let unitFilter = $state("")}
		{let selectedUnits = $state<{ group: string | null; class: string; subtype: string | null }[]>([])}

		<div class="inline">
			{const filteredUnits = $derived(availableUnits.filter((u) => includesIgnoreCase(u.class, unitFilter)))}
			{let selectedUnit = $derived(filteredUnits[0])}
			<label>Filter: <input type="text" bind:value={unitFilter} /></label>
			<select style="max-width: 250px;" bind:value={selectedUnit}>
				{#each filteredUnits as unit}
					<option value={unit}>{unit.class} - {unit.subtype}</option>
				{/each}
			</select>
			<button
				onclick={() => {
					selectedUnits.push(selectedUnit!);
				}}
				disabled={!selectedUnit}>Add</button
			>
		</div>

		<form
			{...addUnitToCollection.enhance(async ({ submit }) => {
				await submit();
				selectedUnits = [];
			})}
		>
			<div class="add-unit-list">
				<p>Unit Name</p>
				<p>Type</p>
				<p>Count</p>
				<div></div>
				{#each selectedUnits as unit, index}
					{let label = $derived(unit.group?.length ? unit.group : unit.class)}
					{let quantity = $state(1)}
					<p>{label}</p>
					<p class="center">{unit.subtype}</p>
					<input class="quantity-input" type="number" bind:value={quantity} />
					<div class="center">
						<button type="button" class="transparent-button" onclick={() => selectedUnits.splice(index, 1)}>Remove</button>
					</div>
					<input {...addUnitToCollection.fields.units[index].as("hidden", JSON.stringify({ label, type: unit.subtype, quantity }))} />
				{:else}
					<p>-</p>
					<p class="center">-</p>
					<p class="center">-</p>
				{/each}
			</div>
			<p class="muted">The above units will be added with the tags selected below</p>
			{#each appliedTags.values() as tag, index}
				<input {...addUnitToCollection.fields.tag[index].as("hidden", tag.id)} />
			{/each}
			<button disabled={!selectedUnits.length}>Add Units to Collection</button>
		</form>

		<fieldset>
			<legend>Selected Tags</legend>
			<div class="tag-list">
				{#each appliedTags.values() as tag}
					{const rgb = $derived<RGB>(JSON.parse(tag.color, (key, value) => reviveNumber(key, value)))}
					<button style={`--rgb: rgb(${rgb.r * 255} ${rgb.g * 255} ${rgb.b * 255})`} class="tag" onclick={() => appliedTags.delete(tag.id)}>
						{tag.label}
					</button>
				{:else}
					<p class="tag">No Tags Selected</p>
				{/each}
			</div>
		</fieldset>

		{let tagFilter = $state("")}
		<fieldset>
			<legend> <label>Available Tags - Filter <input type="text" bind:value={tagFilter} /></label> </legend>

			<div class="tag-list">
				{#if availableTags.length}
					{#each availableTags.filter((t) => includesIgnoreCase(t.label, tagFilter)) as tag}
						{const rgb = $derived<RGB>(JSON.parse(tag.color, (key, value) => reviveNumber(key, value)))}
						<button style={`--rgb: rgb(${rgb.r * 255} ${rgb.g * 255} ${rgb.b * 255})`} class="tag" onclick={() => appliedTags.set(tag.id, tag)}>
							{tag.label}
						</button>
					{:else}
						<p class="tag">No Tags available</p>
					{/each}
				{:else}
					<p class="tag">No Additional Tags Available</p>
				{/if}
			</div>
		</fieldset>
	</div>
</Dialog>

<style>
	.edit-unit-body {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 12px 4px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 8px;

		& button {
			width: max-content;
			align-self: flex-end;
		}
	}

	.add-unit-list {
		display: grid;
		grid-template-columns: 1fr max-content max-content 50px;
		gap: 16px;
		border: 1px solid var(--border);
		padding: var(--responsive-padding);
	}

	.quantity-input {
		width: 50px;
	}

	fieldset {
		display: flex;
		flex-direction: column;
		padding: var(--responsive-padding);
	}
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16px 10px;
		max-width: 60dvw;
		max-height: 60dvh;
	}
	.tag {
		font-size: 0.9em;
		padding: 4px 8px;
		border-radius: var(--radius);
		display: flex;
		gap: 8px;
		color: var(--surface-color-light-text-color);
		height: max-content;
		background-color: var(--rgb, var(--surface-color-light));
		color: hwb(from oklch(from var(--rgb, var(--surface-color-light)) l 0 0) h calc(((b - 50) * 999)) calc(((w - 50) * 999)));
	}
	.buttons {
		display: flex;
		gap: 16px;
		align-items: center;
		justify-content: end;
		padding-top: 16px;
	}
</style>
