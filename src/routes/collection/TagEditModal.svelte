<script lang="ts">
	import { Dialog, Popover } from "$lib/components/global";
	import { getUserTags, addTag, removeTag, updateTag } from "$lib/remote/collection.remote";
	import { toastController } from "$lib/stores";
	import ColorSelect, { type RGB } from "svelte-color-select";

	let userTags = getUserTags();

	let newTagColor = $state<RGB>({ r: 0.15, g: 0.15, b: 0.15 });

	let selectedEditTag = $state(userTags.current?.[0]);
	let newName = $derived(selectedEditTag?.label);
	let editTagColor = $derived(JSON.parse(selectedEditTag?.color ?? `{"r":"0.20", "g":"0.20", "b":"0.20" }`));
	let editTagId = $derived(selectedEditTag?.id);

	function onOpenChange() {
		newTagColor = { r: Math.random(), g: Math.random(), b: Math.random() };
	}
</script>

<Dialog title="Edit Users Tags" {onOpenChange}>
	{#snippet trigger()}
		Edit Custom Tags
	{/snippet}

	<div class="edit-tags-body">
		<form
			{...addTag.enhance(async ({ form, submit }) => {
				try {
					await submit();
					form.reset();
					toastController.addToast(addTag.result?.message ?? "Invalid Message recieved");
				} catch (error) {
					console.log(error);
				}
			})}
		>
			<fieldset class="new-tag-field">
				<legend>Add New Tag</legend>
				<p class="muted">Add a new tag to sort and organize units</p>
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
					<input type="hidden" name="tagColor" value={JSON.stringify({ r: newTagColor.r.toFixed(3), g: newTagColor.g.toFixed(3), b: newTagColor.b.toFixed(3) })} />
					<button class="add-button">Add new tag</button>
				</div>
			</fieldset>
		</form>
		<form
			{...updateTag.enhance(async ({ submit }) => {
				try {
					await submit();
					toastController.addToast(updateTag.result?.message ?? "Invalid Message recieved");
				} catch (error) {
					console.log(error);
				}
			})}
		>
			<fieldset>
				<legend>Update Tag</legend>
				<p class="muted">Updates the existing tag without removing it from models</p>
				<select bind:value={selectedEditTag}>
					{#each userTags.current ?? [] as tag}
						<option value={tag}>{tag.label}</option>
					{:else}
						<option>No Custom Tags</option>
					{/each}
				</select>
				<label>Name: <input type="text" name="newName" bind:value={newName} /></label>
				<div class="inline">
					<p>Color:</p>
					<Popover>
						{#snippet trigger()}
							<div
								class="color-preview"
								style={`background-color: rgb(${Number(Number(editTagColor.r).toFixed(3)) * 255}, ${Number(Number(editTagColor.g).toFixed(3)) * 255}, ${Number(Number(editTagColor.b).toFixed(3)) * 255})`}
							></div>
						{/snippet}
						<ColorSelect bind:rgb={editTagColor} />
					</Popover>
				</div>
				<input type="hidden" name="tagToUpdate" value={editTagId} />

				<input
					type="hidden"
					name="tagColor"
					value={JSON.stringify({ r: Number(editTagColor.r).toFixed(3), g: Number(editTagColor.g).toFixed(3), b: Number(editTagColor.b).toFixed(3) })}
				/>
				<button disabled={userTags.current?.length == 0}>Update Tag</button>
			</fieldset>
		</form>
		<form
			{...removeTag.enhance(async ({ submit }) => {
				try {
					if (confirm(`Are you sure you want to delete the tag and remove it from all units it's applied to?`)) await submit();
					toastController.addToast(removeTag.result?.message ?? "Invalid Message recieved");
				} catch (error) {
					console.log(error);
				}
			})}
		>
			<fieldset>
				<legend>Remove existing tag</legend>
				<p class="muted">This will remove the tag from all existing units and cannot be undone.</p>
				<div class="inline">
					<select name="tagToRemove" id="tagToRemove">
						{#each userTags.current ?? [] as tag}
							<option value={tag.id}>{tag.label}</option>
						{:else}
							<option>No Custom Tags</option>
						{/each}
					</select>
					<button disabled={userTags.current?.length == 0}>Remove Tag</button>
				</div>
			</fieldset>
		</form>
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
		border: 1px solid var(--muted);
		display: flex;
		flex-direction: column;
		gap: 8px;
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
</style>
