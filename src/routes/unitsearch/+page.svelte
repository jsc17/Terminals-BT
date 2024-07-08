<script lang="ts">
	import { setContext } from "svelte";
	import { ResultList } from "$lib/types/resultList.svelte";
	import { SearchFilters, SearchParameters, SearchResults } from "$lib/components/index";

	export const resultList = new ResultList();

	setContext("resultList", resultList);
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
