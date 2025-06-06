<script lang="ts">
	import { Html, Text, Link, Head, Section } from "svelty-email";

	const { organizer, name, date, era, link } = $props() as Record<string, string>;
</script>

<Html>
	<Head />
	<Section>
		<Text>Hello, {organizer}</Text>
		<Text>A Tournament has created with the following details:</Text>
		<Text>Name: {name}</Text>
		<Text>Date: {date}</Text>
		<Text>Era: {era}</Text>
		<Text>Please share the link below to direct participants to the list submission page:</Text>
		<Link href={link}>{link}</Link>
	</Section>
</Html>
