<script lang="ts">
	import { page } from "$app/state";
	import { loadSharedList } from "$lib/remote/list.remote";
	import { List } from "$lib/types/list.svelte";
	import { safeParseJSON } from "$lib/utilities/utilities";
	import { PlaymodeOptionsSchema, type PlaymodeOptionsOutput } from "$routes/play/schema/playmode";
	import { PersistedState, watch } from "runed";
	import PrintUnitCard from "$lib/cardgeneration/templates/PrintUnitCard.svelte";
	import * as v from "valibot";
	import { getMulImage } from "$lib/remote/mulImages.remote";
	import { DropdownMenu } from "$lib/generic";
	import PlayModal from "$lib/sharedDialogs/PlayModal.svelte";
	import PrintModal from "$lib/sharedDialogs/PrintModal.svelte";
	import { db } from "$lib/offline/db";
	import DisplayOptionsPopover from "./DisplayOptionsPopover.svelte";

	const shareCode = page.url.searchParams.get("share");
	const sharedListCode = $derived(shareCode ? await loadSharedList(shareCode) : undefined);
	const list = $state<List>(new List());

	watch(
		() => sharedListCode,
		() => {
			if (sharedListCode) list.loadList(sharedListCode);
		}
	);

	const options = new PersistedState<PlaymodeOptionsOutput>("playOptions", v.parse(PlaymodeOptionsSchema, {}), {
		serializer: {
			serialize: JSON.stringify,
			deserialize: (savedData) => v.parse(PlaymodeOptionsSchema, safeParseJSON(savedData) ?? {})
		}
	});

	let formationWidth = $state<number>();
	let cardWidth = $derived((formationWidth! - 16 - 8 * (options.current.cardsPerRow ?? 3)) / (options.current.cardsPerRow ?? 3));

	let playDialog = $state<PlayModal>();
	let printDialogOpen = $state(false);

	async function loadInListBuilder() {
		if (sharedListCode) {
			await db.previousLists.put(sharedListCode);
			window.location.href = "/listbuilder";
		}
	}
</script>

{#snippet drawFormationUnits(formationUnits: string[])}
	<div class="formation-unit-list" bind:clientWidth={formationWidth}>
		{#each formationUnits as unitId}
			{@const unitData = list.getUnit(unitId)}
			{#if unitData}
				<div class="unit-card-container" style="width: {cardWidth}px; height:{(cardWidth * 5) / 7}px">
					<PrintUnitCard
						unit={unitData}
						formationSPAs={[]}
						measurementUnits={options.current.measurementUnits}
						printDuplicateMarkings={false}
						numberingType={options.current.duplicateUnitMarkings}
					/>
				</div>
			{/if}
		{/each}
	</div>
{/snippet}

{#if sharedListCode}
	{#if list.unitCount > 0}
		<div class="share-header-bar">
			<h1 class="share-list-name">{list.details.name} - {list.unitCount} units - {list.pv}pv</h1>

			<div class="share-list-buttons">
				<div>
					<DisplayOptionsPopover options={options.current} />
				</div>

				<div>
					<DropdownMenu
						items={[
							{ type: "item", label: "Load List in Listbuilder", onSelect: () => loadInListBuilder() },
							{ type: "item", label: "Print List", onSelect: () => (printDialogOpen = true) },
							{ type: "item", label: "Play List", onSelect: () => playDialog?.open(list) }
						]}
					>
						{#snippet trigger()}
							Menu
						{/snippet}
					</DropdownMenu>
				</div>
			</div>
		</div>
		{#each list.formations as formation}
			{#if formation.units.length || formation.secondary?.units.length}
				<div class="formation-container">
					{#if formation.units.length}
						<div class="formation-header">
							<p>{formation.name != "Unassigned units" ? formation.name : ""}{formation.type != "none" ? `- ${formation.type}` : ""}</p>
							<div></div>
						</div>
					{/if}
					{@render drawFormationUnits(formation.units.map((u) => u.id))}
					{#if formation.secondary?.units?.length}
						<div class="secondary-header">
							<p>{formation.secondary.type}</p>
						</div>
						{@render drawFormationUnits(formation.secondary.units.map((u) => u.id))}
					{/if}
				</div>
			{/if}
		{/each}
	{:else}
		<p>Loading units</p>
	{/if}
{:else}
	<p>No list loaded</p>
{/if}

<PlayModal bind:this={playDialog} />
<PrintModal {list} bind:open={printDialogOpen} />

<style>
	.share-header-bar {
		display: flex;
		justify-content: space-between;
		padding: var(--responsive-padding);
	}
	.share-list-name {
		font-size: clamp(16px, 2dvw, 30px);
	}
	.share-list-buttons {
		display: flex;
		gap: min(16px, 2dvw);
	}
	.formation-container {
		width: 100%;
		border: 1px solid var(--primary-dark);
		border-radius: var(--radius);
		margin-bottom: 8px;
	}
	.formation-header,
	.secondary-header {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		align-items: center;
		border-bottom: 1px solid var(--border);
		background-color: var(--surface-color);
	}
	.formation-header {
		padding: 4px 16px;
		gap: 16px;
		border-top-left-radius: var(--radius);
		border-top-right-radius: var(--radius);
	}
	/* .play-formation-header-bonus {
		display: flex;
		justify-content: center;
	} */
	.secondary-header {
		padding: 2px 16px;
	}
	.formation-unit-list {
		padding: 8px;
		display: flex;
		justify-content: space-evenly;
		flex-wrap: wrap;
		gap: 8px;
		width: 100%;
	}
	.unit-card-container {
		container: unit-card / size;
		aspect-ratio: 7 / 5;
	}
</style>
