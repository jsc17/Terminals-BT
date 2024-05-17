<script>
	import { Html, Text, Link } from "svelty-email";

	const { token } = $props();
	const link = `https://bt.terminl.xyz/auth/reset-password?token=${token}`;
</script>

<Html lang="en">
	<Text>A request has been made to reset your password for <a href="https://bt.terminl.xyz">https://bt.terminl.xyz</a></Text>
	<Text>Please follow the below link to reset your password:</Text>
	<Link href={link}>{link}</Link>
</Html>
