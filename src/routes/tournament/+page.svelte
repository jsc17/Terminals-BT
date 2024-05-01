<script lang="ts">
	import { eras } from "$lib/data/erasFactionLookup";
	import { enhance, deserialize } from "$app/forms";
	import { getContext } from "svelte";
	import { dev } from "$app/environment";
	import { type Unit } from "$lib/types/unit.js";

	interface Tournament {
		id: number;
		name: string;
		era: number;
		date: Date;
		email: string;
		organizer: string;
		passed: boolean;
		participants: Participant[];
	}
	interface Participant {
		id: number;
		name: string;
		email?: string;
		listCode?: ListCode[];
	}
	interface ListCode {
		id: number;
		valid: boolean;
		message: string;
		dateSubmitted: Date;
		issues: string;
		units: Unit[];
		era: number;
		faction: number;
	}

	let user: { username: string | undefined } = getContext("user");

	const { data } = $props();

	let tournamentDialog: HTMLDialogElement;
	let tournamentList = $state<Tournament[]>([]);
	let selectedTournament = $state<number>(-1);
	let selectedParticipant = $state<number>(-1);
	let tournamentLink = $derived.by(() => {
		if (selectedTournament != -1) {
			if (dev) {
				return `https://localhost:5173/350validation?id=${tournamentList[selectedTournament].id}`;
			} else {
				return `https://bt.terminl.xyz/350validation?id=${tournamentList[selectedTournament].id}`;
			}
		} else {
			return "";
		}
	});

	$effect(() => {
		if (user.username) {
			getTournaments();
		} else {
			tournamentList = [];
		}
	});

	async function getTournaments() {
		const response: any = deserialize(await (await fetch("?/getTournaments", { method: "POST", body: "" })).text());
		if (response.status == 200) {
			pushTournamentLists(JSON.parse(response.data!.tournamentList));
		}
	}
	function pushTournamentLists(list: any[]) {
		console.log(list);
		tournamentList = [];
		for (const tournament of list) {
			console.log(tournament);
			let formattedTournament: Tournament = {
				id: tournament.id,
				name: tournament.name,
				era: tournament.era,
				date: new Date(tournament.date),
				email: tournament.email,
				organizer: tournament.organizer,
				passed: tournament.passed ?? false,
				participants: []
			};
			for (const participant of tournament.participants) {
				let formattedParticipant: Participant = {
					id: participant.id,
					email: participant.email,
					name: participant.name,
					listCode: []
				};
				console.log(formattedParticipant);
				formattedTournament.participants.push(formattedParticipant);
			}

			tournamentList.push(formattedTournament);
		}
		tournamentList.sort((a: Tournament, b: Tournament) => {
			return a.date.getTime() - b.date.getTime();
		});
	}

	async function handleTournamentForm({ formData, cancel, submitter }: { formData: FormData; cancel: any; submitter: HTMLElement | null }) {
		if (submitter?.innerText == "Close") {
			cancel();
			tournamentDialog.close();
		}

		if (selectedTournament != -1) {
			formData.append("id", tournamentList[selectedTournament].id.toString());
		}

		return async ({ result, update }: any) => {
			if (result.status == 200) {
				getTournaments();
				tournamentDialog.close();
				update();
			} else {
				alert(result.data.message);
			}
		};
	}
	async function handleDelete() {
		let confirmDelete = confirm(
			`Are you sure you want to delete the tournament ${tournamentList[selectedTournament].name} on ${tournamentList[selectedTournament].date.toDateString().split(" ").slice(1).join("-")}? This CANNOT be undone`
		);
		const formData = new FormData();
		formData.append("tournamentId", tournamentList[selectedTournament].id.toString());
		if (confirmDelete) {
			const response: any = deserialize(await (await fetch("?/deleteTournament", { method: "POST", body: formData })).text());
			if (response.status == 200) {
				getTournaments();
			} else {
				alert("Could not delete tournament, please try again.");
			}
		}
	}
	function formatDateString(date: Date) {
		return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
	}
</script>

