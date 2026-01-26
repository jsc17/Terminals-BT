<script lang="ts">
	import VirtualList from "@humanspeak/svelte-virtual-list";
	import { getTags, getTaggedUnits, getUnitGroups, addUnitToCollection, addTagToUnit } from "$lib/remote/collection.remote";
	import { getContext } from "svelte";
	import { SvelteMap, SvelteSet } from "svelte/reactivity";
	import TagEditModal from "./TagEditModal.svelte";
	import EditUnitModal from "./EditUnitModal.svelte";
	import { toastController } from "$lib/stores";
	import { addTagToUnitSchema } from "$lib/types/collection";

	let user: { username: string | undefined } = getContext("user");

	let nameFilter = $state("");
	let filteredTags = new SvelteMap<number, string>();
	let addUnitTags = new SvelteMap<number, string>([[1, "Owned"]]);
	let checkedUnitIds = new SvelteSet<number>();

	let taggedUnits = getTaggedUnits();
	let userTags = getTags();

	let filteredUnits = $derived(taggedUnits.current?.data?.filter((value) => filterUnit(value)) ?? []);

	let filterTagList = $derived(userTags.current?.filter((value) => !filteredTags.has(value.id)) ?? []);
	let addTagList = $derived(userTags.current?.filter((value) => !addUnitTags.has(value.id)) ?? []);

	let selectedFilterTag = $derived(filterTagList[0]);
	let selectedAddUnitTag = $derived(addTagList[0]);

	let unitGroupListPromise = getUnitGroups();
	let unitFilter = $state<string>();
	let unitGroupList = $derived<string[]>(unitGroupListPromise.current?.filter((v) => v.toLowerCase().includes(unitFilter?.toLowerCase() ?? "")) ?? []);

	function filterUnit(item: any) {
		if (!item.label.toLowerCase().includes(nameFilter.toLowerCase())) return false;

		const unitTags = item.unitTags.map(({ tag }: { tag: { id: number } }) => tag.id);
		for (const [tagId, tagLabel] of filteredTags) if (!unitTags.includes(tagId)) return false;
		return true;
	}
</script>

