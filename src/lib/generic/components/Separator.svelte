<script lang="ts">
	import { Separator } from "bits-ui";

	type Props = {
		orientation?: "vertical" | "horizontal";
		classes?: string;
	};

	let { orientation = "horizontal", classes = "separator-border" }: Props = $props();
</script>

<Separator.Root {orientation} class={classes} />
