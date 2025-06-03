<script lang="ts">
	import { Separator } from "bits-ui";

	type Props = {
		orientation?: "vertical" | "horizontal";
		classes?: string;
	};

	let { orientation = "horizontal", classes = "separator-border" }: Props = $props();
</script>

<Separator.Root {orientation} class={classes} />

<style>
	:global([data-separator-root]) {
		flex-shrink: 0;
		align-self: center;
	}
	:global(.separator-primary) {
		background-color: var(--primary);
	}
	:global(.separator-muted) {
		background-color: var(--muted);
	}
	:global(.separator-border) {
		background-color: var(--border);
	}
	:global(.separator-card) {
		background-color: var(--card-foreground);
	}
	:global([data-separator-root][data-orientation="vertical"]) {
		width: 1px;
		height: 90%;
		margin: 0px 4px;
	}
	:global([data-separator-root][data-orientation="horizontal"]) {
		width: 90%;
		height: 1px;
		margin: 4px 0px;
	}
</style>
