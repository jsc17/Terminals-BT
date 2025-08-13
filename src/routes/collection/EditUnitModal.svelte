<script lang="ts">
	import { Dialog } from "$lib/components/global";
	import { removeTagfromUnit, removeUnitFromCollection, getTags, addTagToUnit, updateQuantity } from "$lib/remote/collection.remote";
	import { toastController } from "$lib/stores";
	import { appWindow } from "$lib/stores";

	type Props = {
		unit: any;
	};

	let { unit }: Props = $props();

	let open = $state(false);
	let userTags = getTags();
</script>

<Dialog title={`Edit ${unit.label}`} triggerClasses={"transparent-button"} bind:open>
	{#snippet trigger()}
		{appWindow.isMobile ? `Edit` : "Edit Unit"}
	{/snippet}
	<div class="edit-unit-body">
		<form
			{...updateQuantity.enhance(async ({ submit }) => {
				try {
					await submit();
					toastController.addToast(updateQuantity.result?.message ?? "Invalid message recieved");
				} catch (error) {
					console.log(error);
				}
			})}
		>
			<label class="muted" for="updateQuantity"> Update Quantity </label>
			<input type="number" name="updateQuantity" id="updateQuantity" min="0" defaultvalue={unit.quantity} />
			<button>Update</button>
			<input type="hidden" name="unitId" value={unit.id} />
		</form>
		<form
			{...addTagToUnit.enhance(async ({ submit }) => {
				try {
					await submit();
					toastController.addToast(addTagToUnit.result?.message ?? "Invalid message recieved");
				} catch (error) {
					console.log(error);
				}
			})}
			class="add-tag-form"
		>
			<label class="muted" for="tag"> Add Tag </label>
			<select name="tag" id="tag">
				{#each userTags.current?.filter((value) => {
					return unit.unitTags.find(({ tag }: { tag: { id: number } }) => {
							return value.id == tag.id;
						}) == undefined;
				}) ?? [] as tag}
					<option value={tag.id}>{tag.label}</option>
				{/each}
			</select>
			<button>Add</button>
			<input type="hidden" name="unitId" value={unit.id} />
		</form>

		<div class="tag-container">
			<p class="tag-header">Existing Tags</p>
			{#each unit.unitTags as { tag }}
				<form
					class="tag-line"
					{...removeTagfromUnit.enhance(async ({ submit }) => {
						try {
							await submit();
							toastController.addToast(removeTagfromUnit.result?.message ?? "Invalid message recieved");
						} catch (error) {
							console.log(error);
						}
					})}
				>
					<p>{tag.label}</p>
					<input type="hidden" name="unitId" value={unit.id} />
					<input type="hidden" name="tagToRemove" value={tag.id} />
					<button class="transparent-button">remove</button>
				</form>
			{/each}
		</div>
		<form
			{...removeUnitFromCollection.enhance(async ({ submit }) => {
				try {
					await submit();
					toastController.addToast(removeUnitFromCollection.result?.message ?? "Invalid message recieved");
					open = false;
				} catch (error) {
					console.log(error);
				}
			})}
			class="flex-between"
		>
			<p class="muted">Remove <span class="primary">{unit.label}</span> from collection</p>
			<input type="hidden" name="idToRemove" value={unit.id} />
			<button class="error-button">Remove</button>
		</form>
	</div>
</Dialog>

<style>
	.edit-unit-body {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 12px 4px;
	}
	.add-tag-form {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.tag-container {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
	}
	.tag-header {
		padding: 8px;
		border-bottom: 2px solid var(--border);
	}
	.tag-line {
		display: flex;
		justify-content: space-between;
		background-color: var(--card);
		padding: 4px 16px;
		border-bottom: 2px solid var(--border);
	}
	.tag-line:hover {
		background-color: var(--muted);
	}
</style>
