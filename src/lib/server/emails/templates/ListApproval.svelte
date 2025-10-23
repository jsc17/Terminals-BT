<script lang="ts">
	import { Html, Text, Head, Section } from "svelty-email";

	type Props = {
		tournamentName: string;
		playerName: string;
	};
	const { tournamentName, playerName }: Props = $props();
</script>

<Html>
	<Head />
	<Section>
		<Text>
			{playerName}, your list for {tournamentName} has been approved by the tournament organizer.
		</Text>
	</Section>
</Html>
