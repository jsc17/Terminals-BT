<script lang="ts">
	import { enhance } from "$app/forms";

	let statusMessage = $state("");

	async function handleForgotPassword() {
		return async ({ result }: any) => {
			if (result.status == 200) {
				statusMessage = "Reset link set. If you do not recieve it shortly, please check your spam filter";
			} else {
				statusMessage = result.data.message;
			}
		};
	}
</script>

<main>
	<form action="?/forgotPassword" method="post" use:enhance={handleForgotPassword}>
		<h1>Forgot Password</h1>
		<label for="emailAddress">Please enter your email address to recieve a password reset link:</label>
		<input type="email" name="emailAddress" id="emailAddress" />
		<button type="submit">Request reset link</button>
		<p>{statusMessage}</p>
	</form>
</main>

<style>
	main {
		margin-left: 64px;
		margin-top: 64px;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	input {
		max-width: 400px;
	}
	button {
		width: fit-content;
	}
</style>
