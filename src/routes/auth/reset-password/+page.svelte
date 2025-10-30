<script lang="ts">
	import { enhance } from "$app/forms";

	const { data } = $props();

	let newPassword = $state("");
	let confirmPassword = $state("");
	let errorMessage = $state("");
	let statusMessage = $state("");

	async function handleResetPassword({ formData, cancel }: { formData: FormData; cancel: any }) {
		if (newPassword != confirmPassword) {
			cancel();
			errorMessage = "Passwords do not match";
		}
		if (newPassword.length < 8) {
			cancel();
			errorMessage = "Password is too short";
		}
		if (newPassword.length > 128) {
			cancel();
			errorMessage = "Password is too long";
		}
		formData.append("token", data.token!);

		return async ({ result }: any) => {
			if (result.status == 200) {
				statusMessage = "Password has been successfully reset.";
			} else {
				errorMessage = result.data.message;
			}
		};
	}
</script>

<main>
	{#if data.tokenIsValid}
		<form method="post" action="?/resetPassword" class="reset-form" use:enhance={handleResetPassword}>
			<h1>Reset password</h1>
			<br />
			<div class="text-line">
				<label for="newPassword">New Password</label>
				<p class="info-text">{newPassword.length}/128 characters</p>
			</div>
			<input type="password" id="newPassword" name="newPassword" bind:value={newPassword} minlength="8" maxlength="128" />
			<div class="text-line">
				<label for="confirmPassword">Confirm Password</label>
				<p class="info-text">{confirmPassword.length}/128 characters</p>
			</div>
			<input type="password" id="confirmPassword" name="confirmPassword" bind:value={confirmPassword} minlength="8" maxlength="128" />
			<p>{statusMessage}</p>
			<p class="error">{errorMessage}</p>
			<button type="submit">Reset Password</button>
		</form>
	{:else}
		<h1 class="error">Invalid Token. Please check your link and try again.</h1>
	{/if}
</main>

<style>
	main {
		margin-left: 64px;
		margin-top: 64px;
	}
	.error {
		color: var(--error);
	}
	.reset-form {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 50%;
	}
	button {
		width: fit-content;
		align-self: flex-end;
		height: 1.5rem;
	}
	.info-text {
		font-size: 0.85rem;
		color: var(--surface-color-light-text-color);
	}
	.text-line {
		display: flex;
		gap: 16px;
		align-items: end;
	}
</style>
