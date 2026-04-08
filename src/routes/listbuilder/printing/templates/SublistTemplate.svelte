<svelte:options css="injected" />

<script lang="ts">
	import { getBSCbyId } from "$lib/data/battlefieldSupport";
	import type { PrintableSublist } from "../types";

	type Props = {
		sublists: PrintableSublist[];
		layout: "vertical" | "horizontal";
		grouped: boolean;
		name: string;
	};

	let { sublists, layout, grouped, name }: Props = $props();

	const sublistsSorted = $derived(grouped ? sublists.sort((a, b) => a.scenario.localeCompare(b.scenario)) : sublists);
</script>

<body>
	<h1>{name} sublists:</h1>
	<div class={layout}>
		{#each sublistsSorted as sublist}
			{@const bfsTotals = sublist.bfs.reduce(
				(total: { bsp: number; pv: number; count: number }, [bfsId, count]: [number, number]) => {
					const bsData = getBSCbyId(bfsId);
					return { bsp: total.bsp + count * (bsData?.bspCost ?? 0), pv: total.pv + count * (bsData?.pvCost ?? 0), count: total.count + count };
				},
				{ bsp: 0, pv: 0, count: 0 }
			)}
			{@const unitTotals = sublist.unitList.reduce(
				(total, unit: any) => {
					return {
						pv: total.pv + unit.cost,
						health: total.health + (unit.baseUnit.health ?? 0),
						size: total.size + (unit.baseUnit.size ?? 0),
						damageS: total.damageS + (unit.baseUnit.damageS ?? 0),
						damageM: total.damageM + (unit.baseUnit.damageM ?? 0),
						damageL: total.damageL + (unit.baseUnit.damageL ?? 0)
					};
				},
				{ pv: 0, health: 0, size: 0, damageS: 0, damageM: 0, damageL: 0 }
			)}
			{#if layout == "vertical"}
				<div class="sublist-vertical">
					<p class="bold">
						{sublist.scenario} - {sublist.pv}pv - {sublist.unitList.length}
						{sublist.unitList.length == 1 ? "Unit" : "Units"}
						{bfsTotals.count ? `- ${bfsTotals.count} BFS` : ""}
					</p>
					<div class="sublist-vertical-body">
						<div class="unit-container">
							<div class="row header">
								<p class="bold">Units - {unitTotals.pv}pv</p>
								<p class="bold center">PV(half)</p>
							</div>
							{#each sublist.unitList as unit}
								<p>({unit.skill}) {unit.baseUnit.name}</p>
								<p class="center">{unit.cost} ({Math.round(unit.cost / 2)})</p>
							{/each}
						</div>
						{#if sublist.bfs.length > 0}
							<div class="unit-container">
								<div class="row header">
									<p class="bold">
										Battlefield Support - {bfsTotals.bsp > 0 ? `${bfsTotals.bsp}bsp` : ""}{bfsTotals.bsp > 0 && bfsTotals.pv > 0 ? " - " : ""}{bfsTotals.pv > 0
											? `${bfsTotals.pv}pv`
											: ""}
									</p>
									<p class="bold center">{bfsTotals.bsp > 0 ? "BSP" : ""}{bfsTotals.bsp > 0 && bfsTotals.pv > 0 ? "/" : ""}{bfsTotals.pv > 0 ? "PV" : ""}</p>
								</div>
								{#each sublist.bfs as [bfsId, count]}
									{@const bsData = getBSCbyId(bfsId)}
									<p>{bsData?.name ?? "Unknown"} x{count}</p>
									<p class="center">
										{bfsTotals.bsp > 0 ? count * (bsData?.bspCost ?? 0) : ""}{bfsTotals.bsp > 0 && bfsTotals.pv > 0 ? "/" : ""}{bfsTotals.pv > 0
											? count * (bsData?.pvCost ?? 0)
											: ""}
									</p>
								{/each}
							</div>
						{/if}
					</div>
					<p class="bold summary-row">
						Health: {unitTotals.health} Size: {unitTotals.size} Damage: {unitTotals.damageS}/{unitTotals.damageM}/{unitTotals.damageL}
					</p>
				</div>
			{:else}
				<div class="sublist-horizontal">
					<div class="horizontal-header">
						<p class="bold">
							{sublist.scenario} - {sublist.pv}pv - {sublist.unitList.length}
							{sublist.unitList.length == 1 ? "Unit" : "Units"}
							{bfsTotals.count ? `- ${bfsTotals.count} Battlefield Support` : ""}
						</p>
						<p class="bold">Health: {unitTotals.health} Size: {unitTotals.size} Damage: {unitTotals.damageS}/{unitTotals.damageM}/{unitTotals.damageL}</p>
					</div>
					<p>
						<span class="bold">Units ({unitTotals.pv}pv):</span>
						{sublist.unitList.map((unit) => `(${unit.skill}) ${unit.baseUnit.name}`).join(", ")}
					</p>
					{#if sublist.bfs.length > 0}
						<p>
							<span class="bold"
								>BFS ({bfsTotals.bsp > 0 ? `${bfsTotals.bsp}bsp` : ""}{bfsTotals.bsp > 0 && bfsTotals.pv > 0 ? " - " : ""}{bfsTotals.pv > 0 ? `${bfsTotals.pv}pv` : ""}):</span
							>
							{sublist.bfs
								.map(([bfsId, count]) => {
									const bsData = getBSCbyId(bfsId);
									return `${bsData?.name ?? "Unknown"} x${count}`;
								})
								.join(", ")}
						</p>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</body>

<style>
	* {
		font-family: "Helvetica", sans-serif;
	}
	p {
		font-size: 8pt;
		margin: 0;
	}
	p.center {
		text-align: center;
	}
	.vertical {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6pt;
	}
	.horizontal {
		display: flex;
		flex-direction: column;
		gap: 6pt;
	}
	.sublist-vertical {
		display: grid;
		grid-auto-rows: max-content 1fr max-content;
		margin-bottom: 16pt;
		border: 1px solid black;
		padding: 3pt;
		row-gap: 4pt;
	}

	.sublist-vertical-body {
		display: flex;
		flex-direction: column;
		gap: 4pt;
	}
	.unit-container {
		display: grid;
		grid-template-columns: 1fr max-content;
		gap: 1pt 10px;
	}
	.row {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: 1 / -1;
	}
	.header {
		border-bottom: 1px solid black;
		margin-bottom: 2pt;
	}
	.footer {
		border-top: 1px solid black;
		margin-top: 2pt;
	}
	.bold {
		font-weight: bold;
	}
	.summary-row {
		grid-column: 1 / -1;
		margin-top: 2pt;
	}
	.sublist-horizontal {
		display: flex;
		flex-direction: column;
		gap: 4pt;
		border: 1px solid black;
		padding: 3pt;
	}
	.horizontal-header {
		display: flex;
		justify-content: space-between;
	}
</style>
