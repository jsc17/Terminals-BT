<script lang="ts">
	import type { Tournament } from "$lib/generated/prisma/browser";
	import { Html, Text, Head, Section, Link } from "svelty-email";

	type Props = {
		tournament: Tournament;
	};
	const { tournament }: Props = $props();
</script>

<Html>
	<Head />
	<Section>
		<Text>
			Your tournament, {tournament.name} on {tournament.tournament_date.toDateString()}, has been approved. It should now show up in the tournament list at: <Link
				href="https://terminal.tools/validation/">https://terminal.tools/validation</Link
			>
		</Text>
	</Section>
</Html>