<main>
	{#if user.username == undefined}
		<p class="login-message">Please login or register to use this feature</p>
	{:else}
		<section class="filter-bar">
			<label for="name-filter" class="name-filter">Filter by Name: <input type="text" name="name-filter" id="name-filter" bind:value={nameFilter} /></label>
			<div class="manage-tag-container">
				<div class="manage-tag-header">
					<label for="tag-filter">
						<select name="tag-filter" id="tag-filter" bind:value={selectedFilterTag}>
							{#each filterTagList as tag}
								<option value={tag}>{tag.label}</option>
							{/each}
						</select>
					</label>
					<button onclick={() => filteredTags.set(selectedFilterTag!.id, selectedFilterTag!.label)}>Add Tag to Filters</button>
				</div>
				<div class="manage-tags">
					{#each filteredTags as [tagId, tagLabel]}
						<button class="tag-button" onclick={() => filteredTags.delete(tagId)}>
							<span class="primary">x</span>
							{tagLabel}
						</button>
					{:else}
						<div class="tag">No Tags Selected</div>
					{/each}
				</div>
			</div>
			<div class="edit-button">
				<TagEditModal />
			</div>
		</section>
		<svelte:boundary>
			{#snippet pending()}
				<p>Retrieving collection from server...</p>
			{/snippet}
			<section class="unit-list">
				{#if taggedUnits.current?.status == "success" && taggedUnits.current.data}
					{#if taggedUnits.current.data?.length == 0}
						<p class="add-message">Add units to your collection</p>
					{:else}
						<VirtualList items={filteredUnits} itemsClass="test-collection">
							{#snippet renderItem(item)}
								<div class="collection-model-row">
									<input
										type="checkbox"
										bind:checked={
											() => checkedUnitIds.has(item.id),
											(checked) => {
												checked ? checkedUnitIds.add(item.id) : checkedUnitIds.delete(item.id);
												console.log(checkedUnitIds);
											}
										}
										form="unit-management"
									/>
									<p class="tagged-unit-name">{item.label}</p>
									<p class="tagged-unit-quantity">x{item.quantity}</p>
									<div class="selected-tags">
										{#each item.unitTags as { tag }}
											{@const rgb = JSON.parse(tag.color)}
											{@const rgbString = `rgb(${Number(rgb.r) * 255} ${Number(rgb.g) * 255} ${Number(rgb.b) * 255})`}
											<div style={`background-color: ${rgbString}; color: hwb(from oklch(from ${rgbString} l 0 0) h calc(((b - 50) * 999)) calc(((w - 50) * 999)));`} class="tag">
												{tag.label}
											</div>
										{:else}
											<div class="tag">No Tags</div>
										{/each}
									</div>
									<EditUnitModal unit={item} />
								</div>
							{/snippet}
						</VirtualList>
					{/if}
				{/if}
			</section>
		</svelte:boundary>
		<section>
			<form
				id="unit-management"
				{...addUnitToCollection.enhance(async ({ submit }) => {
					try {
						await submit();
						toastController.addToast(addUnitToCollection.result?.message ?? "Invalid message recieved");
					} catch (error) {
						console.log(error);
					}
				})}
				class="manage-bar"
			>
				<div class="manage-bar-add-unit">
					<p class="muted">Adds the selected model to your collection with the currently selected tags</p>
					<div class="justify-end">
						<label>Filter: <input type="text" bind:value={unitFilter} style="width: 150px;" /></label>
						<select name="newUnitName" id="new-unit-name" style="width: 250px;">
							{#each unitGroupList as group}
								<option value={group}>{group}</option>
							{/each}
						</select>
						<button>Add</button>
					</div>
				</div>
				<div class="manage-tag-container">
					<div class="manage-tag-header">
						<label>
							<select id="tagFilter" bind:value={selectedAddUnitTag}>
								{#each addTagList as tag}
									<option value={tag}>{tag.label}</option>
								{/each}
							</select>
						</label>
						<button type="button" onclick={() => addUnitTags.set(selectedAddUnitTag!.id, selectedAddUnitTag!.label)}>Add Tag</button>
					</div>
					<div class="manage-tags">
						{#each addUnitTags as [tagId, tagLabel]}
							<button type="button" class="tag-button" onclick={() => addUnitTags.delete(tagId)}>
								<span class="primary">x</span>
								{tagLabel}
							</button>
							<input type="hidden" name="tag[]" value={tagId} />
						{/each}
					</div>
				</div>
			</form>

			<form
				{...addTagToUnit.preflight(addTagToUnitSchema).enhance(async ({ data, submit }) => {
					console.log(data);
					try {
						await submit();
						toastController.addToast(addTagToUnit.result?.message ?? "Invalid message recieved");
					} catch (error) {
						console.log(error);
					}
				})}
				class="inline"
			>
				<p class="muted">Add selected tags to all checked models:</p>
				<button>Add</button>
				{#each addUnitTags as [tagId], index}
					<input {...addTagToUnit.fields.tag[index].as("hidden", tagId.toString())} />
				{/each}
				{#each checkedUnitIds as unitId, index}
					<input {...addTagToUnit.fields.unitId[index].as("hidden", unitId.toString())} />
				{/each}
			</form>
		</section>
	{/if}
</main>

<style>
	:global(.test-collection) {
		display: grid;
		grid-template-columns: max-content fit-content(30%) max-content 1fr max-content;
		column-gap: 16px;
	}
	:global(.test-collection > div) {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 5;
	}
	main {
		display: flex;
		flex-direction: column;
		gap: 16px;
		height: 100%;
	}
	section {
		padding: 16px;
		background-color: var(--surface-color);
		border: 1px solid var(--border);
		display: flex;
		gap: 24px;
	}
	.unit-list {
		flex: 1;
		padding-right: 0px;
		overflow: auto;
	}
	.add-message {
		flex: 1;
		font-size: 24px;
		align-self: center;
		margin-top: 16px;
	}
	.login-message {
		margin-top: 16px;
		font-size: 24px;
		align-self: center;
	}
	.filter-header {
		color: var(--surface-color-light-text-color);
		font-size: 0.95em;
	}
	.selected-tags {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}
	.tag,
	.tag-button {
		font-size: 0.9em;
		background-color: var(--surface-color-light);
		padding: 4px 8px;
		border-radius: var(--radius);
		display: flex;
		gap: 8px;
		color: var(--surface-color-light-text-color);
		height: max-content;
	}
	.tag-button:hover {
		cursor: pointer;
	}
	.filter-bar {
		& * {
			align-self: center;
		}
	}
	.filter-bar {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		column-gap: 24px;
	}
	.manage-bar {
		display: grid;
		grid-template-columns: 1fr 1fr;
		column-gap: 24px;
	}
	.collection-model-row {
		padding: 8px 16px;
		border-bottom: 1px solid var(--border);
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 5;

		& * {
			align-self: center;
		}
	}
	.collection-model-row:hover {
		background-color: var(--surface-color-light);
	}
	.tagged-unit-name {
		padding: 0px 16px;
		justify-self: center;
	}
	.tagged-unit-quantity {
		color: var(--surface-color-light-text-color);
		padding: 0px 16px;
	}
	.manage-bar-add-unit {
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: end;
		align-self: center;
	}
	.manage-tag-container {
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
	.manage-tag-header {
		border-bottom: 1px solid var(--border);
		padding: 4px 8px;
		background-color: var(--background);
		border-radius: var(--radius) var(--radius) 0 0;
	}
	.manage-tags {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		padding: 6px;
	}
	.edit-button {
		width: max-content;
		justify-self: end;
	}
	.name-filter {
		justify-self: end;
	}
	@media (max-width: 600px) {
		section {
			padding: 4px;
		}
		.collection-model-row {
			padding: 4px;
			gap: 2px;
		}
		.tagged-unit-name {
			justify-self: start;
			padding: 0px 4px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			width: 100%;
		}
		.tagged-unit-quantity {
			padding: 0px 4px;
		}
		.filter-bar,
		.manage-bar {
			display: flex;
			flex-direction: column;
			gap: 8px;
		}
	}
</style>
