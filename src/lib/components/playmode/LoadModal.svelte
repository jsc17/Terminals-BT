<script lang="ts">
	import { deserialize } from "$app/forms";
	import { Dialog } from "$lib/components/global/";
	import type { PlayList } from "$lib/types/playmode";
	import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
	import { getContext } from "svelte";

	type Props = {
		open: boolean;
		lists: { name: string; formations: string; units: string }[];
		playList: PlayList;
	};

	let { open = $bindable(), lists, playList = $bindable() }: Props = $props();
	let user: { username: string | undefined } = getContext("user");

	let selectedList = $state(0);

	async function loadList() {
		const newPlaylist: PlayList = { units: [], formations: [] };
		for (const unit of JSON.parse(lists[selectedList].units)) {
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
		for (const formation of JSON.parse(lists[selectedList].formations)) {
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
		playList.units = newPlaylist.units;
		playList.formations = newPlaylist.formations;
		localStorage.removeItem("playCurrentRound");
		location.reload();
	}
</script>

<Dialog title={"Load List"} bind:open>
	{#snippet description()}
		Loading a list will overwrite any in progress game:
	{/snippet}
	<div class="load-dialog-body">
		{#if user.username}
			<select bind:value={selectedList}>
				{#each lists as list, index}
					<option value={index}>{list.name}</option>
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
</style>
