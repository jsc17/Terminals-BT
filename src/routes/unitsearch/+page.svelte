<script lang="ts">
	import { ResultList } from "$lib/types/resultList.svelte";
	import { SearchFilters, SearchParameters, SearchResults } from "$lib/components/UnitSearch/index";

	let resultList = $state(new ResultList());
</script>

<main>
	<SearchParameters bind:resultList></SearchParameters>
	<SearchFilters bind:resultList></SearchFilters>
	<SearchResults bind:resultList></SearchResults>
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
