<script lang="ts">
	import { Html, Text, Link, Head, Section } from "svelty-email";

	const { organizer, tournamentName, playerName, existing } = $props() as { organizer: string; tournamentName: string; playerName: string; existing: boolean };
</script>

<Html>
	<Head />
	<Section>
		<Text>Hello, {organizer}</Text>
		<Text>{playerName} has submitted a list for your tournament {tournamentName}</Text>
		{#if existing}
			<Text>They have previously submitted a list.</Text>
		{:else}
			<Text>This is the first list they have submitted</Text>
		{/if}
		<Link href="bt.terminl.xyz/tournament">Click here to open the tournament dashboard</Link>
	</Section>
</Html>
