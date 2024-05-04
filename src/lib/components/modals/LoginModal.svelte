<script lang="ts">
	import { enhance } from "$app/forms";
	import { getContext } from "svelte";
	import { appWindow } from "$lib/utilities/responsive.svelte";

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
	on:close={() => {
		showLoginModal = false;
	}}
	class:dialog-wide={appWindow.isNarrow}>
	{#if loginDisplay == "login"}
		<div class="dialog-body">
			<div class="space-between">
				<h1>Login</h1>
				<button on:click={() => loginDialog.close()}>Close</button>
			</div>
			<form method="post" action="/login/?/login" class="dialog-body" use:enhance={handleLogin}>
				<label for="username">Username</label>
				<input name="username" id="username" />
				<label for="password">Password</label>
				<input type="password" name="password" id="password" />
				<div class="inline gap8 center"><button>Continue</button></div>
				<button
					style:background-color="transparent"
					style:color="var(--primary)"
					on:click={() => {
						loginDisplay = "register";
					}}>Need an account? Click here to register</button>
			</form>
		</div>
	{:else if loginDisplay == "register"}
		<div class="dialog-body">
			<div class="space-between">
				<h1>Register</h1>
				<button on:click={() => loginDialog.close()}>Close</button>
			</div>
			<form method="post" action="/login/?/register" class="dialog-body" use:enhance={handleSignUp}>
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
					on:click={() => {
						loginDisplay = "login";
					}}>Already have an account? Click here to login</button>
			</form>
		</div>
	{/if}
</dialog>
