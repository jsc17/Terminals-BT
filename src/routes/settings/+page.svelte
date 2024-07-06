<script lang="ts">
	import { enhance } from "$app/forms";
	import { toastController } from "$lib/stores/toastController.svelte";
	import { type ActionResult } from "@sveltejs/kit";
	import { goto } from "$app/navigation";
	import { getContext } from "svelte";

	const { data } = $props();
	let allowDelete = $state(false);
	let user: { username: string | undefined } = getContext("user");

	function changeUsername() {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type == "success") {
				toastController.addToast("Username changed successfully");
				user.username = result.data?.username;
			} else if (result.type == "failure") {
				toastController.addToast(result.data?.message ?? "Unknown failure occured. Please try again");
			}
		};
	}
	function changeEmail() {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type == "success") {
				toastController.addToast("Email changed successfully");
			} else if (result.type == "failure") {
				toastController.addToast(result.data?.message ?? "Unknown failure occured. Please try again");
			}
		};
	}
	function changePassword({ formData, cancel }: { formData: FormData; cancel: any }) {
		if (formData.get("new-password")?.toString() != formData.get("confirm-password")?.toString()) {
			cancel();
			alert("New and Confirm passwords don't match");
		}
		return async ({ result }: { result: ActionResult }) => {
			if (result.type == "success") {
				toastController.addToast("Password changed successfully");
			} else if (result.type == "failure") {
				toastController.addToast(result.data?.message ?? "Unknown failure occured. Please try again");
			}
		};
	}
	function deleteUser({ cancel }: any) {
		if (!confirm("Click confirm to delete your user account, including all saved lists? This cannot be undone.")) {
			cancel();
			allowDelete = false;
		}
		return async ({ result }: { result: ActionResult }) => {
			if (result.type == "success") {
				toastController.addToast("Account deleted successfully");
				user.username = undefined;
				goto("/");
			} else if (result.type == "failure") {
				toastController.addToast(result.data?.message ?? "Unknown failure occured. Please try again");
			}
		};
	}
</script>

<main>
	<aside>
		<button class="link-button">Account Settings</button>
	</aside>
	<div class="settings-body">
		<h2>Account Settings</h2>
		<section>
			<h3>Username</h3>
			<div class="inline">
				<form method="post" action="?/changeUsername" use:enhance={changeUsername}>
					<input id="username" name="username" value={data.username} required minlength="3" maxlength="30" /> <button>Change username</button>
				</form>
				<ul>
					<li>Must be between 3-30 characters</li>
					<li>May only contain letters and numbers</li>
				</ul>
			</div>
		</section>
		<section>
			<h3>Email</h3>
			<form method="post" action="?/changeEmail" use:enhance={changeEmail}>
				<input type="email" id="email" name="email" value={data.email} required /> <button>Change email address</button>
			</form>
		</section>
		<section>
			<h3>Password</h3>
			<div class="inline">
				<form method="post" action="?/changePassword" use:enhance={changePassword}>
					<label for="current-password">Current password</label><input type="password" id="current-password" name="current-password" required />
					<label for="new-password">New password</label><input type="password" id="new-password" name="new-password" required minlength="6" maxlength="255" />
					<label for="confirm-password">Confirm new password</label><input type="password" id="confirm-password" name="confirm-password" required />
					<button style="grid-column: 1 / 3">Change password</button>
				</form>
				<ul>
					<li>Must be at least 6 characters</li>
				</ul>
			</div>
		</section>
		<section>
			<h3>Linked Accounts</h3>
			<form>
				<div>Google - {data.googleLinked ? "Linked" : "Not linked"}</div>
				{#if !data.googleLinked}
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
									<path
										fill="#34A853"
										d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
									></path>
									<path fill="none" d="M0 0h48v48H0z"></path>
								</svg>
							</div>
							<span class="gsi-material-button-contents">Sign in with Google</span>
							<span style="display: none;">Sign in with Google</span>
						</div>
					</button>
				{:else}
					<div></div>
				{/if}
				<div>Discord - {data.discordLinked ? "Linked" : "Not linked"}</div>
				{#if !data.discordLinked}
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
				{:else}
					<div></div>
				{/if}
			</form>
		</section>
		<section>
			<h3>Delete User</h3>
			<form method="post" action="?/deleteUser" use:enhance={deleteUser}>
				<div>
					<input type="checkbox" name="delete" id="delete" bind:checked={allowDelete} /> Delete this user account and all associated data
					<span class="warning">(cannot be undone)</span>
				</div>
				<button disabled={!allowDelete}>Delete user</button>
			</form>
		</section>
	</div>
</main>

<style>
	@import "$lib/css/google.css";
	main {
		display: grid;
		grid-template-columns: max-content auto;
		flex: 1;
	}
	aside {
		display: flex;
		flex-direction: column;
		padding: 16px;
		gap: 8px;
		background-color: var(--card);
		color: var(--card-foreground);
	}
	.link-button {
		background-color: transparent;
		display: flex;
		align-items: center;
		gap: 8px;
		color: var(--primary);
		font-size: 16px;
	}
	.settings-body {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
	}
	section {
		display: flex;
		flex-direction: column;
		padding: 16px;
		border-bottom: 1px solid var(--primary);
	}

	form {
		display: grid;
		grid-template-columns: max-content max-content;
		gap: 16px;
		align-items: center;
	}
	button {
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
	.warning {
		color: var(--error);
	}
	button:disabled {
		background-color: var(--muted);
		color: var(--muted-foreground);
	}
</style>
