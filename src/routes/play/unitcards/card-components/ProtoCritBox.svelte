<script lang="ts">
	import type { PlayUnit } from "$lib/types/unit";

	type Props = {
		unit: PlayUnit;
	};

	let { unit }: Props = $props();
</script>

<div class="crit-block-body">
	<p class="crit-header">Fire Control</p>
	<div class="crit-line">
		{#each { length: 4 }, index}
			<div class="pip" class:damaged={unit.current.crits.fireControl > index}></div>
		{/each}
		<p>+2 To-Hit</p>
	</div>
	<p class="crit-header">MP</p>
	<div class="crit-line">
		{#each { length: 4 }, index}
			<div class="pip" class:damaged={unit.current.crits.mp > index}></div>
		{/each}
		<p>1/2 MV</p>
	</div>
	<p class="crit-header">Weapons</p>
	<div class="crit-line">
		{#each { length: 4 }, index}
			<div class="pip" class:damaged={unit.current.crits.weapon > index}></div>
		{/each}
		<p>-1 Damage</p>
	</div>
</div>

<style>
	p {
		color: black;
	}
	.crit-block-body {
		display: grid;
		grid-template-columns: min-content 1fr;
		column-gap: 0.5cqw;
		row-gap: 1cqh;
	}
	.crit-header {
		font-weight: bold;
		align-self: center;
		text-align: end;
		white-space: nowrap;
		font-size: 2.25cqmax;
	}
	.crit-line {
		display: flex;
		gap: 0.5cqw;
		align-items: center;
		p {
			font-size: 2.25cqmax;
			margin-left: 0.5cqw;
			white-space: nowrap;
			overflow: hidden;
		}
	}
	.pip {
		background-color: white;
		border: 0.25cqw solid black;
		border-radius: 50%;
		height: 2.5cqmax;
		width: 2.5cqmax;
	}
	.damaged {
		background-color: red;
	}
</style>
