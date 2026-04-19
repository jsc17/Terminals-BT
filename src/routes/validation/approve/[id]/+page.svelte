<script lang="ts">
	import { page } from "$app/state";
	import { getMULDataFromId, isUnitAvailable, isUnitUnique } from "$lib/remote/unit.remote";
	import { toastController } from "$lib/stores";
	import { createAbilityLineString } from "$lib/utilities/abilityUtilities";
	import type { ValidationBFSData, ValidationUnitData } from "$routes/validation/types";
	import { sendApproval, getPlayerData, getTournamentData } from "../../tournament.remote";
	import { innerWidth } from "svelte/reactivity/window";
	import { nanoid } from "nanoid";
	import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
	import { getEraId, getFactionId, getGeneralId } from "$lib/remote/era-faction.remote";
	import { getBfsById } from "$lib/data/battlefieldSupport";

	const id = page.params.id;
	const playerData = $derived(await getPlayerData({ playerId: id ?? "" }));
	const tournamentData = $derived(playerData?.tournamentId ? await getTournamentData({ tournamentId: playerData.tournamentId }) : null);
	let comment = $state("");
	let error = $state<string>();

	const era = $derived(await getEraId(playerData?.era ?? ""));
	const faction = $derived(await getFactionId(playerData?.faction ?? ""));
	const general = $derived(await getGeneralId({ era, faction }));

	const unitData = $derived<ValidationUnitData[]>(
		await Promise.all(
			JSON.parse(playerData?.units ?? "[]").map(async (u: string) => {
				const { id, sk } = JSON.parse(u);
				const data = await getMULDataFromId(id);
				const isAvailable = await isUnitAvailable({ unitId: data?.id ?? 0, eras: [era], factions: [faction, general] });
				const isUnique = await isUnitUnique({ unitId: data?.id ?? 0, eras: [era] });
				return {
					id: nanoid(),
					skill: sk,
					name: data?.name ?? "",
					pv: getNewSkillCost(sk, data?.pv ?? 0),
					available: isAvailable,
					unique: isUnique,
					link: data?.link ?? "",
					mulData: data
				};
			})
		)
	);
	const fixedUnits = $derived(JSON.parse(playerData?.fixedUnits ?? "[]").map(({ id }: { id: number }) => id));
	const addedUnits = $derived(JSON.parse(playerData?.addedUnits ?? "[]").map(({ id }: { id: number }) => id));

	const battlefieldSupports = $derived<ValidationBFSData[]>(
		await Promise.all(
			JSON.parse(playerData?.bfs ?? "[]").map(async (u: string) => {
				const { id, count } = JSON.parse(u);
				const data = getBfsById(id);
				return {
					id,
					count,
					name: data?.name ?? "",
					pv: data?.pvCost ?? 0,
					bsp: data?.bspCost ?? 0
				};
			})
		)
	);
	const fixedBfs = $derived<{ original: { id: number; count: number }; fixed: { id: number; count: number } }[]>(
		JSON.parse(playerData?.fixedBfs ?? "[]").map((bfs: string) => JSON.parse(bfs))
	);
	const addedBfs = $derived<{ id: number; count: number }[]>(JSON.parse(playerData?.addedBfs ?? "[]").map((bfs: string) => JSON.parse(bfs)));

	const unitPv = $derived(unitData.reduce((acc, unit) => acc + unit.pv, 0));
	const bfsPv = $derived(battlefieldSupports.reduce((acc, bfs) => acc + (bfs.pv ?? 0) * bfs.count, 0));
	const bfsBSP = $derived(battlefieldSupports.reduce((acc, bfs) => acc + (bfs.bsp ?? 0) * bfs.count, 0));
	const totalPV = $derived(unitPv + bfsPv);
</script>

