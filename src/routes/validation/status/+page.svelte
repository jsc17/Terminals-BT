<script lang="ts">
	import { getContext } from "svelte";
	import { getSubmissionsByEmail, getUserSubmissions } from "./status.remote";
	import { toastController } from "$lib/stores";

	let user: { username: string | undefined } = getContext("user");
	const userSubmissionData = $derived(await getUserSubmissions());
	const userSubmissions = $derived(userSubmissionData.status == "success" ? userSubmissionData.data : []);
	let emailSubmissions = $state<{ tournament: { name: string; tournament_date: Date }; dateSubmitted: Date; teamName: string | null; approved: boolean }[]>([]);
</script>

<main>
	<a href="/validation">Submit a new list to a tournament</a>
	<div class="card">
		<h2>Users Submissions</h2>
		<p class="muted">Shows lists you have submitted while logged in. <span class="warning">Does not show submissions prior to 6/28/26</span></p>
		{#if user.username}
			<div class="table-wrapper">
				<table>
					<thead>
						<tr>
							<th>Tournament</th>
							<th>Tournament Date</th>
							<th>Date Submitted</th>
							<th>Team Name</th>
							<th>Era</th>
							<th>Faction</th>
							<th>Approval Status</th>
						</tr>
					</thead>
					<tbody>
						{#each userSubmissions as submission}
							<tr>
								<td>{submission.tournament.name}</td>
								<td>{submission.tournament.tournament_date.toLocaleDateString("en-US")}</td>
								<td>{submission.dateSubmitted.toLocaleDateString("en-US")}</td>
								<td>{submission.teamName ?? "-"}</td>
								<td>{submission.era}</td>
								<td>{submission.faction}</td>
								<td
									>{#if submission.approved}
										<span class="primary">Approved</span>
									{:else}
										<span class="warning">Pending</span>{/if}</td
								>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<p>Please Login to see submissions</p>
		{/if}
	</div>
	<div class="card">
		<h2>Find Submissions by Email</h2>
		<p class="muted">This will give less detailed information, but doesn't require you to have submitted your list while logged in</p>
		<form
			{...getSubmissionsByEmail.enhance(async ({ submit }) => {
				try {
					if (await submit()) {
						emailSubmissions = getSubmissionsByEmail.result?.data ?? [];
					}
				} catch {
					toastController.addToast("Something went wrong. Please try again later");
				}
			})}
		>
			<label>Email Address: <input {...getSubmissionsByEmail.fields.email.as("email")} /></label> <button>Search</button>
		</form>
		<div class="table-wrapper">
			<table>
				<thead>
					<tr>
						<th>Tournament</th>
						<th>Tournament Date</th>
						<th>Date Submitted</th>
						<th>Team Name</th>
						<th>Approval Status</th>
					</tr>
				</thead>
				<tbody>
					{#each emailSubmissions as submission}
						<tr>
							<td>{submission.tournament.name}</td>
							<td>{submission.tournament.tournament_date.toLocaleDateString("en-US")}</td>
							<td>{submission.dateSubmitted.toLocaleDateString("en-US")}</td>
							<td>{submission.teamName ?? "-"}</td>
							<td
								>{#if submission.approved}
									<span class="primary">Approved</span>
								{:else}
									<span class="warning">Pending</span>{/if}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: var(--responsive-padding);
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	h2 {
		margin: 0;
	}
	.table-wrapper {
		max-height: 350px;
		overflow: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 8px;
	}
	th {
		border: 1px solid var(--table-border);
		padding: var(--responsive-padding);
	}
	td {
		border: 1px solid var(--table-border);
		padding: var(--responsive-padding);
	}
	td:not(:first-child) {
		text-align: center;
	}
	tr:nth-child(even) {
		background-color: var(--table-secondary);
	}
</style>
