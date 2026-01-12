<!-- <script lang="ts">
	import { deserialize } from "$app/forms";
	import { Dialog } from "$lib/generic";
	import { db } from "$lib/offline/db";
	import type { PlayList } from "../../types/types";
	import { getUsersLists } from "$lib/remote/list.remote";
	import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
	import { nanoid } from "nanoid";
	import { getContext } from "svelte";

	type Props = {
		matches: PlayList[];
	};

	let { matches = $bindable() }: Props = $props();

	let user: { username: string | undefined } = getContext("user");

	let lists = $state(getUsersLists());
	let selectedList = $state(lists.current?.data?.[0]);

	let open = $state(false);

	function onOpenChange() {
		lists.refresh();
	}

	async function loadList() {
		if (selectedList) {
			const newPlaylist: PlayList = { id: nanoid().toLowerCase(), name: selectedList.name, units: [], formations: [], date: new Date().toDateString() };
			for (const unit of JSON.parse(selectedList.units)) {
				const formData = new FormData();
				formData.append("mulId", unit.mulId);
				const pv = (deserialize(await (await fetch("?/getCost", { method: "POST", body: formData })).text()) as any).data.pv;
				newPlaylist.units.push({
					...unit,
					cost: getNewSkillCost(unit.skill, pv),
					current: { damage: 0, heat: 0, crits: [], disabledAbilities: [] },
					pending: { damage: 0, heat: 0, crits: [] }
				});
			}
			for (const formation of JSON.parse(selectedList.formations)) {
				if (formation.units.length) {
					newPlaylist.formations.push({
						id: formation.id,
						name: formation.name,
						type: formation.type,
						units: formation.units.map((unit: any) => {
							return unit.id;
						}),
						secondary: {
							type: formation.secondary?.type,
							units: formation.secondary?.units.map(({ id }: { id: string }) => {
								return id;
							})
						}
					});
				}
			}
			db.localMatches.add(newPlaylist);
			matches.push(newPlaylist);
			open = false;
		}
	}
</script>

<Dialog title={"Load List"} {onOpenChange} bind:open>
	{#snippet trigger()}
		New Match
	{/snippet}
	{#snippet description()}
		Create a new match using a saved list
	{/snippet}
	<div class="load-dialog-body">
		{#if user.username}
			<select bind:value={selectedList}>
				{#each lists.current?.data ?? [] as list}
					<option value={list}>{list.name}</option>
				{/each}
			</select>
			<button onclick={loadList}>Load</button>
		{:else}
			<p class="load-message">Please log in to load saved list</p>
		{/if}
	</div>
</Dialog>

<style>
	.load-message {
		align-self: center;
		justify-self: center;
		margin: 24px 16px;
	}
	.load-dialog-body {
		display: flex;
		flex-direction: column;
	}
</style> -->
