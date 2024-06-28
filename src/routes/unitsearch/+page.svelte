<script lang="ts">
	import { SearchFilters, SearchResults } from "./components/index";
	import { onMount } from "svelte";
	import { resultList } from "./resultList.svelte";

	let status = $state<"waiting" | "loading" | "loaded" | "error">("loading");
	onMount(() => {
		resultList.clear();
		resultList.restrictions = undefined;
		resultList.loadUnitsSql();
		status = "loading";
	});

	$effect(() => {
		if (resultList.results.length) {
			status = "loaded";
		}
	});
</script>

<main>
	<SearchFilters></SearchFilters>
	<SearchResults bind:status></SearchResults>
</main>

<style>
	main {
		margin: 0;
		position: relative;
		padding: 8px;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		flex: 1;
		overflow: hidden;
		gap: 4px;
	}
</style>
