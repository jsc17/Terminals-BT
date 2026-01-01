<script lang="ts">
	import { Dialog } from "$lib/generic";
	import { setNickname } from "../remote/matchlist.remote";

	type Props = {
		currentNickname: string;
	};

	let { currentNickname }: Props = $props();

	setNickname.fields.nickname.set(currentNickname);

	let open = $state(false);
</script>

<Dialog title="Change default nickname" triggerClasses="transparent-button" bind:open>
	{#snippet trigger()}
		Edit...
	{/snippet}
	{#snippet description()}
		<span class="muted">Updates the default play mode nickname for your account</span>
	{/snippet}

	<form
		{...setNickname.enhance(async ({ submit }) => {
			await submit();
			open = false;
		})}
	>
		<label>New Nickname: <input {...setNickname.fields.nickname.as("text")} /></label>
		<button>Submit</button>
	</form>
</Dialog>
