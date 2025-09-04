<script lang="ts">
	import DropdownMenu from "$lib/generic/components/DropdownMenu.svelte";
	import { getEraName, getFactionName } from "$lib/remote/era-faction.remote";
	import { deleteParticipant, getParticipantsGameList } from "../../tournament.remote";
	import { toastController } from "$lib/stores";
	import { nanoid } from "nanoid";

	type Props = {
		participants: {
			id: number;
			name: string;
			email: string;
			listName: string;
			era: number;
			faction: number;
			dateSubmitted: Date;
			fixed: boolean;
			units: string;
		}[];
	};

	let { participants }: Props = $props();

	async function downloadList(id: number) {
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
</script>

<section class="card">
	<p>Participants: <span class="primary">{participants.length}</span></p>
	<p class="muted">Participants names and emails will be anonymized a few days after the tournament.</p>
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Email</th>
				<th>Date Submitted</th>
				<th>Era</th>
				<th>Faction</th>
				<th></th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each participants as participant}
				<tr>
					<td>{participant.name}</td>
					<td>{participant.email}</td>
					<td>{await getEraName(participant.era)}</td>
					<td>{await getFactionName(participant.faction)}</td>
					<td>{participant.dateSubmitted.toDateString()}</td>
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
									label: "Delete Participant",
									onSelect: () => {
										deleteParticipant(participant.id);
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
					<td class={{ last: true, fixed: participant.fixed }}>{participant.fixed ? "List was manually fixed" : ""}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

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
		background-color: var(--background-light);
		border: 1px solid var(--table-border);
		padding: 2px 6px;
		color: var(--);
	}
	td {
		border: 1px solid var(--table-border);
		padding: 4px 8px;
		background-color: var(--card);
		color: var(--muted-foreground);
		text-align: center;
	}
	td.last {
		font-size: 0.85rem;
		max-width: 100px;
	}
	td.fixed {
		color: var(--warning);
	}
</style>
