<script lang="ts">
	import { refreshAll } from "$app/navigation";
	import { Dialog } from "$lib/generic";
	import { getUsersLists } from "$lib/remote/list.remote";
	import { watch } from "runed";
	import { joinMatch } from "../../../remote/match.remote";
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
	let nickname = $derived(await getNickname());
	joinMatch.fields.nickname.set(nickname);
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
	<form {...joinMatch}>
		<input {...joinMatch.fields.matchId.as("hidden", matchId)} />
		{#if !host}
			<input {...joinMatch.fields.nickname.as("text")} />
			<input {...joinMatch.fields.joinCode.as("text")} />
		{/if}
		<select {...joinMatch.fields.teamId.as("select")}>
			{#each teams as team}
				<option value={team.id.toString()}>{team.name}</option>
			{/each}
		</select>
		<select {...joinMatch.fields.listId.as("select")}>
			{#each lists.data as list}
				<option value={list.id}>{list.name}</option>
			{/each}
		</select>
		<button>Submit</button>
	</form>
</Dialog>
