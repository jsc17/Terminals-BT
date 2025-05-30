<script lang="ts">
	import { enhance } from "$app/forms";

	function handleSend({ cancel }: any) {
		if (!confirm("Send notification to all users?")) {
			cancel();
		}
	}
</script>

<div class="card">
	<h3>Send Notification:</h3>
	<form method="post" class="notification-form" action="?/sendNotification" use:enhance={handleSend}>
		<div class="notification-form-row"><label for="notification-summary">Summary:</label><input type="text" name="notification-summary" id="notification-summary" required /></div>
		<div class="notification-form-row"><label for="notification-message">Message:</label><input type="text" name="notification-message" id="notification-message" required /></div>
		<div class="notification-form-row">
			<label for="notification-type">Type:</label><select name="notification-type" id="notification-type"><option value="update">Update</option></select>
		</div>
		<button class="notification-send-button">Send</button>
	</form>
</div>

<style>
	.notification-form {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.notification-form-row {
		display: flex;
		gap: 8px;
	}
	.notification-send-button {
		width: max-content;
		padding: 4px 16px;
	}
</style>
