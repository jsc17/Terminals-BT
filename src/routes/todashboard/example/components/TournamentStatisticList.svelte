<script lang="ts">
	import { Popover } from "$lib/generic";
	import Trophy from "phosphor-svelte/lib/Trophy";

	type Props = {
		title: string;
		display: string;
		data: any[];
		placeLimit: number;
	};

	let { title, display, data, placeLimit = 3 }: Props = $props();

	let keys = $derived([...display.matchAll(/\[\w+]/g)].map((r) => r[0].replaceAll(/[\[\]]/g, "")));

	function getParsedString(row: any) {
		let parsed = display;
		for (const key of keys) {
			parsed = parsed.replace(`[${key}]`, row[key]);
		}
		return `<p class="muted">${parsed}</p>`;
	}
</script>

<div class="list-wrapper">
	<p class="list-title">{title}</p>
	<div class="list-body">
		{#each data.slice(0, placeLimit) as row, index}
			<div class="list-row">
				{#if index == 0}
					<Trophy color="gold" weight="fill" />
				{:else if index == 1}
					<Trophy color="silver" weight="fill" />
				{:else if index == 2}
					<Trophy color="#cd7f32" weight="fill" />
				{:else}
					<p>{index + 1}th</p>
				{/if}
				<div class="name-row">
					{#each row[1].slice(0, 3) as name}
						{@html getParsedString(name)}
					{/each}
					{#if row[1].length >= 3}
						<div class="show-all-line">
							<p class="muted">+ {row[1].length - 3} others...</p>
							<Popover>
								{#snippet trigger()}
									<div class="primary">(show all)</div>
								{/snippet}
								<div class="show-all-popover">
									<p>...</p>
									{#each row[1].slice(3) as name}
										{@html getParsedString(name)}
									{/each}
								</div>
							</Popover>
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.list-wrapper {
		border: 1px solid var(--table-border);
		border-radius: var(--radius);
		display: flex;
		flex-direction: column;
		width: max-content;
		height: max-content;
		margin-bottom: 16px;
	}
	.list-title {
		border-bottom: 1px solid var(--table-border);
		padding: 2px 16px;
	}
	.list-body {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 2px;
	}
	.list-row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 2;
		column-gap: 12px;
		padding: 4px 8px;
	}
	.list-row:not(:last-child) {
		border-bottom: 1px solid var(--table-border);
	}
	.name-row {
		display: flex;
		flex-direction: column;
	}
	.show-all-line {
		display: flex;
		gap: 4px;
		align-items: center;
		margin-top: 6px;
	}
	.show-all-popover {
		padding: var(--responsive-padding);
	}
</style>
