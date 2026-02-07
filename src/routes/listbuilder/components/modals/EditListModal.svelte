<script lang="ts">
	import { List } from "$lib/types/list.svelte";
	import { Dialog } from "$lib/generic";
	import { ruleSets } from "$lib/types/rulesets";

	type Props = {
		list: List;
		open: boolean;
	};

	let { list, open = $bindable() }: Props = $props();
	let listName = $derived(list.details.name);
	let rules = $derived(list.rules);

	function saveChanges() {
		list.details.name = listName;
		list.rules = rules;
		open = false;
	}

	function onOpenChange() {
		console.log("open changed");
		listName = list.details.name;
		rules = list.rules;
	}
</script>

<Dialog title="Edit List" bind:open {onOpenChange}>
	<div class="edit-list-dialog-body">
		<label>List Name: <input type="text" bind:value={listName} placeholder="List Name" /></label>
		<fieldset>
			<legend>
				<label
					>Rules: <select bind:value={rules} placeholder="Rules">
						{#each ruleSets as ruleset}
							<option value={ruleset.name}>{ruleset.display}</option>
						{/each}
					</select>
				</label>
			</legend>
			<p class="muted">Rules customization coming soon(ish) to this location</p>
		</fieldset>
		<div class="edit-dialog-footer">
			<button onclick={() => (open = false)}>Cancel</button>
			<button onclick={saveChanges}>Save</button>
		</div>
	</div>
</Dialog>

<style>
	.edit-list-dialog-body {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.edit-dialog-footer {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
	}
</style>
