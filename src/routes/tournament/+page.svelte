<script lang="ts">
	import { eraLookup, factionLookup } from "$lib/data/erasFactionLookup";
	import { enhance, deserialize } from "$app/forms";
	import { getContext } from "svelte";
	import { getNewSkillCost } from "$lib/utilities/genericBattletechUtilities";
	import { tournamentList } from "./tournamentList.svelte";

	let user: { username: string | undefined } = getContext("user");

	let tournamentDialog: HTMLDialogElement;
	let selectedSubmission = $state<number>(0);

	$effect(() => {
		if (tournamentList.selectedParticipant?.listCodes?.length) {
			selectedSubmission = tournamentList.selectedParticipant?.listCodes?.length - 1;
		}
	});

	$effect(() => {
		let listCode = tournamentList.selectedParticipant?.listCodes?.at(selectedSubmission);
		if (listCode) {
			const formData = new FormData();
			const unitList = listCode.units.map((unit: any) => {
				return unit.mulId;
			});
			formData.append("unitList", JSON.stringify(unitList));
			fetch("?/getUnits", {
				method: "POST",
				body: formData
			}).then((response) => {
				response.text().then((value) => {
					const result: any = deserialize(value);
					tournamentList.clearUnitList();
					listCode.units.forEach((unit, index) => {
						tournamentList.selectedUnitList.push({ name: result.data.unitList[index].name, skill: unit.skill, pv: getNewSkillCost(unit.skill, result.data.unitList[index].pv) });
					});
				});
			});
		}
	});

	$effect(() => {
		if (user.username) {
			tournamentList.getTournaments();
		} else {
			tournamentList.clearTournamentList();
		}
	});

	async function handleTournamentForm({ formData, cancel, submitter }: { formData: FormData; cancel: any; submitter: HTMLElement | null }) {
		if (submitter?.innerText == "Close") {
			cancel();
			tournamentDialog.close();
		}

		if (tournamentList.selectedTournament) {
			formData.append("id", tournamentList.selectedTournament.id.toString());
		}

		return async ({ result, update }: any) => {
			if (result.status == 200) {
				tournamentList.getTournaments();
				tournamentDialog.close();
				update();
			} else {
				alert(result.data.message);
			}
		};
	}
	async function handleDelete() {
		let confirmDelete = confirm(
			`Are you sure you want to delete the tournament ${tournamentList.selectedTournament!.name} on ${tournamentList.selectedTournament!.date.toDateString().split(" ").slice(1).join("-")}? This CANNOT be undone`
		);
		const formData = new FormData();
		formData.append("tournamentId", tournamentList.selectedTournament!.id.toString());
		if (confirmDelete) {
			const response: any = deserialize(await (await fetch("?/deleteTournament", { method: "POST", body: formData })).text());
			if (response.status == 200) {
				tournamentList.getTournaments();
			} else {
				alert("Could not delete tournament, please try again.");
			}
		}
	}
	function formatDateString(date: Date) {
		if (date) {
			return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
		}
	}
	function deleteParticipant(index: number) {
		tournamentList.selectParticipant(index);
		if (confirm(`Are you sure you want to delete ${tournamentList.selectedParticipant?.name}`)) {
			tournamentList.deleteParticipant(index);
		}
	}
</script>

<h1 style="color:var(--error)">ALPHA- still working on some features and testing functionality</h1>

