<svelte:options css="injected" />

<div class="crit-block-body">
	<p class="crit-header">Engine</p>
	<div class="crit-line">
		{#each { length: 1 }, index}
			<div class="pip"></div>
		{/each}
		<p>1/2 THR</p>
	</div>

	<p class="crit-header">Fire Control</p>
	<div class="crit-line">
		{#each { length: 4 }, index}
			<div class="pip"></div>
		{/each}
		<p>+2 To-Hit</p>
	</div>
	<p class="crit-header">Weapons</p>
	<div class="crit-line">
		{#each { length: 4 }, index}
			<div class="pip"></div>
		{/each}
		<p>-1 Dmg</p>
	</div>
</div>

<style>
	p {
		margin: 0;
		padding: 0;
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
		font-size: 3cqh;
	}
	.crit-line {
		display: flex;
		gap: 0.5cqw;
		align-items: center;
		p {
			font-size: 3cqh;
			margin-left: 0.5cqw;
			white-space: nowrap;
			overflow: hidden;
		}
	}
	.pip {
		background-color: white;
		border: 0.25cqw solid black;
		border-radius: 50%;
		height: 2.25cqmin;
		width: 2.25cqmin;
	}
</style>
