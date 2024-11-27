<script lang="ts">
	let { data } = $props();
</script>

<main>
	<div class="card changelog">
		<h2>Change log:</h2>
		<ul>
			{#if data}
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
			{/if}
		</ul>
	</div>
	<div class="card roadmap">
		<h2>Road Map:</h2>
		<h3>Priority updates: Things I really want to get done</h3>
		<ul>
			<li><span class="complete">Era and faction filtering in unit search</span> (added 6-30-24)</li>
			<li>Customizable rules in the list builder</li>
			<li><span class="complete">Reimplement list builder validation</span> (7-13-24)</li>
			<li>multiple era and faction selections</li>
			<li>Improved list sharing capabilities</li>
			<li>Expanded sublist generation options</li>
		</ul>
		<h3>General updates: Idea's I'd like to implement when I have time</h3>
		<ul>
			<li>Finish tournament organization</li>
			<li>Layout customization</li>
			<li>Favorite and save units/formation for quick adding</li>
			<li>Alternate Ammo/Pilot SPA's</li>
			<li>Battlefield Support Cards</li>
			<li>Formation validation</li>
		</ul>
		<h3>Low priority updates: Someday, possibly</h3>
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
		height: 100%;
		position: relative;
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
	.changelog {
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: auto;
		gap: 8px;
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
	.complete {
		text-decoration: line-through;
		color: var(--primary);
	}
</style>
