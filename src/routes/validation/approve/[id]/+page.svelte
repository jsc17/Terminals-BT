<script lang="ts">
	import { page } from "$app/state";
	import { sendApproval } from "../../tournament.remote";

	const id = page.params.id;
</script>

<main>
	{#if id}
		{#await sendApproval(id)}
			<p>Sending approval email ... Please Hold</p>
		{:then result}
			{#if result.status == "success"}
				<p>Approval email sent successfully</p>
			{:else}
				<p>Approval email failed to send</p>
			{/if}
		{/await}
	{/if}
</main>
