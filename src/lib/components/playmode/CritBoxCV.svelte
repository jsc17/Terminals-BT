<script lang="ts">
	import type { PlayUnit } from "$lib/types/playmode";
	import type { CritList } from "$lib/utilities/playmodeAutomation";

	type Props = {
		unit: PlayUnit;
		critCount: { current: CritList; pending: CritList };
	};

	let { unit, critCount }: Props = $props();
</script>

<div class="crit-block-body">
	<p class="crit-header">Engine</p>
	<div class="crit-line">
		{#each { length: 1 }, index}
			<div
				class="pip"
				class:damaged={critCount.current.engine > index}
				class:pending-pip={critCount.current.engine <= index && critCount.current.engine + critCount.pending.engine > index}
			></div>
		{/each}
		<p>1/2 MV and Dmg</p>
	</div>

	<p class="crit-header">Fire Control</p>
	<div class="crit-line">
		{#each { length: 4 }, index}
			<div
				class="pip"
				class:damaged={critCount.current.firecontrol > index}
				class:pending-pip={critCount.current.firecontrol <= index && critCount.current.firecontrol + critCount.pending.firecontrol > index}
			></div>
		{/each}
		<p>+2 To-Hit</p>
	</div>
	<p class="crit-header">Weapons</p>
	<div class="crit-line">
		{#each { length: 4 }, index}
			<div
				class="pip"
				class:damaged={critCount.current.weapon > index}
				class:pending-pip={critCount.current.weapon <= index && critCount.current.weapon + critCount.pending.weapon > index}
			></div>
		{/each}
		<p>-1 Dmg</p>
	</div>
</div>
<p class="motive-header">Motive</p>
<div class="motive-line">
	<div class="motive-section">
		{#each { length: 2 }, index}
			<div
				class="pip"
				class:damaged={critCount.current.mhit > index}
				class:pending-pip={critCount.current.mhit <= index && critCount.current.mhit + critCount.pending.mhit > index}
			></div>
		{/each}
		<p>-2 MV</p>
	</div>
	<div class="motive-section">
		{#each { length: 2 }, index}
			<div
				class="pip"
				class:damaged={critCount.current.mhalf > index}
				class:pending-pip={critCount.current.mhalf <= index && critCount.current.mhalf + critCount.pending.mhalf > index}
			></div>
		{/each}
		<p>1/2 MV</p>
	</div>
	<div class="motive-section">
		{#each { length: 1 }, index}
			<div class="pip" class:damaged={critCount.current.mimm} class:pending-pip={critCount.current.mimm <= index && critCount.current.mimm + critCount.pending.mimm > index}></div>
		{/each}
		<p>0 MV</p>
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
		& p {
			font-size: 2.25cqmax;
			margin-left: 0.5cqw;
			white-space: nowrap;
			overflow: hidden;
		}
	}
	.motive-header {
		font-weight: bold;
		font-size: 2.25cqmax;
		justify-self: center;
	}
	.motive-line {
		display: flex;
		justify-content: space-between;
	}
	.motive-section {
		display: flex;
		gap: 0.5cqw;
		& p {
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
	.pending-pip {
		background-color: yellow;
	}
</style>
