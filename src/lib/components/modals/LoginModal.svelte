<script lang="ts">
	import { enhance } from "$app/forms";
	import { getContext } from "svelte";

	let { showLoginModal = $bindable() } = $props();
	let loginDialog: HTMLDialogElement;

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
			console.log(result);
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
	}}>
	<form method="post" action="/login/?/register" class="dialog-body" use:enhance={handleSignUp}>
		<label for="username">Username</label>
		<input name="username" id="username" value="test" /><br />
		<label for="password">Password</label>
		<input type="password" name="password" id="password" value="test123" /><br />
		<label for="email">Email Address</label>
		<input type="email" name="email" id="email" value="gnbia@nu.com" /><br />
		<div class="inline gap8 center"><button>Cancel</button><button>Continue</button></div>
	</form>
	<form method="post" action="/login/?/login" class="dialog-body" use:enhance={handleLogin}>
		<label for="username">Username</label>
		<input name="username" id="username" value="test" />
		<label for="password">Password</label>
		<input type="password" name="password" id="password" value="test123" />
		<div class="inline gap8 center"><button>Cancel</button><button>Continue</button></div>
	</form>
</dialog>
