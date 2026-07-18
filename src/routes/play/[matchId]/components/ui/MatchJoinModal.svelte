<script lang="ts">
	import { Dialog } from "$lib/generic";
	import { getUsersLists } from "$lib/remote/list.remote";
	import { watch } from "runed";
	import { getNickname } from "../../../remote/matchlist.remote";
	import { joinMatch } from "../../remote/matchPlayer.remote";

	type Props = {
		open: boolean;
		matchId: string;
		teams: { id: number; name: string }[];
		host: boolean;
	};

	let { open = $bindable(), matchId, teams }: Props = $props();

	joinMatch.fields.nickname.set(await getNickname());

	let lists = $derived(await getUsersLists());
	watch(
		() => open,
		() => {
			if (open) {
				getUsersLists().refresh();
			}
		}
	);

	let selectedListId = $state<string>();
	let selectedListName = $derived(lists.data?.find((l) => l.id == selectedListId)?.name ?? undefined);
</script>

<Dialog title="Join Match" bind:open>
	<form
		{...joinMatch.enhance(async ({ submit }) => {
			await submit();
			if (joinMatch.result) {
				open = false;
			}
		})}
	>
		<input {...joinMatch.fields.matchId.as("hidden", matchId)} />
		<label>Nickname: <input {...joinMatch.fields.nickname.as("text")} /></label>
		<label>
			Team:
			<select {...joinMatch.fields.teamId.as("select")}>
				{#each teams as team}
					<option value={team.id.toString()}>{team.name}</option>
				{/each}
			</select>
		</label>
		<hr />

		<label>List Name (optional) <input {...joinMatch.fields.listName.as("text")} placeholder={selectedListName} /></label>

		<label
			>List (optional)
			<select {...joinMatch.fields.listId.as("select")} bind:value={selectedListId}>
				<option value={undefined}>-</option>
				{#each lists.data as list}
					<option value={list.id}>{list.name}</option>
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
