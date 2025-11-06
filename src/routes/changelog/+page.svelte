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
			<li>Formation Bonuses in play feature</li>
			<li>Collection manager</li>
			<li>Customizable rules in the list builder</li>
		</ul>
		<h3>General updates: Idea's I'd like to implement when I have time</h3>
		<ul>
			<li>Finish tournament organization</li>
			<li>Layout customization</li>
			<li>Favorite and save units/formation for quick adding</li>
		</ul>
		<h3>Low priority updates: Someday, possibly</h3>
		<ul>
			<li>Public player list sharing</li>
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
		color: var(--surface-color-light-text-color);
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
		color: var(--primary);
	}
	.strikethrough {
		color: var(--primary);
		text-decoration: line-through;
	}
</style>
