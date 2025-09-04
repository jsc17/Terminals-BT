<script lang="ts">
	import { Html, Text, Head, Section } from "svelty-email";

	type Props = {
		tournamentName: string;
		playerName: string;
		playerEmail: string;
		era: string;
		faction: string;
		tournamentRules: string;
		fixed: boolean;
	};
	const { tournamentName, playerName, playerEmail, era, faction, tournamentRules, fixed }: Props = $props();
</script>

<Html>
	<Head />
	<Section>
		<Text>{playerName} has submitted a list for {tournamentName}</Text>
		<Text>Email: {playerEmail}</Text>
		<Text>Era: {era}</Text>
		<Text>Faction: {faction}</Text>
		<Text>The attached list has passed all validation checks for {tournamentRules}</Text>
		{#if fixed}
			<Text>Units were manually fixed.</Text>
		{/if}
	</Section>
</Html>
