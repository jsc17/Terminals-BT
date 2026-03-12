<script lang="ts">
	import { Html, Text, Head, Section, Link, Hr } from "svelty-email";

	type Props = {
		id: string;
		tournamentName: string;
		playerName: string;
		playerEmail: string;
		era: string;
		faction: string;
		tournamentRules: string;
		fixed: boolean;
		parsedAddedUnits: { name: string; skill: number }[];
	};
	const { tournamentName, playerName, playerEmail, era, faction, tournamentRules, parsedAddedUnits }: Props = $props();
</script>

<Html>
	<Head />
	<Section>
		<Text>Hi {playerName},</Text>
		<Text>
			You have submitted a list for {tournamentName} with the below information and the attached list. The tournament organizer has also received an email with the same details, and
			will review and approve the list shortly.
		</Text>
		<Hr />
		<Text>Email: {playerEmail}</Text>
		<Text>Era: {era}</Text>
		<Text>Faction: {faction}</Text>
		<Text>The attached list has passed all validation checks for {tournamentRules}</Text>
		<Hr />
		{#if parsedAddedUnits.length > 0}
			<Text>The following units were not found in the pdf and were added manually to the list: (list was validated while including these units)</Text>
			{#each parsedAddedUnits as unit}
				<Text>{unit.name} - Skill {unit.skill}</Text>
			{/each}
		{/if}
	</Section>
</Html>
