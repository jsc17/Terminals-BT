<script>
	import { dev } from "$app/environment";
	import { Html, Text, Link } from "svelty-email";

	const { token } = $props();
	const link = `https://${dev ? `localhost:5173` : `terminal.tools`}/auth/reset-password?token=${token}`;
</script>

<Html lang="en">
	<Text>A request has been made to reset your password for <a href="https://Terminal.tools">https://Terminal.tools</a></Text>
	<Text>Please follow the below link to reset your password:</Text>
	<Link href={link}>{link}</Link>
</Html>
