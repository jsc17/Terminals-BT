<script lang="ts">
	import { SearchFilters, SearchResults } from "$lib/components/index";
	import { onMount } from "svelte";
	import { resultList } from "$lib/utilities/resultList.svelte";
	import { filters } from "./filters";

	let status = $state<"waiting" | "loading" | "loaded" | "error">("loading");
	onMount(() => {
		resultList.clear();
		resultList.customCards = undefined;
		resultList.restrictions = undefined;
		resultList.filters = filters;
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
	}
</style>
