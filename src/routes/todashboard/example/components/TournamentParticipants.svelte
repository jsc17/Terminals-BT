<script lang="ts">
	import { DropdownMenu } from "$lib/generic/";
	import { deleteParticipant, getParticipantsGameList } from "../../tournament.remote";
	import { toastController } from "$lib/stores";
	import { nanoid } from "nanoid";

	type Props = {
		fixedEra: boolean;
		participants: {
			id: string;
			name: string;
			email: string;
			era: string;
			faction: string;
			dateSubmitted: Date;
			fixed: boolean;
			units: string;
		}[];
	};

	let { participants, fixedEra }: Props = $props();

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
				{#if !fixedEra}
					<th>Era</th>
				{/if}
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
					<td>{participant.dateSubmitted.toDateString()}</td>
					{#if !fixedEra}
						<td>{participant.era}</td>
					{/if}
					<td>{participant.faction}</td>
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
										toastController.addToast("Can't delete participant from the demo page for the moment");
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
