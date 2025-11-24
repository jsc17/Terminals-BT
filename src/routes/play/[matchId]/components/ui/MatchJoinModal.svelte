<script lang="ts">
	import { refreshAll } from "$app/navigation";
	import { Dialog } from "$lib/generic";
	import { getUsersLists } from "$lib/remote/list.remote";
	import { watch } from "runed";
	import { joinMatch } from "../../remote/matchData.remote";
	import { getNickname } from "../../../remote/matchlist.remote";

	type Props = {
		open: boolean;
		joinCode: string;
		matchId: string;
		teams: { id: number; name: string }[];
		host: boolean;
	};

	let { open = $bindable(), joinCode, matchId, teams, host }: Props = $props();

	let lists = $derived(await getUsersLists());
	joinMatch.fields.nickname.set(await getNickname());
	watch(
		() => open,
		() => {
			if (open) {
				getUsersLists().refresh();
			}
		}
	);
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
		{#if !host}
			<label>Join Code:<input {...joinMatch.fields.joinCode.as("text")} /></label>
		{/if}
		<label>
			Team:
			<select {...joinMatch.fields.teamId.as("select")}>
				{#each teams as team}
					<option value={team.id.toString()}>{team.name}</option>
				{/each}
			</select>
		</label>
		<label
			>List
			<select {...joinMatch.fields.listId.as("select")}>
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
