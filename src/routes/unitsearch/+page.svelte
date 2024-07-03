<script lang="ts">
	import { SearchFilters, SearchResults, SearchParameters } from "./components/index";
	import { resultList } from "./resultList.svelte";
</script>

<main>
	<SearchParameters></SearchParameters>
	<SearchFilters></SearchFilters>
	<SearchResults></SearchResults>
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
