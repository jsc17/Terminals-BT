import { GITHUB_TOKEN } from "$env/static/private";

export const actions = {
	createIssue: async ({ request }) => {
		const formData = await request.formData();

		const { issueTitle, issueType, issueDetails } = Object.fromEntries(formData) as { issueTitle: string; issueType: string; issueDetails: string };

		let body: string;
		let issueLabels: string[] = [];
		issueLabels.push(issueType);
		if (issueType == "bug") {
			const { issuePage, issueEra, issueFaction, issueDevice, issueSeverity } = Object.fromEntries(formData) as {
				issuePage: string;
				issueEra: string;
				issueFaction: string;
				issueDevice: string;
				issueSeverity: string;
			};
			issueLabels.push(issueSeverity);
			body = `Issue Page:\n${issuePage}\n\nIssue Device:\n${issueDevice}\n\nIssue Severity:\n${issueSeverity}\n\nIssue Details:\n${issueDetails}`;
			if (issueEra) {
				body += `\n\nEra:\n${issueEra}`;
			}
			if (issueFaction) {
				body += `\n\nFaction:\n${issueFaction}`;
			}
		} else {
			body = `Feature Details:\n${issueDetails}`;
		}

		let issue = { title: issueTitle, labels: issueLabels, assignees: ["jsc17"], body: body };

		const response = await fetch(`https://api.github.com/repos/jsc17/Terminals-BT/issues`, {
			method: "post",
			body: JSON.stringify(issue),
			headers: { accept: "application/vnd.github+json", Authorization: `Bearer ${GITHUB_TOKEN}` }
		});
		const json = await response.json();
		if (response.status == 201) {
			console.log(`Issue created successfully at ${json.url}`);
		} else {
			console.log(`Something went wrong: ${json}`);
		}
		return { status: response.status, url: json.html_url };
	}
};
