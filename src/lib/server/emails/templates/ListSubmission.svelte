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
	const { id, tournamentName, playerName, playerEmail, era, faction, tournamentRules, fixed }: Props = $props();

	const fixedStyle = { color: "#FF0000" };
</script>

<Html>
	<Head />
	<Section>
		<Text>ID: {id}</Text>
		<Text>{playerName} has submitted a list for {tournamentName}</Text>
		<Text>Email: {playerEmail}</Text>
		<Text>Era: {era}</Text>
		<Text>Faction: {faction}</Text>
		<Text>The attached list has passed all validation checks for {tournamentRules}</Text>
		{#if fixed}
			<Text style={fixedStyle}>Units were manually edited. Please Review the list carefully before approval.</Text>
		{/if}
		<Hr />
		<Link href={`https://terminal.tools/validation/approve/${id}`}>Approve List and send response</Link>
	</Section>
</Html>
