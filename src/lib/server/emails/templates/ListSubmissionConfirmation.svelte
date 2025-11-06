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
	};
	const { tournamentName, playerName, playerEmail, era, faction, tournamentRules }: Props = $props();
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
	</Section>
</Html>
