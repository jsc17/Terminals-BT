<script lang="ts">
	import { type CollectionTag } from "$lib/generated/prisma/browser";
	import { Dialog, Popover } from "$lib/generic";
	import { getUserTags, addTag, updateTag, deleteTag } from "$lib/remote/collection.remote";
	import { toastController } from "$lib/stores";
	import { includesIgnoreCase, reviveNumber } from "$lib/utilities/utilities";
	import ColorSelect, { type RGB } from "svelte-color-select";
</script>

<Dialog title="Edit Users Tags">
	{#snippet trigger()}
		Add/Edit Tags
	{/snippet}

	<div class="edit-tags-body">
		{let newTagColor = $state<RGB>({ r: Math.random(), g: Math.random(), b: Math.random() })}
		<form
			{...addTag.enhance(async ({ element, submit }) => {
				try {
					await submit();
					element.reset();
					toastController.addToast(addTag.result?.message ?? "Invalid Message recieved");
					newTagColor = { r: Math.random(), g: Math.random(), b: Math.random() };
				} catch (error) {
					console.log(error);
				}
			})}
		>
			<fieldset class="new-tag-field">
				<legend>Add New Tag</legend>
				<div class="inline">
					<label>Name: <input type="text" name="newTag" id="newTag" required /></label>
					<p>Color:</p>
					<Popover>
						{#snippet trigger()}
							<div
								class="color-preview"
								style={`background-color: rgb(${Number(newTagColor.r.toFixed(3)) * 255}, ${Number(newTagColor.g.toFixed(3)) * 255}, ${Number(newTagColor.b.toFixed(3)) * 255})`}
							></div>
						{/snippet}
						<ColorSelect bind:rgb={newTagColor} />
					</Popover>
					<input
						type="hidden"
						name="tagColor"
						value={JSON.stringify({ r: Number(newTagColor.r.toFixed(3)), g: Number(newTagColor.g.toFixed(3)), b: Number(newTagColor.b.toFixed(3)) })}
					/>
					<button class="add-button">Add new tag</button>
				</div>
			</fieldset>
		</form>

		<fieldset>
			{let tagFilter = $state("")}
			<legend>Edit/Remove Existing Tag <label>Filter <input type="text" bind:value={tagFilter} /></label></legend>

			{const tags = $derived(await getUserTags())}
			{let selectedTag = $state<Pick<CollectionTag, "color" | "id" | "label">>()}

			<div class="tag-list">
				{#if tags.length}
					{#each tags.filter((t) => includesIgnoreCase(t.label, tagFilter)) as tag}
						{const rgb = $derived<RGB>(JSON.parse(tag.color, (key, value) => reviveNumber(key, value)))}
						<button style={`--rgb: rgb(${rgb.r * 255} ${rgb.g * 255} ${rgb.b * 255})`} class={{ tag: true }} onclick={() => (selectedTag = tag)}>
							{tag.label}
						</button>
					{:else}
						<p class="tag">No Tags available</p>
					{/each}
				{:else}
					<p class="tag">No Existing User Tags</p>
				{/if}
			</div>
			<fieldset>
				<legend>Selected Tag</legend>
				<div class="space-between">
					{const rgb = $derived(JSON.parse(selectedTag?.color ?? '{"r": 0.15, "g": 0.15, "b": 0.15}', (key, value) => reviveNumber(key, value)))}
					<p style={`--rgb: rgb(${rgb.r * 255} ${rgb.g * 255} ${rgb.b * 255})`} class={{ tag: true }}>
						{selectedTag?.label ?? "No Tag Selected"}
					</p>
					<button
						disabled={selectedTag == undefined}
						onclick={() => {
							if (confirm(`Are you sure you want to delete "${selectedTag!.label}" and remove it from all units it's applied to?`))
								deleteTag(selectedTag!.id).then((r) => {
									toastController.addToast(r.message);
									selectedTag = undefined;
								});
						}}
					>
						Remove Tag
					</button>
				</div>

				{let updatedName = $derived(selectedTag?.label ?? "")}
				{let updatedColor = $derived<RGB>(JSON.parse(selectedTag?.color ?? '{"r": 0.15, "g": 0.15, "b": 0.15}', (key, value) => reviveNumber(key, value)))}
				<form
					{...updateTag.enhance(async (form) => {
						await form.submit();
						selectedTag = undefined;
					})}
					class="edit-tags-body"
				>
					<input {...updateTag.fields.tagId.as("hidden", selectedTag?.id ?? -1)} />
					<input {...updateTag.fields.updatedColor.as("hidden", JSON.stringify(updatedColor))} />
					<label>Name: <input {...updateTag.fields.updatedName.as("text", updatedName)} disabled={!selectedTag} placeholder="New Tag Name" /></label>
					<div class="space-between">
						<div class="inline">
							<p>Color:</p>
							<Popover>
								{#snippet trigger()}
									<div
										class="color-preview"
										style={`background-color: rgb(${Number(updatedColor.r.toFixed(3)) * 255}, ${Number(updatedColor.g.toFixed(3)) * 255}, ${Number(updatedColor.b.toFixed(3)) * 255})`}
									></div>
								{/snippet}
								<ColorSelect bind:rgb={updatedColor} />
							</Popover>
						</div>
						<button disabled={!selectedTag}>Update Tag</button>
					</div>
				</form>
			</fieldset>
		</fieldset>
	</div>
</Dialog>

<style>
	.edit-tags-body {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	fieldset {
		border: 1px solid var(--surface-color-light);
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: var(--responsive-padding);
	}
	.add-button {
		width: max-content;
	}
	.color-preview {
		width: 25px;
		height: 25px;
		border-radius: 50%;
	}
	.color-preview:hover {
		cursor: pointer;
		border: 2px solid var(--primary);
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
</style>