<main>
	<section class="tall">
		<div class="space-between">
			<p>Your Tournaments</p>
			<div class="inline">
				<button on:click={handleDelete}>Delete</button>
				<button
					on:click={() => {
						selectedTournament = -1;
						tournamentDialog.showModal();
					}}>Add</button>
			</div>
		</div>
		<div class="table-container">
			<table>
				<colgroup>
					<col style="width:60%" />
					<col style="width:40%" />
				</colgroup>
				<thead>
					<tr>
						<th>Name</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					{#if !user.username}
						<tr>
							<td colspan="3">Login to view your tournaments</td>
						</tr>
					{:else if !tournamentList.length}
						<tr>
							<td colspan="3">No Tournaments added</td>
						</tr>
					{:else}
						{#each tournamentList as tournament, index}
							<tr
								class:selected-row={selectedTournament == index}
								on:click={() => {
									selectedParticipant = -1;
									selectedTournament = index;
								}}>
								<td>{tournament.name}</td>
								<td class:passed={tournament.passed}>{tournament.date.toDateString().split(" ").slice(1).join("-")}</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</section>
	<section class="tall">
		<p>Tournament Participants</p>

		<div class="table-container">
			<table>
				<colgroup>
					<col style="width:80%" />
					<col style="width:10%" />
					<col style="width:10%" />
				</colgroup>
				<thead>
					<tr>
						<th>Name</th>
						<th>Valid</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#if selectedTournament != -1}
						{#each tournamentList[selectedTournament]?.participants as participant, index}
							<tr
								class:selected-row={selectedParticipant == index}
								on:click={() => {
									selectedParticipant = index;
								}}>
								<td>{participant.name}</td>
								<td></td>
								<td></td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</section>
	<section class="details">
		<div class="space-between">
			<p>Tournament Details</p>
			<button
				disabled={selectedTournament == -1}
				on:click={() => {
					tournamentDialog.showModal();
				}}>Edit</button>
		</div>
		<div class="tournament-details">
			<p>Tournament Name:</p>
			<p>{`${tournamentList[selectedTournament]?.name ?? ""}`}</p>
			<p>Tournament Date:</p>
			<p>{`${tournamentList[selectedTournament]?.date.toDateString().split(" ").slice(1).join("-") ?? ""}`}</p>
			<p>Tournament Era:</p>
			<p>{`${eras.get(tournamentList[selectedTournament]?.era) ?? ""}`}</p>
			<p>Organizer Name:</p>
			<p>{`${tournamentList[selectedTournament]?.organizer ?? ""}`}</p>
			<p>Contact Email:</p>
			<p>{`${tournamentList[selectedTournament]?.email ?? ""}`}</p>
			<p></p>
		</div>
		<p>Tournament Link</p>
		<div class="space-between">
			<p>{tournamentLink}</p>
			<button>Copy</button>
		</div>
	</section>
	<section class="details">
		<p>Player details</p>
		<div class="player-details">
			<p>Player Name:</p>
		</div>
	</section>
</main>

<dialog bind:this={tournamentDialog}>
	<form class="dialog-body" method="post" action={selectedTournament == -1 ? "?/addTournament" : "?/updateTournament"} use:enhance={handleTournamentForm}>
		<div class="space-between">
			{#if selectedTournament == -1}
				<h1>Add Tournament</h1>
			{:else}
				<h1>Edit Tournament</h1>
			{/if}
			<button>Close</button>
		</div>
		<label for="tournamentName">Tournament Name*</label>
		<input type="text" name="tournamentName" id="tournamentName" value={tournamentList[selectedTournament]?.name ?? ""} />
		<label for="tournamentDate">Tournament Date*</label>
		<input type="date" name="tournamentDate" id="tournamentDate" value={selectedTournament != -1 ? formatDateString(tournamentList[selectedTournament].date) : ""} />
		<label for="organizerName">Tournament Organizer (Will be shown to players who view your tournament. Leave blank to use your username)</label>
		<input type="text" name="organizerName" id="organizerName" value={tournamentList[selectedTournament]?.organizer ?? ""} />
		<label for="contactEmail">Organizer Email*</label>
		<input type="text" name="contactEmail" id="contactEmail" value={tournamentList[selectedTournament]?.email ?? ""} />
		<label for="tournamentEra">Tournament Era*</label>
		<select name="tournamentEra" id="tournamentEra">
			<option value="-1">Any</option>
			{#each eras.entries() as [eraID, eraText]}
				<option value={eraID} selected={tournamentList[selectedTournament]?.era == eraID}>{eraText}</option>
			{/each}
		</select>
		<div class="center"><button>Submit</button></div>
	</form>
</dialog>

<style>
	main {
		padding: 24px;
		display: grid;
		gap: 8px;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: 1fr 2fr;
		height: 100%;
	}
	section {
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 16px;
	}
	.tall {
		grid-row-start: 1;
		grid-row-end: 3;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.table-container {
		height: 100%;
		width: 100%;
		background-color: var(--background);
	}
	table {
		background-color: var(--background);
		width: 100%;
		border-collapse: collapse;
		overflow: auto;
	}
	th {
		padding-left: 8px;
		text-align: start;
		border-bottom: 1px solid var(--border);
		background-color: var(--popover);
		color: var(--popover-foreground);
	}
	td {
		padding: 8px 16px;
		border-bottom: 1px solid var(--border);
	}
	.passed {
		color: var(--error);
	}
	.selected-row {
		box-shadow: 5px 0px 5px var(--primary) inset;
	}
	.tournament-details {
		padding: 16px;
		display: grid;
		grid-template-columns: 4fr 6fr;
		gap: 8px;
	}
	.details {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
</style>
