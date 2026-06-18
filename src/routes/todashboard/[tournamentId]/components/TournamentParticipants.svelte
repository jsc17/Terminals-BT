<script lang="ts">
	import { DropdownMenu } from "$lib/generic/";
	import { deleteParticipant, getParticipantsGameList } from "../../tournament.remote";
	import { toastController } from "$lib/stores";
	import { nanoid } from "nanoid";
	import type { Participant } from "$lib/generated/prisma/browser";
	import { dev } from "$app/environment";
	import SetTeamDialog from "./SetTeamDialog.svelte";
	import { exportRowsToCSV } from "$lib/utilities/export";
	import type { MenuItem } from "$lib/generic/types";

	type Props = {
		fixedEra: boolean;
		participants: Participant[];
		teams: boolean;
	};

	let { participants, fixedEra, teams }: Props = $props();
	let setTeamDialogBinding = $state<SetTeamDialog>();

	async function downloadList(id: string) {
		const result = await getParticipantsGameList(id);
		if (result.status == "success") {
			const blob = new Blob([result.data! as BlobPart], { type: "application/pdf" });
			const downloadElement = document.createElement("a");
			downloadElement.download = nanoid(6);
			downloadElement.href = URL.createObjectURL(blob);
			downloadElement.click();
		} else {
			toastController.addToast("Invalid list recieved. Please try again.");
		}
	}

	function exportPlayersToCryodex() {
		const rows: string[] = ['"Name","First Name","Last Name"'];
		for (const participant of participants) rows.push(`"","${participant.name}",""`);
		exportRowsToCSV(rows);
	}

	function exportTeamsToCryodex() {
		const rows: string[] = ['"Name","First Name","Last Name"'];
		for (const team of [...new Set(participants.map((p) => p.teamName).filter((t) => t != null))]) rows.push(`"","${team}",""`);
		exportRowsToCSV(rows);
	}

	const exportMenuItems = $derived.by(() => {
		const menuItems: MenuItem[] = [
			{
				type: "item",
				label: "Export Players to Cryodex",
				onSelect: () => exportPlayersToCryodex()
			}
		];
		if (teams)
			menuItems.push({
				type: "item",
				label: "Export Teams to Cryodex",
				onSelect: () => exportTeamsToCryodex()
			});
		return menuItems;
	});
</script>

<section class="card">
	<div class="flex-between">
		<div>
			<p>Participants: <span class="primary">{participants.length}</span></p>
			<p class="muted">Participants names and emails will be anonymized a few days after the tournament.</p>
		</div>
		<DropdownMenu items={exportMenuItems}>
			{#snippet trigger()}
				Export
			{/snippet}
		</DropdownMenu>
	</div>
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Email</th>
				<th>Date Submitted</th>
				{#if !fixedEra}
					<th>Era</th>
				{/if}
				<th>Faction</th>
				{#if teams}
					<th>Team</th>
				{/if}
				<th>Approval Status</th>
				<th></th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each participants as participant}
				<tr>
					<td>{participant.name}</td>
					<td>{participant.email}</td>
					<td>{participant.dateSubmitted.toDateString()}</td>
					{#if !fixedEra}
						<td>{participant.era}</td>
					{/if}
					<td>{participant.faction}</td>
					{#if teams}
						<td>{participant.teamName ?? "-"}</td>
					{/if}
					<td
						>{#if participant.approved}
							<p class="primary">Approved</p>
						{:else}
							<div class="center inline">
								<p class="warning">Pending</p>
								<a class="approval-link" href={`${dev ? `https://localhost:5173` : `https://terminal.tools`}/validation/approve/${participant.id}`} target="_blank">
									(Approve Now)</a
								>
							</div>
						{/if}</td
					>
					<td>
						<DropdownMenu
							items={[
								{
									type: "item",
									label: "Download List",
									onSelect: () => {
										downloadList(participant.id);
									}
								},
								{
									type: "item",
									label: "Set Team",
									onSelect: () => {
										setTeamDialogBinding?.open(participant);
									}
								},
								{
									type: "separator"
								},
								{
									type: "item",
									label: "Delete Participant",
									onSelect: () => {
										if (confirm(`Are you sure you wish to remove ${participant.name} from the tournament?`)) deleteParticipant(participant.id);
									}
								}
							]}
							triggerClasses="transparent-button"
						>
							{#snippet trigger()}
								Menu
							{/snippet}
						</DropdownMenu>
					</td>
					<td class={{ last: true, warning: participant.fixedUnits != "[]" }}>
						<p>
							{participant.fixedUnits != null || participant.fixedBfs != null || participant.addedUnits != null || participant.addedBfs != null ? "List was manually editted" : ""}
						</p>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

<SetTeamDialog bind:this={setTeamDialogBinding} />

<style>
	section.card {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th {
		background-color: var(--background);
		border: 1px solid var(--table-border);
		padding: 2px 6px;
		color: var(--);
	}
	td {
		border: 1px solid var(--table-border);
		padding: 4px 8px;
		background-color: var(--surface-color);
		color: var(--surface-color-light-text-color);
		text-align: center;
	}
	td.last {
		font-size: 0.85rem;
		max-width: 100px;
	}
</style>
