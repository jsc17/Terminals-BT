<script lang="ts">
	import { page } from "$app/state";
</script>

<main>
	<h1>Error {page.status}: {page.error?.message}</h1>
</main>

<style>
	main {
		padding: var(--responsive-padding);
	}
</style>
