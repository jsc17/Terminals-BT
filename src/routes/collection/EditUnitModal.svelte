<script lang="ts">
	import type { CollectionModel, CollectionTag } from "$lib/generated/prisma/browser";
	import { Dialog } from "$lib/generic";
	import { removeUnitFromCollection, getTags, updateUnit } from "$lib/remote/collection.remote";
	import { toastController } from "$lib/stores";
	import { appWindow } from "$lib/stores";
	import { includesIgnoreCase, reviveNumber } from "$lib/utilities/utilities";
	import { type RGB } from "svelte-color-select";

	type Props = {
		unit: CollectionModel & { unitTags: { tag: Omit<CollectionTag, "userId"> }[] };
	};

	let { unit }: Props = $props();

	let open = $state(false);
</script>

<Dialog title={`Edit ${unit.label}`} triggerClasses={"transparent-button"} bind:open>
	{#snippet trigger()}
		{appWindow.isMobile ? `Edit` : "Edit Unit"}
	{/snippet}
	<div class="edit-unit-body">
		{const tags = $derived(await getTags())}
		{let appliedTags = $derived(unit.unitTags.map((t) => t.tag))}
		{let availableTags = $derived(tags.filter((t) => !appliedTags.find((a) => a.id == t.id)))}
		<fieldset>
			<legend>Applied Tags</legend>

			<div class="tag-list">
				{#each appliedTags as tag, index}
					{const rgb = $derived<RGB>(JSON.parse(tag.color, (key, value) => reviveNumber(key, value)))}
					<button style={`--rgb: rgb(${rgb.r * 255} ${rgb.g * 255} ${rgb.b * 255})`} class="tag" onclick={() => (appliedTags = appliedTags.toSpliced(index, 1))}>
						{tag.label}
					</button>
				{:else}
					<p class="tag">No Tags Applied</p>
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
						<button style={`--rgb: rgb(${rgb.r * 255} ${rgb.g * 255} ${rgb.b * 255})`} class="tag" onclick={() => (appliedTags = [...appliedTags, tag])}>
							{tag.label}
						</button>
					{:else}
						<p class="tag">No Tags available</p>
					{/each}
				{:else}
					<p class="tag">No Existing User Tags</p>
				{/if}
			</div>
		</fieldset>

		<form
			{...updateUnit.for(unit.id).enhance(async ({ submit }) => {
				try {
					await submit();
					toastController.addToast(updateUnit.for(unit.id).result?.message ?? "Invalid message recieved");
					open = false;
				} catch (error) {
					console.log(error);
				}
			})}
		>
			<input {...updateUnit.fields.unitId.as("hidden", unit.id)} />
			{#each appliedTags as tag, index}
				<input {...updateUnit.fields.tags[index].as("hidden", tag.id)} />
			{/each}
			<label>Update Model Quantity <input {...updateUnit.fields.quantity.as("number", unit.quantity)} /></label>
			<div class="buttons">
				<button type="button" onclick={() => (open = false)}>Cancel</button>
				<button>Update</button>
			</div>
		</form>
		<hr />
		<form
			{...removeUnitFromCollection.for(unit.id).enhance(async ({ submit }) => {
				try {
					await submit();
					toastController.addToast(removeUnitFromCollection.for(unit.id).result?.message ?? "Invalid message recieved");
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
