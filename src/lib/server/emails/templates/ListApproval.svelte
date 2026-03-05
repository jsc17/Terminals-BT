<script lang="ts">
	import { Html, Text, Head, Section } from "svelty-email";

	type Props = {
		tournamentName: string;
		playerName: string;
		comment: string;
	};
	const { tournamentName, playerName, comment }: Props = $props();
</script>

<Html>
	<Head />
	<Section>
		<Text>
			{playerName}, your list for {tournamentName} has been approved by the tournament organizer.
		</Text>
		{#if comment}
			<Text>Comment from the TO: <br />{comment}</Text>
		{/if}
	</Section>
</Html>
