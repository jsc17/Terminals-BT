<script lang="ts">
	import { enhance } from "$app/forms";
	import { getContext } from "svelte";
	import { appWindow } from "$lib/stores/appWindow.svelte";
	import { Dialog } from "$lib/generic/";

	let usernameElement = $state<HTMLInputElement>();
	let loginDisplay = $state<"login" | "register">("login");

	export function show() {
		open = true;
		usernameElement?.focus();
		console.log("Test");
	}

	let user: { username: string | undefined } = getContext("user");

	function handleSignUp({ formData, cancel, submitter }: any) {
		const { username, password, email } = Object.fromEntries(formData) as Record<string, string>;
		if (submitter.innerText == "Cancel") {
			open = false;
			cancel();
		} else if (!password) {
			alert("Password is required");
			cancel();
		} else if (!email) {
			alert("Email Address is required");
			cancel();
		} else if (!username) {
			alert("Username is required");
			cancel();
		}
		return async ({ result, update }: any) => {
			if (result.status != 200) {
				alert(result.data.message);
			} else {
				user.username = result.data.username;
				open = false;
				update();
			}
		};
	}
	function handleLogin({ formData, cancel, submitter }: any) {
		const { username, password } = Object.fromEntries(formData);
		if (submitter.innerText == "Cancel") {
			open = false;
			cancel();
		} else if (!username) {
			alert("Username is required");
			cancel();
		} else if (!password) {
			alert("Password is required");
			cancel();
		}

		return async ({ result, update }: any) => {
			if (result.status != 200) {
				alert(result.data.message);
			} else {
				user.username = result.data.username;
				open = false;
				update();
			}
		};
	}
	let open = $state(false);
</script>

<Dialog title={loginDisplay == "login" ? "Log in" : "Register"} bind:open>
	{#if loginDisplay == "login"}
		<div class="dialog-body">
			<form method="post" action="/auth/?/login" class="login-form" use:enhance={handleLogin}>
				<label for="username">Username <span class="muted">or</span> Email address</label>
				<input name="username" id="username" bind:this={usernameElement} />
				<div class="space-between">
					<label for="password">Password</label>
					<a href="/auth/forgot-password" class="forgot-link">Forgot Password?</a>
				</div>
				<input type="password" name="password" id="password" />

				<button class="login-button">Login</button>
			</form>
			<div class="separator muted">Or</div>
			<button
				onclick={() => {
					window.location.href = "/auth/oauth/google";
				}}
				class="gsi-material-button"
			>
				<div class="gsi-material-button-state"></div>
				<div class="gsi-material-button-content-wrapper">
					<div class="gsi-material-button-icon">
						<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
							<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
							></path>
							<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
							<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
							<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
							></path>
							<path fill="none" d="M0 0h48v48H0z"></path>
						</svg>
					</div>
					<span class="gsi-material-button-contents">Sign in with Google</span>
					<span style="display: none;">Sign in with Google</span>
				</div>
			</button>

			<button
				onclick={() => {
					window.location.href = "/auth/oauth/discord";
				}}
				class="gsi-material-button"
			>
				<div class="gsi-material-button-state"></div>
				<div class="gsi-material-button-content-wrapper">
					<div class="gsi-material-button-icon">
						<img class="login-icon" src="/discord.png" alt="discord" />
					</div>
					<span class="gsi-material-button-contents">Sign in with Discord</span>
					<span style="display: none;">Sign in with Discord</span>
				</div>
			</button>
			<div class="separator muted">Other options</div>

			<button
				style:background-color="transparent"
				style:color="var(--primary)"
				onclick={() => {
					loginDisplay = "register";
				}}>Need an account? Click here to register</button
			>
		</div>
	{:else if loginDisplay == "register"}
		<div class="dialog-body">
			<form method="post" action="/auth/?/register" class="login-form" use:enhance={handleSignUp}>
				<div class="register-fields">
					<label for="username">Username</label>
					<input name="username" id="username" />
					<label for="email">Email Address</label>
					<input type="email" name="email" id="email" />
					<label for="password">Password</label>
					<input type="password" name="password" id="password" />
					<label for="password">Verify Password</label>
					<input type="password" name="verifyPassword" id="verifyPassword" />
				</div>
				<button class="login-button">Register</button>
				<div class="separator muted">Or</div>
				<button
					onclick={() => {
						window.location.href = "/auth/oauth/google";
					}}
					class="gsi-material-button"
				>
					<div class="gsi-material-button-state"></div>
					<div class="gsi-material-button-content-wrapper">
						<div class="gsi-material-button-icon">
							<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlns:xlink="http://www.w3.org/1999/xlink" style="display: block;">
								<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
								></path>
								<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
								<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
								<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
								></path>
								<path fill="none" d="M0 0h48v48H0z"></path>
							</svg>
						</div>
						<span class="gsi-material-button-contents">Sign in with Google</span>
						<span style="display: none;">Sign in with Google</span>
					</div>
				</button>

				<button
					onclick={() => {
						window.location.href = "/auth/oauth/discord";
					}}
					class="gsi-material-button"
				>
					<div class="gsi-material-button-state"></div>
					<div class="gsi-material-button-content-wrapper">
						<div class="gsi-material-button-icon">
							<img class="login-icon" src="/discord.png" alt="discord" />
						</div>
						<span class="gsi-material-button-contents">Sign in with Discord</span>
						<span style="display: none;">Sign in with Discord</span>
					</div>
				</button>
				<div class="separator muted">Other options</div>
				<button
					style:background-color="transparent"
					style:color="var(--primary)"
					onclick={() => {
						loginDisplay = "login";
					}}>Already have an account? Click here to login</button
				>
			</form>
		</div>
	{/if}
</Dialog>

<style>
	@import "$lib/styles/google.css";
	h2 {
		margin: 0;
	}
	.dialog-body {
		gap: 16px;
	}
	.forgot-link {
		font-size: 0.75rem;
		color: var(--primary);
	}
	.muted {
		font-size: 0.8rem;
		color: var(--muted-foreground);
	}
	.login-form {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.register-fields {
		display: grid;
		grid-template-columns: max-content auto;
		gap: 12px;
	}
	.login-button {
		height: 2rem;
		background-color: var(--button-dark);
		color: var(--button-dark-foreground);
		border-radius: 3px;
		margin: 4px 16px 0px;
	}
	.login-icon {
		height: 20px;
		width: 20px;
	}
	.separator {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.separator::before,
	.separator::after {
		content: "";
		flex: 1;
		border-bottom: 1px solid var(--primary);
		margin: 5px;
	}
</style>
