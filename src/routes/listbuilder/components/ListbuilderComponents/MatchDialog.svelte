<script lang="ts">
	import { Dialog } from "$lib/generic";
	import { Tabs } from "bits-ui";

	type Props = {
		open: boolean;
	};

	let { open = $bindable(false) }: Props = $props();
</script>

<Dialog bind:open title={`Placeholder Title`}>
	<Tabs.Root value="add">
		<Tabs.List class="matchUnitTabs">
			<Tabs.Trigger class="matchUnitTrigger" value="newTab">New Match</Tabs.Trigger>
			<Tabs.Trigger class="matchUnitTrigger" value="joinTab">Join Match</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="newTab"></Tabs.Content>
		<Tabs.Content value="joinTab"></Tabs.Content>
	</Tabs.Root>
</Dialog>

<style>
</style>
