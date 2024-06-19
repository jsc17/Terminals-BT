<script lang="ts">
	let { data } = $props();
</script>

<main>
	<div class="card">
		<h2>Change log:</h2>
		{#each data.changelogData as entry}
			<section>
				<h3 class="date">{entry.date}</h3>
				{#if entry.notice}
					<div class="notice">{entry.notice}</div>
				{/if}
				{#each Object.keys(entry.updates) as key}
					<h3 class="system">{key}</h3>
					<ul>
						{#each entry.updates[key] as update}
							<li class="update">{update}</li>
						{/each}
					</ul>
				{/each}
				<hr />
			</section>
		{/each}
	</div>
	<div class="card roadmap">
		<h2>Road Map:</h2>
		<h3>Priority updates that will be added as fast I can work on them:</h3>
		<ul>
			<li>Era and faction filtering in unit search</li>
			<li>Customizable rules in the list builder</li>
			<li>Reimplement list builder validation</li>
			<li>multiple era and faction selections</li>
			<li>Improved list sharing capabilities</li>
		</ul>
		<h3>Idea's I'd like to implement when I have time:</h3>
		<ul>
			<li>Finish tournament organization</li>
			<li>Layout customization</li>
			<li>Favorite and save units/formation for quick adding</li>
			<li>Alternate Ammo/Pilot SPA's</li>
			<li>Battlefield Support Cards</li>
			<li>Formation validation</li>
		</ul>
		<h3>Someday, possibly:</h3>
		<ul>
			<li>Public player list sharing</li>
			<li>Play feature (might not be worth the effort when other tools already exist)</li>
		</ul>
	</div>
</main>

<style>
	main {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
		padding: 16px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	h3 {
		padding-left: 16px;
		font-size: 1rem;
		color: var(--muted-foreground);
		margin: 0px;
	}
	ul {
		margin: 0;
	}
	.roadmap {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.date {
		color: var(--primary);
	}
	.notice {
		color: var(--primary);
	}
	.notice,
	.update {
		margin-left: 24px;
	}
</style>
