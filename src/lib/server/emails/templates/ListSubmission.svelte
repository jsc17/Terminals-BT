<script lang="ts">
	import { dev } from "$app/environment";
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
	const { id, tournamentName, playerName, playerEmail, era, faction, tournamentRules, fixed, parsedAddedUnits }: Props = $props();

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
		{#if parsedAddedUnits.length > 0}
			<Text>The following units were not found in the pdf and were added manually to the list: (list was validated while including these units)</Text>
			{#each parsedAddedUnits as unit}
				<Text>{unit.name} - Skill {unit.skill}</Text>
			{/each}
		{/if}
		<Hr />
		<Link href={`${dev ? `https://localhost:5173` : `https://terminal.tools`}/validation/approve/${id}`}>Approve List and send response</Link>
	</Section>
</Html>
