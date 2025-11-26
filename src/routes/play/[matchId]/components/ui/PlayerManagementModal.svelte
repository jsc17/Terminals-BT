<script lang="ts">
	import { Dialog } from "$lib/generic";

	type Props = {
		open: boolean;
	};

	let { open = $bindable() }: Props = $props();
</script>

<Dialog title="Manage Players" bind:open></Dialog>
