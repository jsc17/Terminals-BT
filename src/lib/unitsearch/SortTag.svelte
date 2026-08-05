<script lang="ts">
	import { DragIndicatorIcon, SortAscendingIcon, SortDescendingIcon, TrashIcon } from "$lib/icons";
	import type { ResultList } from "$lib/types/resultList.svelte";
	import { createSortable } from "@dnd-kit/svelte/sortable";

	type Props = {
		id: string;
		index: number;
		label: string;
		order: "asc" | "desc";
		isOverlay: boolean;
		extra?: any;
		resultList: ResultList;
	};

	let { id, index, label, order, isOverlay, resultList }: Props = $props();

	const sortable = createSortable({
		get id() {
			return id;
		},
		get index() {
			return index;
		},
		data: { id, index, label, order }
	});
</script>

<div class={{ "dragging-outline": sortable.isDragging && !isOverlay }} {@attach sortable.attach}>
	<div class={{ "sort-tag": true, "dragging-hidden": sortable.isDragging && !isOverlay }}>
		<div class="sort-drag-handle" {@attach sortable.attachHandle}>
			<DragIndicatorIcon height="20" />
		</div>
		<button class="sort-button" onclick={() => resultList.setSortKeyOrder(id)}>
			<p>
				{index + 1} -
				{label}
			</p>
			{#if order == "asc"}
				<SortAscendingIcon width="20" height="20" />
			{:else}
				<SortDescendingIcon width="20" height="20" />
			{/if}
		</button>
		<button class="sort-trash-button" onclick={() => resultList.removeSortKey(id)}>
			<TrashIcon height="20" />
		</button>
	</div>
</div>

<style>
	.sort-tag {
		display: flex;
		background-color: var(--button-background);
		color: var(--button-text);
		align-items: center;
		text-align: center;
		border-radius: 4px;
		height: 100%;
		padding: 0;
	}
	.sort-button {
		display: flex;
		background-color: transparent;
		align-items: center;
		justify-content: center;
		padding: 0px 6px;

		gap: 6px;
		& p {
			font-weight: 700;
			line-height: 1;
			border-radius: 0;
			font-size: 0.95em;
			color: var(--button-text);
		}
	}
	.sort-tag:active {
		cursor: grabbing;
	}
	.sort-drag-handle {
		background-color: grey;
		cursor: grab;
		display: flex;
		padding: 0px 4px;
		margin-right: 4px;
		border-right: 1px solid black;
		align-items: center;
		justify-content: center;
		border-radius: 4px 0 0 4px;
	}
	.sort-trash-button {
		background-color: grey;
		display: flex;
		padding: 0px 4px;
		margin-left: 4px;
		border-left: 1px solid black;
		align-items: center;
		justify-content: center;
		border-radius: 0 4px 4px 0;
	}
	.dragging-hidden {
		visibility: hidden;
	}
	.dragging-outline {
		background-color: hsl(from var(--primary) h s l / 30%);
		border: 1px solid var(--primary);
		border-radius: 4px;
	}
</style>
