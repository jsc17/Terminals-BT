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
		parsedAddedUnits: { name: string; skill: number }[];
		parsedFixedUnits: { name: string; skill: number }[];
		parsedAddedBfs: { name: string; count: number }[];
		parsedFixedBfs: { name: string; count: number }[];
	};
	const { id, tournamentName, playerName, playerEmail, era, faction, tournamentRules, parsedAddedUnits, parsedFixedUnits, parsedAddedBfs, parsedFixedBfs }: Props = $props();

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
		{#if parsedFixedUnits.length > 0 || parsedAddedUnits.length > 0 || parsedFixedBfs.length > 0 || parsedAddedBfs.length > 0}
			<Hr />
			<Text style={fixedStyle}
				>Units or BFS were manually added or edited. Please Review the list and the attached PDF carefully before approval. The list was successfully validated while including
				these changes.</Text
			>
		{/if}
		{#if parsedAddedUnits.length > 0}
			<Hr />
			<Text>The following units were not found in the pdf and were added manually to the list:</Text>
			{#each parsedAddedUnits as unit}
				<Text>{unit.name} - Skill {unit.skill}</Text>
			{/each}
		{/if}
		{#if parsedFixedUnits.length > 0}
			<Hr />
			<Text>The following units were edited:</Text>
			{#each parsedFixedUnits as unit}
				<Text>{unit.name} - Skill {unit.skill}</Text>
			{/each}
		{/if}
		{#if parsedAddedBfs.length > 0}
			<Hr />
			<Text>The following BattleField Support were not found in the pdf and were added manually to the list:</Text>
			{#each parsedAddedBfs as bfs}
				<Text>{bfs.name} x{bfs.count}</Text>
			{/each}
		{/if}
		{#if parsedFixedBfs.length > 0}
			<Hr />
			<Text>The following BattleField Support were edited:</Text>
			{#each parsedFixedBfs as bfs}
				<Text>{bfs.name} x{bfs.count}</Text>
			{/each}
		{/if}

		<Hr />

		<Link href={`${dev ? `https://localhost:5173` : `https://terminal.tools`}/validation/approve/${id}`}>Approve List and send response</Link>
	</Section>
</Html>
