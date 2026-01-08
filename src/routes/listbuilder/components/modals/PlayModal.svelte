<script lang="ts">
	import { Dialog } from "$lib/generic";
	import type { List } from "$lib/types/list.svelte";
	import { Tabs } from "bits-ui";
	import { createMatchWithList, getNickname } from "$routes/play/remote/matchlist.remote";
	import { CreateMatchWithListSchema } from "$routes/play/schema/matchlistSchema";
	import { nanoid } from "nanoid";
	import { toastController } from "$lib/stores";

	let openState = $state(false);
	const nickname = await getNickname();
	let listName = $state<string>();
	let formationStrings = $state<string[]>([]);

	export function open(list: List, formation?: { name: string; type: string; units: string[]; secondary?: { type: string; units: string[] } }) {
		if (formation) {
			listName = `${list.details.name} - ${formation.name}`;
			formationStrings.push(
				JSON.stringify({
					name: formation.name,
					type: formation.type,
					secondary: formation.secondary?.type,
					units: formation.units
						.map((uId) => {
							const unitData = list.getUnit(uId);
							return { mulId: unitData!.baseUnit.mulId, skill: unitData?.skill, secondary: false };
						})
						.concat(
							formation.secondary?.units.map((unit) => {
								const unitData = list.getUnit(unit);
								return { mulId: unitData!.baseUnit.mulId, skill: unitData?.skill, secondary: true };
							}) ?? []
						)
				})
			);
		} else {
			listName = list.details.name;
			formationStrings = list.formations
				.filter((f) => f.units.length != 0)
				.map((f) => {
					return JSON.stringify({
						name: f.name,
						type: f.type,
						secondary: f.secondary?.type,
						units: f.units
							.map((unit) => {
								const unitData = list.getUnit(unit.id);
								return { mulId: unitData!.baseUnit.mulId, skill: unitData?.skill, secondary: false };
							})
							.concat(
								f.secondary?.units.map((unit) => {
									const unitData = list.getUnit(unit.id);
									return { mulId: unitData!.baseUnit.mulId, skill: unitData?.skill, secondary: true };
								}) ?? []
							)
					});
				});
		}

		createMatchWithList.fields.set({
			joinCode: nanoid(6).replaceAll("_", "Z"),
			private: true,
			name: formation ? formation.name : list.details.name,
			hostNickname: nickname,
			teamNames: ["Red", "Blue"],
			formations: formationStrings
		});
		openState = true;
	}
</script>

<Dialog bind:open={openState} title={`Play List`}>
	<Tabs.Root value="newMatch">
		<Tabs.List class="matchUnitTabs">
			<Tabs.Trigger class="matchUnitTrigger" value="newMatch">New Match</Tabs.Trigger>
			<Tabs.Trigger class="matchUnitTrigger" value="joinMatch">Join Match</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="newMatch">
			<form
				{...createMatchWithList.preflight(CreateMatchWithListSchema).enhance(async ({ submit }) => {
					console.log("submitting");
					await submit();
					if (createMatchWithList.result?.status == "success") {
						openState = false;
						window.open(`/play/${createMatchWithList.result.message}`, "_blank");
					} else {
						toastController.addToast(createMatchWithList.result!.message);
					}
				})}
			>
				{#each formationStrings as formation, index}
					<input {...createMatchWithList.fields.formations[index].as("hidden", formation)} />
				{/each}
				<div>
					<label>Match Name: <input {...createMatchWithList.fields.name.as("text")} /></label>
					{#each createMatchWithList.fields.name.issues() as issue}
						<p class="error">{issue.message}</p>
					{/each}
				</div>
				<div>
					<label>Join Code: <input {...createMatchWithList.fields.joinCode.as("text")} /></label>
					<p class="muted">Players will use this code to join the match and load lists</p>
					{#each createMatchWithList.fields.joinCode.issues() as issue}
						<p class="error">{issue.message}</p>
					{/each}
				</div>
				<div>
					<label><input {...createMatchWithList.fields.private.as("checkbox")} /> Private Game?</label>
					<p class="muted">Private games will not show up in the public games list, and will require sharing the id for other players to join</p>
				</div>
				<label>Team 1 Name: <input {...createMatchWithList.fields.teamNames[0].as("text")} /></label>
				<label>Team 2 Name: <input {...createMatchWithList.fields.teamNames[1].as("text")} /></label>

				{#each createMatchWithList.fields.hostNickname.issues() as issue}
					<p class="error">{issue.message}</p>
				{/each}
				<hr />
				<div>
					<label>Host Nickname: <input {...createMatchWithList.fields.hostNickname.as("text")} /></label>
					{#each createMatchWithList.fields.hostNickname.issues() as issue}
						<p class="error">{issue.message}</p>
					{/each}
				</div>
				<hr />
				<p>Creating match with <span class="primary">{listName}</span></p>

				<div class="center"><button>Submit</button></div>
			</form>
		</Tabs.Content>
		<Tabs.Content value="joinMatch"></Tabs.Content>
	</Tabs.Root>
</Dialog>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 400px;
		padding-top: 16px;
	}
	:global([data-tabs-list].matchUnitTabs) {
		background-color: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		display: flex;
		justify-self: center;
	}
	:global([data-tabs-trigger].matchUnitTrigger) {
		background-color: transparent;
		padding: 8px 24px;
		color: var(--text-color);
	}
	:global([data-tabs-trigger].matchUnitTrigger[data-state="active"]) {
		background-color: var(--button);
		color: var(--button-text-color);
	}
	p.muted {
		margin-top: 4px;
	}
</style>
