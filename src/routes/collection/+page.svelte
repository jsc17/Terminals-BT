<script lang="ts">
	import VirtualList from "@humanspeak/svelte-virtual-list";
	import { getTags, getTaggedUnits, bulkRemoveUnitsFromCollection, bulkAddTagsToUnits, bulkRemoveTagsFromUnits, bulkSetTagsOnUnits } from "$lib/remote/collection.remote";
	import { getContext } from "svelte";
	import { SvelteMap, SvelteSet } from "svelte/reactivity";
	import TagEditModal from "./TagEditModal.svelte";
	import EditUnitModal from "./EditUnitModal.svelte";
	import { includesIgnoreCase } from "$lib/utilities/utilities";
	import type { CollectionTag } from "$lib/generated/prisma/browser";
	import { appWindow, toastController } from "$lib/stores";
	import AddUnitModal from "./AddUnitModal.svelte";
	import { Drawer, Switch } from "$lib/generic";

	let user: { username: string | undefined } = getContext("user");
	let selectedTags = $state<SvelteMap<number, Pick<CollectionTag, "color" | "id" | "label">>>(new SvelteMap());
	let drawerOpen = $state(false);
	let tagFilterByAll = $state(false);
</script>

{#snippet tagContainer()}
	{let tagFilter = $state("")}
	<div>
		<div class="space-between">
			<label>Filter by Name <input type="text" bind:value={tagFilter} /></label>
			<TagEditModal />
		</div>
		<p class="muted">You may select a tag by tapping on it</p>
	</div>
	<svelte:boundary>
		{#snippet pending()}
			<p>Retrieving Tags from server...</p>
		{/snippet}

		{const tags = $derived(await getTags())}
		<div class="tag-list">
			{#each tags.filter((t) => includesIgnoreCase(t.label, tagFilter)) as tag}
				{const rgb = $derived(JSON.parse(tag.color))}
				<button
					style={`--rgb: rgb(${Number(rgb.r) * 255} ${Number(rgb.g) * 255} ${Number(rgb.b) * 255})`}
					class={{ tag: true, "tag-highlight": selectedTags.has(tag.id) }}
					onclick={() => {
						if (selectedTags.has(tag.id)) selectedTags.delete(tag.id);
						else selectedTags.set(tag.id, tag);
					}}
				>
					{tag.label}
				</button>
			{:else}
				<p class="tag">No Tags available</p>
			{/each}
		</div>
		<hr />
		<div class="space-between">
			<h3>Selected Tags</h3>
			<Switch bind:checked={tagFilterByAll}>
				{#snippet leftValue()}
					<span class={{ muted: tagFilterByAll }}>Any</span>
				{/snippet}
				{#snippet rightValue()}
					<span class={{ muted: !tagFilterByAll }}>All</span>
				{/snippet}
			</Switch>
		</div>
		<div class="tag-list">
			{#each selectedTags.values() as tag}
				{const rgb = JSON.parse(tag.color)}
				<button style={`--rgb: rgb(${Number(rgb.r) * 255} ${Number(rgb.g) * 255} ${Number(rgb.b) * 255})`} class="tag" onclick={() => selectedTags.delete(tag.id)}>
					{tag.label}
				</button>
			{:else}
				<p class="tag">No Tags Selected</p>
			{/each}
		</div>
	</svelte:boundary>
{/snippet}

<main>
	{#if user.username == undefined}
		<p class="login-message">Please login or register to use this feature</p>
	{:else}
		{#if appWindow.isNarrow}
			<Drawer bind:open={drawerOpen}>
				<div class="drawer-wrapper">{@render tagContainer()}</div>
			</Drawer>
		{:else}
			<section class="tag-container">
				{@render tagContainer()}
			</section>
		{/if}
		<section>
			{let unitNameFilter = $state("")}
			{let filterByTags = $state(true)}
			{let bulkEditActive = $state(false)}
			{let checkedUnits = $state(new SvelteSet<number>())}

			<div class="space-between">
				<div class="filter-options">
					<label>{appWindow.isNarrow ? "Filter" : "Filter by Name"} <input type="text" bind:value={unitNameFilter} /></label>
					<label>{appWindow.isNarrow ? "Filter by Tags" : "Filter by Selected Tags"} <input type="checkbox" bind:checked={filterByTags} /></label>
				</div>
				<div class="inline">
					<button onclick={() => (bulkEditActive = !bulkEditActive)}>{bulkEditActive ? "Cancel Edit" : "Edit Multiple"}</button>
					<AddUnitModal {selectedTags} />
				</div>
			</div>
			<svelte:boundary>
				{#snippet pending()}
					<p>Retrieving collection from server...</p>
				{/snippet}

				{const units = $derived(await getTaggedUnits())}
				{const filteredUnits = $derived(
					units.filter(
						(u) =>
							includesIgnoreCase(u.label, unitNameFilter) &&
							(selectedTags.size == 0 ||
								!filterByTags ||
								(tagFilterByAll
									? selectedTags.keys().every((t) => u.unitTags.find(({ tag }) => tag.id == t) != undefined)
									: selectedTags.keys().some((t) => u.unitTags.find(({ tag }) => tag.id == t) != undefined)))
					)
				)}

				{#if units.length == 0}
					<p class="add-message">Add units to your collection</p>
				{:else}
					<div class="virtual-list-wrapper">
						<div class="collection-model-row virtual-list-header">
							{#if bulkEditActive}
								{let allChecked = $state(false)}
								<input
									class="center"
									type="checkbox"
									bind:checked={allChecked}
									onchange={() => {
										const checkElements = document.querySelectorAll("[id^=check]");
										checkElements.forEach((e) =>
											allChecked ? checkedUnits.add(Number(e.getAttribute("data-unitid") ?? -1)) : checkedUnits.delete(Number(e.getAttribute("data-unitid") ?? -1))
										);
									}}
								/>
							{:else}
								<div></div>
							{/if}
							<p>Name</p>
							<p class="center">Type</p>
							<p class="center">{appWindow.isNarrow ? "Cnt" : "Count"}</p>
							{#if !appWindow.isNarrow}
								<p>Tags</p>
							{/if}
							<div></div>
						</div>
						<VirtualList items={filteredUnits}>
							{#snippet renderItem(item)}
								<div class="collection-model-row">
									{#if bulkEditActive}
										<input
											id={`check-${item.id}`}
											type="checkbox"
											data-unitid={item.id}
											bind:checked={() => checkedUnits.has(item.id), (v) => (v ? checkedUnits.add(item.id) : checkedUnits.delete(item.id))}
										/>
									{:else}
										<div></div>
									{/if}
									<label for={`check-${item.id}`}>{item.label}</label>
									<p class="center">{item.type ? `${item.type}` : "-"}</p>
									<p class="center tagged-unit-quantity">x{item.quantity}</p>
									{#if !appWindow.isNarrow}
										<div class="tag-list">
											{#each item.unitTags as { tag }}
												{const rgb = $derived(JSON.parse(tag.color))}
												<button
													style={`--rgb: rgb(${Number(rgb.r) * 255} ${Number(rgb.g) * 255} ${Number(rgb.b) * 255})`}
													class={{ tag: true, "tag-highlight": selectedTags.has(tag.id) }}
													onclick={() => {
														if (selectedTags.has(tag.id)) selectedTags.delete(tag.id);
														else selectedTags.set(tag.id, tag);
													}}
												>
													{tag.label}
												</button>
											{:else}
												<p class="tag">No Tags</p>
											{/each}
										</div>
									{/if}
									<EditUnitModal unit={item} />
								</div>
								{#if appWindow.isNarrow}
									<div class="tag-list-mobile">
										{#each item.unitTags as { tag }}
											{const rgb = $derived(JSON.parse(tag.color))}
											<button
												style={`--rgb: rgb(${Number(rgb.r) * 255} ${Number(rgb.g) * 255} ${Number(rgb.b) * 255})`}
												class={{ "tag-mobile": true, "tag-highlight": selectedTags.has(tag.id) }}
												onclick={() => {
													if (selectedTags.has(tag.id)) selectedTags.delete(tag.id);
													else selectedTags.set(tag.id, tag);
												}}
											>
												{tag.label}
											</button>
										{:else}
											<p class="tag-mobile">No Tags</p>
										{/each}
									</div>
								{/if}
							{/snippet}
						</VirtualList>
					</div>
				{/if}
				{#if bulkEditActive}
					<div class="bulk-edit-buttons">
						<button
							onclick={() =>
								bulkSetTagsOnUnits({ unitIds: [...checkedUnits], tagIds: [...selectedTags.keys()] }).then((r) => {
									toastController.addToast(r.message);
									if (r.status == "success") {
										bulkEditActive = false;
										checkedUnits.clear();
									}
								})}>Set Tags on Units</button
						>
						<button
							onclick={() =>
								bulkRemoveTagsFromUnits({ unitIds: [...checkedUnits], tagIds: [...selectedTags.keys()] }).then((r) => {
									toastController.addToast(r.message);
									if (r.status == "success") {
										bulkEditActive = false;
										checkedUnits.clear();
									}
								})}>Remove Selected Tags</button
						>
						<button
							onclick={() =>
								bulkAddTagsToUnits({ unitIds: [...checkedUnits], tagIds: [...selectedTags.keys()] }).then((r) => {
									toastController.addToast(r.message);
									if (r.status == "success") {
										bulkEditActive = false;
										checkedUnits.clear();
									}
								})}>Add Selected Tags</button
						>
						<button
							onclick={() => {
								if (confirm("Delete selected units? This cannot be undone"))
									bulkRemoveUnitsFromCollection([...checkedUnits]).then((r) => {
										toastController.addToast(r.message);
										if (r.status == "success") {
											bulkEditActive = false;
											checkedUnits.clear();
										}
									});
							}}>Delete Units</button
						>
					</div>
				{/if}
				{#if appWindow.isNarrow}
					<div class="mobile-tag-bar">
						<div class="tag-list">
							{#each selectedTags.values() as tag}
								{const rgb = $derived(JSON.parse(tag.color))}
								<button style={`--rgb: rgb(${Number(rgb.r) * 255} ${Number(rgb.g) * 255} ${Number(rgb.b) * 255})`} class="tag">
									{tag.label}
								</button>
							{:else}
								<p class="tag">No Tags Selected</p>
							{/each}
						</div>
						<button class="tag-button" onclick={() => (drawerOpen = true)}>Select Tags</button>
					</div>
				{/if}
			</svelte:boundary>
		</section>
	{/if}
</main>

<style>
	main {
		display: grid;
		grid-template-columns: 1fr 3fr;
		gap: 4px;
		height: 100%;
		padding: var(--responsive-padding);

		@media (max-width: 875px) {
			grid-template-columns: 1fr;
		}
	}
	section {
		padding: 16px;
		background-color: var(--surface-color);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		flex-direction: column;
		gap: 12px;

		@media (max-width: 875px) {
			padding: 4px;
		}
	}

	.drawer-wrapper {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.tag-list,
	.tag-list-mobile {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.tag-list-mobile {
		border-bottom: 1px solid var(--border);
		padding-bottom: 4px;
		gap: 6px;
	}
	.tag,
	.tag-mobile {
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
	.tag-mobile {
		font-size: 0.7em;
		padding: 2px 4px;
	}
	.tag-highlight {
		box-shadow: 0px 0px 3px 3px var(--text-color);

		@media (max-width: 875px) {
			box-shadow: 0px 0px 2px 2px var(--text-color);
		}
	}
	h3 {
		margin: 0;
	}
	.filter-options {
		display: flex;
		gap: 20px;

		@media (max-width: 875px) {
			gap: 6px;
			flex-direction: column;
		}
	}
	.virtual-list-wrapper {
		width: 100%;
		position: relative;
		display: grid;
		grid-template-rows: max-content 1fr;
		flex: 1;
		background-color: var(--surface-color);
		column-gap: 16px;
	}

	.virtual-list-header {
		border-bottom: 3px solid var(--border);
	}
	.collection-model-row {
		width: 100%;
		padding: 8px 4px 8px 0px;
		display: grid;
		grid-template-columns: 3% 22% 5% 5% 60% 5%;
		&:hover {
			background-color: var(--surface-color-light);
		}
		& * {
			align-self: center;
		}
		@media (min-width: 875px) {
			border-bottom: 1px solid var(--border);
		}
		@media (max-width: 875px) {
			grid-template-columns: max-content 1fr 12% 8% 12%;
			padding: 2px 2px;
		}
	}
	.tagged-unit-quantity {
		color: var(--surface-color-light-text-color);
		padding: 0px 16px;
	}
	.bulk-edit-buttons {
		display: flex;
		gap: 16px;
		justify-content: end;
	}
	.mobile-tag-bar {
		display: grid;
		grid-template-columns: 1fr 20%;
		border-top: 3px solid var(--border);
		padding: 4px 4px;
		min-height: 8dvh;

		& .tag-list {
			border-bottom: unset;
		}
	}
	.tag-button {
		background-color: var(--surface-color-light);
		color: var(--surface-color-light-text-color);
		border: 1px solid var(--button-dark-text-color);
	}
</style>
