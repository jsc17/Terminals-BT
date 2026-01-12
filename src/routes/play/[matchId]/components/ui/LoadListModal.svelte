<script lang="ts">
	import { Dialog } from "$lib/generic";
	import { getUsersLists } from "$lib/remote/list.remote";
	import { watch } from "runed";
	import { loadList } from "../../remote/matchPlayer.remote";

	type Props = {
		open: boolean;
		matchId: string;
		teams: { id: number; name: string }[];
	};

	let { open = $bindable(), matchId, teams }: Props = $props();

	let lists = $derived(await getUsersLists());
	watch(
		() => open,
		() => {
			if (open) {
				getUsersLists().refresh();
			}
		}
	);
</script>

<Dialog title="Load List" bind:open>
	<form
		{...loadList.enhance(async ({ submit }) => {
			await submit();
			if (loadList.result) {
				open = false;
			}
		})}
	>
		<input {...loadList.fields.matchId.as("hidden", matchId)} />
		<label>List Name <input {...loadList.fields.listName.as("text")} /></label>
		<label
			>List
			<select {...loadList.fields.listId.as("select")}>
				{#each lists.data as list}
					<option value={list.id}>{list.name}</option>
				{/each}
			</select>
		</label>
		<label
			>Team
			<select {...loadList.fields.teamId.as("select")}>
				{#each teams as team}
					<option value={team.id.toString()}>{team.name}</option>
				{/each}
			</select>
		</label>
		<button>Submit</button>
	</form>
</Dialog>

<style>
	form {
		padding: var(--responsive-padding);
		display: flex;
		flex-direction: column;
		gap: 8px;
		align-items: start;
	}
</style>