<main>
	<section class="tall">
		<div class="space-between">
			<p>Your Tournaments</p>
			<div class="inline">
				<button onclick={handleDelete}>Delete</button>
				<button
					onclick={() => {
						tournamentList.selectTournament(-1);
						tournamentDialog.showModal();
					}}>Add</button
				>
			</div>
		</div>
		<div class="table-container">
			<table>
				<colgroup>
					<col style="width:50%" />
					<col style="width:30%" />
					<col style="width:20%" />
				</colgroup>
				<thead>
					<tr>
						<th>Name</th>
						<th>Date</th>
						<th>Players</th>
					</tr>
				</thead>
				<tbody>
					{#if !user.username}
						<tr>
							<td colspan="3">Login to view your tournaments</td>
						</tr>
					{:else if !tournamentList.tournaments.length}
						<tr>
							<td colspan="3">No Tournaments added</td>
						</tr>
					{:else}
						{#each tournamentList.tournaments as tournament, index}
							<tr
								class:selected-row={tournamentList.selectedTournamentIndex == index}
								onclick={() => {
									tournamentList.selectParticipant(-1);
									tournamentList.selectTournament(index);
								}}
							>
								<td>{tournament.name}</td>
								<td class:passed={tournament.passed}>{tournament.date.toUTCString().split(" ").slice(1, 4).join("-")}</td>
								<td>{tournament.participants.length}</td>
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
					{#if tournamentList.selectedTournamentIndex != -1}
						{#each tournamentList.selectedTournament?.participants! as participant, index}
							<tr
								class:selected-row={tournamentList.selectedParticipantIndex == index}
								onclick={() => {
									tournamentList.selectParticipant(index);
								}}
							>
								<td>{participant.name}</td>
								<td>{participant.listCodes?.at(-1)?.valid ? "✅" : "❌"}</td>
								<td
									><button
										onclick={() => {
											deleteParticipant(index);
										}}>Del</button
									></td
								>
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
				disabled={tournamentList.selectedTournamentIndex == -1}
				onclick={() => {
					tournamentDialog.showModal();
				}}>Edit</button
			>
		</div>
		<div class="tournament-details">
			<p>Tournament Name:</p>
			<p>{`${tournamentList.selectedTournament?.name ?? ""}`}</p>
			<p>Tournament Date:</p>
			<p>{`${tournamentList.selectedTournament?.date.toUTCString().split(" ").slice(1, 4).join("-") ?? ""}`}</p>
			<p>Tournament Era:</p>
			<p>{`${eraLookup.get(tournamentList.selectedTournament?.era!) ?? ""}`}</p>
			<p>Organizer Name:</p>
			<p>{`${tournamentList.selectedTournament?.organizer ?? ""}`}</p>
			<p>Contact Email:</p>
			<p>{`${tournamentList.selectedTournament?.email ?? ""}`}</p>
			<p></p>
		</div>
		<p>Tournament Link</p>
		<div class="space-between">
			<p>{tournamentList.selectedTournament?.tournamentLink ?? ""}</p>
			<button>Copy</button>
		</div>
	</section>
	<section class="details">
		<div class="column">
			<div class="split">
				<div class="column">
					<p>Player Name:</p>
					<p style="color:var(--primary)">
						{tournamentList.selectedParticipant?.name ?? "-"}
					</p>
				</div>
				<div class="column">
					<p>Email (if provided):</p>
					<p style="color:var(--primary)">
						{tournamentList.selectedParticipant?.email ?? "-"}
					</p>
				</div>
			</div>
			<div class="inline">
				<label for="submittedLists">Submitted Lists:</label>
				<select style="flex-grow: 1;" id="submittedLists" name="submittedLists" bind:value={selectedSubmission}>
					{#if tournamentList.selectedParticipant?.listCodes.length}
						{#each tournamentList.selectedParticipant.listCodes as listCode, index}
							{#if index == tournamentList.selectedParticipant.listCodes.length - 1}
								<option selected value={index}>{listCode.dateSubmitted.toUTCString().split(" ").slice(1, 4).join("-")} (Latest)</option>
							{:else}
								<option value={index}>{listCode.dateSubmitted.toUTCString().split(" ").slice(1, 4).join("-")}</option>
							{/if}
						{/each}
					{/if}
				</select>
			</div>
			<div class="split">
				<div class="column">
					<p>Era:</p>
					<p style="color:var(--primary)">
						{tournamentList.selectedParticipant?.listCodes?.at(selectedSubmission) ? eraLookup.get(tournamentList.selectedParticipant.listCodes.at(selectedSubmission)!.era) : "-"}
					</p>
				</div>
				<div class="column">
					<p>Faction:</p>
					<p style="color:var(--primary)">
						{tournamentList.selectedParticipant?.listCodes?.at(selectedSubmission)
							? factionLookup.get(tournamentList.selectedParticipant.listCodes.at(selectedSubmission)!.faction)
							: "-"}
					</p>
				</div>
			</div>

			<p>Issues:</p>
			<p style="color:var(--error)">
				{tournamentList.selectedParticipant?.listCodes?.at(selectedSubmission) ? tournamentList.selectedParticipant.listCodes?.at(selectedSubmission)!.issues : "-"}
			</p>
			<p>Message:</p>
			<p style="color:var(--primary)">
				{tournamentList.selectedParticipant?.listCodes?.at(selectedSubmission) ? tournamentList.selectedParticipant.listCodes?.at(selectedSubmission)!.message : "-"}
			</p>
			<p>Units:</p>

			<div class="split">
				{#each tournamentList.selectedUnitList as unit}
					<p class="unit">{unit.name}</p>
				{/each}
			</div>
		</div>
	</section>
</main>

<dialog bind:this={tournamentDialog}>
	<form class="dialog-body" method="post" action={tournamentList.selectedTournamentIndex == -1 ? "?/addTournament" : "?/updateTournament"} use:enhance={handleTournamentForm}>
		<div class="space-between">
			{#if tournamentList.selectedTournamentIndex == -1}
				<h1>Add Tournament</h1>
			{:else}
				<h1>Edit Tournament</h1>
			{/if}
			<button>Close</button>
		</div>
		<div class="inline">
			<label for="tournamentName">Tournament Name:</label>
			<input type="text" name="tournamentName" id="tournamentName" value={tournamentList.selectedTournament?.name ?? ""} />
		</div>
		<div class="inline">
			<label for="tournamentDate">Tournament Date:</label>
			<input type="date" name="tournamentDate" id="tournamentDate" value={tournamentList.selectedTournament ? formatDateString(tournamentList.selectedTournament.date) : ""} />
		</div>
		<div class="inline">
			<label for="tournamentEra">Tournament Era:</label>
			<select name="tournamentEra" id="tournamentEra">
				<option value="-1">Any</option>
				{#each eraLookup.entries() as [eraID, eraText]}
					<option value={eraID} selected={tournamentList.selectedTournament?.era == eraID}>{eraText}</option>
				{/each}
			</select>
		</div>
		<label for="organizerName">Tournament Organizer (Will be shown to players who view your tournament. Leave blank to use your username)</label>
		<input type="text" name="organizerName" id="organizerName" value={tournamentList.selectedTournament?.organizer ?? ""} />
		<label for="contactEmail">Organizer Email:</label>
		<input type="text" name="contactEmail" id="contactEmail" value={tournamentList.selectedTournament?.email ?? ""} />
		<div class="inline">
			<input name="display" id="display" type="checkbox" value="true" checked={tournamentList.selectedTournament?.displayEmail ?? false} />
			<label for="display">Display email address on validation page?</label>
		</div>
		<div class="inline">
			<input name="require_email" id="require_email" type="checkbox" value="true" checked={tournamentList.selectedTournament?.requireEmail ?? false} />
			<label for="require_email">Require user to submit their email address when submitting their list</label>
		</div>
		<div class="inline">
			<input name="allow_resubmission" id="allow_resubmission" type="checkbox" value="true" checked={tournamentList.selectedTournament?.allowResubmission ?? true} />
			<label for="allow_resubmission">Allow users to resubmit lists. (Will require TO to clear lists to allow resubmission before user can resubmit)</label>
		</div>
		<div class="inline">
			<input name="privateTournament" id="privateTournament" type="checkbox" value="true" checked={tournamentList.selectedTournament?.privateTournament ?? true} />
			<label for="privateTournament">Display tournament on validation page. (Participants will require the tournament link if this is uncheck, so please provide it to them.)</label
			>
		</div>
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
	.split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}
	input[type="checkbox"] {
		width: 15px;
		height: 15px;
		flex-shrink: 0;
	}
	.unit {
		color: var(--primary);
		padding: 4px;
		border: 1px solid var(--border);
	}
</style>
