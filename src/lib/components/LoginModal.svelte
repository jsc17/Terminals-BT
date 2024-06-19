<script lang="ts">
	import { enhance } from "$app/forms";
	import { getContext } from "svelte";
	import { appWindow } from "$lib/stores/appWindow.svelte";

	let { showLoginModal = $bindable() } = $props();
	let loginDialog: HTMLDialogElement;
	let loginDisplay = $state<"login" | "register">("login");

	$effect(() => {
		if (showLoginModal) {
			loginDialog.showModal();
		} else {
			loginDialog.close();
		}
	});

	let user: { username: string | undefined } = getContext("user");

	function handleSignUp({ formData, cancel, submitter }: any) {
		const { username, password, email } = Object.fromEntries(formData) as Record<string, string>;
		if (submitter.innerText == "Cancel") {
			loginDialog.close();
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
		} else {
			formData.set("username", username.toLowerCase());
		}
		return async ({ result, update }: any) => {
			if (result.status != 200) {
				alert(result.data.message);
			} else {
				user.username = result.data.username;
				loginDialog.close();
				update();
			}
		};
	}
	function handleLogin({ formData, cancel, submitter }: any) {
		const { username, password } = Object.fromEntries(formData);
		if (submitter.innerText == "Cancel") {
			loginDialog.close();
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
				loginDialog.close();
				update();
			}
		};
	}
</script>

<dialog
	bind:this={loginDialog}
	onclose={() => {
		showLoginModal = false;
	}}
	class:dialog-wide={appWindow.isNarrow}>
	{#if loginDisplay == "login"}
		<div class="dialog-body">
			<div class="space-between">
				<h2>Login</h2>
				<button onclick={() => loginDialog.close()}>Close</button>
			</div>
			<form method="post" action="/auth/?/login" class="dialog-body" use:enhance={handleLogin}>
				<div class="space-between">
					<label for="username">Username</label>
					<!-- <a href="/auth/forgot-username" class="forgot-link">Forgot Username?</a> -->
				</div>
				<input name="username" id="username" />
				<div class="space-between">
					<label for="password">Password</label>
					<a href="/auth/forgot-password" class="forgot-link">Forgot Password?</a>
				</div>
				<input type="password" name="password" id="password" />

				<div><button>Login</button></div>
				<button
					style:background-color="transparent"
					style:color="var(--primary)"
					onclick={() => {
						loginDisplay = "register";
					}}>Need an account? Click here to register</button>
			</form>
		</div>
	{:else if loginDisplay == "register"}
		<div class="dialog-body">
			<div class="space-between">
				<h2>Register</h2>
				<button onclick={() => loginDialog.close()}>Close</button>
			</div>
			<form method="post" action="/auth/?/register" class="dialog-body" use:enhance={handleSignUp}>
				<label for="username">Username</label>
				<input name="username" id="username" />
				<label for="password">Password</label>
				<input type="password" name="password" id="password" />
				<label for="password">Verify Password</label>
				<input type="password" name="verifyPassword" id="verifyPassword" />
				<label for="email">Email Address</label>
				<input type="email" name="email" id="email" />
				<div class="inline gap8 center"><button>Continue</button></div>
				<button
					style:background-color="transparent"
					style:color="var(--primary)"
					onclick={() => {
						loginDisplay = "login";
					}}>Already have an account? Click here to login</button>
			</form>
		</div>
	{/if}
</dialog>

<style>
	.forgot-link {
		font-size: 0.75rem;
		color: var(--primary);
	}
</style>
