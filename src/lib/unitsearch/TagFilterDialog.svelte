<script lang="ts">
	import { type CollectionTag } from "$lib/generated/prisma/client";
	import { Dialog, RadioGroup } from "$lib/generic";
	import { AlertIcon } from "$lib/icons";
	import { getTags } from "$lib/remote/collection.remote";
	import type { Filter } from "$lib/types/filter";
	import { reviveNumber } from "$lib/utilities/utilities";
	import { watch } from "runed";
	import { type RGB } from "svelte-color-select";

	type Props = {
		filter: Extract<Filter, { type: "tag" }>;
		updateResults: () => void;
	};

	let { filter, updateResults }: Props = $props();

	let open = $state(false);

	watch(
		() => open,
		() => updateResults()
	);
</script>

<Dialog title="Filter by Collection Tags" bind:open triggerClasses="input-button">
	{#snippet trigger()}
		<div class="trigger-button">Select</div>
	{/snippet}

	{#snippet description()}
		<p class="muted">Unit will need to meet all below requirements.</p>
		<p class="muted">Filters with no tags will not be evaluated</p>
	{/snippet}

	<div class="collection-dialog-body">
		{let editing = $state<string | undefined>()}
		{#if editing == undefined}
			<RadioGroup
				bind:value={filter.maximumBehavior}
				items={[
					{ value: "none", label: "Ignore collection model counts" },
					{ value: "warn", label: "Mark results with a warning when unit count in list exceeds collection model count" },
					{ value: "hide", label: "Hide results when unit count in list exceeds collection model count" }
				]}
				labelClasses="small-label"
			/>
			{#if filter.maximumBehavior == "warn"}
				<p class="muted warning-message">
					Results that would add more units to the list than you have in your collection will be marked with a <AlertIcon fill="var(--warning)" height="15px" />
				</p>
			{/if}
			{#each ["any", "all", "none"] as type}
				<fieldset>
					<legend>
						<p>Unit must have <span class="primary">{type}</span> of the following tags</p>
						<button class="transparent-button" onclick={() => (editing = type)}> Select tags</button>
					</legend>
					<div class="tag-list">
						{#each filter[type] as tag, tagIndex}
							{const rgb = $derived<RGB>(JSON.parse(tag.color, (key, value) => reviveNumber(key, value)))}
							<button style={`--rgb: rgb(${rgb.r * 255} ${rgb.g * 255} ${rgb.b * 255})`} class="tag" onclick={() => filter[type].splice(tagIndex, 1)}>
								{tag.label}
							</button>
						{:else}
							<p class="tag">No tags selected</p>
						{/each}
					</div>
				</fieldset>
			{/each}
			<div class="space-between">
				<a class="collection-link" href="/collection" target="_blank">Edit Collection</a>
				<button onclick={() => (open = false)}>Close</button>
			</div>
		{:else}
			{const userTags = $derived(await getTags())}
			{const availableTags = $derived(userTags.filter((t) => !filter[editing!].find((f: Omit<CollectionTag, "userId">) => f.id == t.id)))}
			<fieldset class="editing-field">
				<legend
					><p>Unit must have <span class="primary">{editing}</span> of the following tags</p>
					<button class="transparent-button" onclick={() => (filter[editing!] = [])}>Clear All</button></legend
				>
				<div class="tag-list">
					{#each filter[editing] as tag, tagIndex}
						{const rgb = $derived<RGB>(JSON.parse(tag.color, (key, value) => reviveNumber(key, value)))}
						<button style={`--rgb: rgb(${rgb.r * 255} ${rgb.g * 255} ${rgb.b * 255})`} class="tag" onclick={() => filter[editing!].splice(tagIndex, 1)}>
							{tag.label}
						</button>
					{:else}
						<p class="tag">No Tags Selected</p>
					{/each}
				</div>
			</fieldset>
			<fieldset>
				<legend>Available Tags</legend>
				<div class="tag-list">
					{#each availableTags as tag}
						{const rgb = $derived<RGB>(JSON.parse(tag.color, (key, value) => reviveNumber(key, value)))}
						<button style={`--rgb: rgb(${rgb.r * 255} ${rgb.g * 255} ${rgb.b * 255})`} class="tag" onclick={() => filter[editing!].push(tag)}>
							{tag.label}
						</button>
					{:else}
						<p class="tag">No Tags Remaining</p>
					{/each}
				</div>
			</fieldset>
			<button onclick={() => (editing = undefined)}>Close</button>
		{/if}
	</div>
</Dialog>

<style>
	.collection-dialog-body {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: min-content;
	}
	fieldset {
		width: min(95dvw, 450px);
	}
	.editing-field {
		min-height: 3em;
	}
	legend {
		display: flex;
		gap: 24px;
	}
	.tag-list {
		display: flex;
		flex-wrap: wrap;
		gap: 16px 10px;
		padding: var(--responsive-padding);
		align-items: center;
	}
	.tag {
		font-size: 0.9em;
		padding: 4px 8px;
		border-radius: var(--radius);
		display: flex;
		gap: 8px;
		color: var(--surface-color-light-text-color);
		height: max-content;
		background-color: var(--rgb, var(--surface-color-extra-light));
		color: hwb(from oklch(from var(--rgb, var(--surface-color-light)) l 0 0) h calc(((b - 50) * 999)) calc(((w - 50) * 999)));
	}
	span.primary {
		font-weight: bold;
	}
	button {
		width: max-content;
		align-self: flex-end;
	}
	.warning-message {
		font-size: 0.9em;
	}
</style>
