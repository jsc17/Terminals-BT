<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";

	let { showReportModal = $bindable() } = $props();
	let reportDialog: HTMLDialogElement;
	let issueType = $state("bug");
	$effect(() => {
		if (showReportModal) {
			reportDialog.showModal();
		} else {
			reportDialog.close();
		}
	});

	async function createIssueForm({ formData, cancel, submitter }: any) {
		if (submitter.innerText == "Cancel") {
			reportDialog.close();
			cancel();
		}
		for (const [key, value] of formData.entries()) {
			console.log(`${key}: ${value}`);
		}

		reportDialog.close();
		return async ({ result }: any) => {
			console.log(result);
			if (result.data.status == 201) {
				window.open(result.data.url, "_blank");
			} else {
				alert("Failed to create issue, please try again.");
			}
		};
	}
</script>

<dialog
	bind:this={reportDialog}
	on:close={() => {
		showReportModal = false;
	}}>
	<form class="dialog-body" action="/?/createIssue" method="post" use:enhance={createIssueForm}>
		<p>
			Obviously I'd like everything to work without issues, but if you're here maybe it didn't, or maybe you just have a suggestion. Please enter the details below and I'll see
			what I can do.
		</p>
		<p>Please check if an issue is already known or a feature has already been suggested: <a href="https://github.com/jsc17/BT-Tools/issues" target="_blank">Known Issues</a></p>

		<div class="radiogroup">
			<div><input type="radio" name="issueType" id="issue" value="bug" bind:group={issueType} /><label for="issue">Bug Report</label></div>
			<div><input type="radio" name="issueType" id="feature request" value="feature request" bind:group={issueType} /><label for="feature request">Feature Request</label></div>
		</div>
		{#if issueType == "bug"}
			<div class="inline gap8"><label for="issueTitle">Issue Title:</label><input type="text" name="issueTitle" id="issueTitle" /></div>
			<div class="inline gap8"><label for="issuePage">Issue Page:</label><input type="text" name="issuePage" id="issuePage" value={$page.url.pathname} /></div>
			<label for="issueDetails">Issue Details (Please be as specific as possible.):</label><textarea name="issueDetails" id="issueDetails" cols="60" rows="10"></textarea>
			<div class="inline gap8">
				<label for="issueEra">Era (optional):</label><input type="text" name="issueEra" id="issueEra" />
				<label for="issueFaction">Faction (optional):</label><input type="text" name="issueFaction" id="issueFaction" />
			</div>
		{:else}
			<div class="inline gap8"><label for="issueTitle">Request Title:</label><input type="text" name="issueTitle" id="issueTitle" /></div>
			<label for="issueDetails">Request Details (Please be as specific as possible.):</label><textarea name="issueDetails" id="issueDetails" cols="60" rows="10"></textarea>
		{/if}

		<div class="form-buttons">
			<button>Cancel</button>
			<button type="submit">Submit</button>
		</div>
	</form>
</dialog>

<style>
	input[type="radio"] {
		margin-right: 8px;
	}
	textarea {
		background-color: var(--card-background);
		color: var(--card-foreground);
	}
</style>