<main>
	{#if error}
		<h1 class="error">{error}</h1>
	{/if}
	<section>
		<h2>Player Information</h2>
		{#if playerData}
			<div class="player-data">
				<div class="player-data-section">
					<p class="muted">Name:</p>
					<p>{playerData.name}</p>
				</div>
				<div class="player-data-section">
					<p class="muted">Email:</p>
					<p>{playerData.email}</p>
				</div>
				<div class="player-data-section">
					<p class="muted">Era:</p>
					<p>{playerData.era}</p>
				</div>
				<div class="player-data-section">
					<p class="muted">Date Submitted:</p>
					<p>{playerData.dateSubmitted.toLocaleDateString()}</p>
				</div>
				<div class="player-data-section">
					<p class="muted">Tournament:</p>
					<p>{tournamentData?.name ?? "Not Found"}</p>
				</div>
				<div class="player-data-section">
					<p class="muted">Faction:</p>
					<p>{playerData.faction}</p>
				</div>
			</div>
		{/if}
	</section>
	<section>
		{#if playerData?.approved}
			<p class="warning">This list has already been approved. You may resend the email if needed for some reason.</p>
		{/if}
		{#if fixedUnits.length || addedUnits.length || fixedBfs.length || addedBfs.length}
			<p class="warning">This list has been manually edited. Please review the changes before approving.</p>
		{/if}
		<p>Comment (Optional): <span class="muted italic">This will be sent to the player with the approval email</span></p>
		<textarea bind:value={comment}></textarea>
		<div>
			<button
				class="detailed-button"
				onclick={() => {
					toastController.addToast("Sending approval email...");
					sendApproval({ id: id ?? "", comment }).then((res) => {
						if (res.status == "success") {
							toastController.addToast("Approval email sent");
							getPlayerData({ playerId: id ?? "" }).refresh();
						} else {
							toastController.addToast("Approval email failed to send");
						}
					});
				}}>Send Approval Email</button
			>
		</div>
	</section>
	<section>
		<h2>List Total PV - <span class="primary">{totalPV}</span></h2>
		<h2>Units - <span class="primary">{unitData.length}</span> units - <span class="primary">{unitPv}</span> pv</h2>
		<table>
			<thead>
				<tr>
					{#each innerWidth.current! >= 600 ? ["Name", "Skill", "PV", "Rules", "Type", "Abilities", "Available", "Unique"] : ["Name", "Skill"] as header}
						<th>{header}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each unitData ?? [] as unit (unit.id)}
					<tr>
						<td>
							{#if unit.link}
								<a href={unit.link} target="_blank">{unit.name}</a>
							{:else}
								{unit.name}
							{/if}
						</td>
						{#each innerWidth.current! >= 600 ? [unit.skill, unit.pv, unit.mulData?.rulesLevel, unit.mulData?.subtype, createAbilityLineString(unit.mulData?.abilities ?? []), unit.available, unit.unique] : [unit.skill] as data}
							<td>{data ?? "-"}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
		<h2>
			Battlefield Support - <span class="primary">{bfsPv}</span> pv - <span class="primary">{bfsBSP}</span> bsp
		</h2>
		<table>
			<thead>
				<tr>
					{#each ["Name", "Count", "PV (total)", "BSP (total)"] as header}
						<th>{header}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each battlefieldSupports ?? [] as bfs}
					{@const isFixed = fixedBfs.some((fixedBfs) => fixedBfs.fixed.id === bfs.id)}
					{@const isAdded = addedBfs.some((addedBfs) => addedBfs.id === bfs.id)}
					<tr>
						<td>{bfs.name} <span class="warning">{isFixed ? "(Manually Fixed)" : ""} {isAdded ? "(Manually Added)" : ""}</span></td>
						<td>{bfs.count}</td>
						<td>{bfs.pv ? `${bfs.pv} (${bfs.pv * bfs.count})` : "-"}</td>
						<td>{bfs.bsp ? `${bfs.bsp} (${bfs.bsp * bfs.count})` : "-"}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</main>

<style>
	main {
		padding: var(--responsive-padding);
	}
	section {
		background-color: var(--surface-color);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 16px;
	}
	h2 {
		font-size: 1.1rem;
		margin-top: 8px;
		margin-bottom: 8px;
	}
	.player-data {
		display: grid;
		grid-template-columns: repeat(6, max-content);
		gap: 8px 48px;
	}
	.player-data-section {
		display: grid;
		grid-template-columns: subgrid;
		grid-column: span 2;
		gap: 8px;
	}
	.player-data-section p:first-child {
		justify-self: end;
	}
	table {
		border-collapse: collapse;
	}
	td,
	th {
		padding: 8px;
		border: 2px solid var(--border);
	}
</style>
