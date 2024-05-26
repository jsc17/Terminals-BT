<script lang="ts">
	import { SearchFilters, SearchResults } from "./components/index";
	import { onMount } from "svelte";
	import { resultList } from "./resultList.svelte";

	let status = $state<"waiting" | "loading" | "loaded" | "error">("loading");
	onMount(() => {
		resultList.clear();
		resultList.customCards = undefined;
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
	<h2>Era and faction filtering coming soon. There might be a slight delay when applying the first filter as it's processing a lot of units.</h2>
	<SearchFilters></SearchFilters>
	<SearchResults bind:status></SearchResults>
</main>

<style>
	main {
		margin: 0;
		position: relative;
		padding: 8px;
		width: 100%;
	}
</style>
