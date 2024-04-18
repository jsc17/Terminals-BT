<script lang="ts">
	import { appWindow } from "$lib/utilities/responsive.svelte";

	let { showChangelog = $bindable() } = $props();
	let changeDialog: HTMLDialogElement;

	$effect(() => {
		if (showChangelog == true) {
			changeDialog.showModal();
		} else {
			changeDialog.close();
		}
	});
</script>

<dialog
	bind:this={changeDialog}
	on:close={() => {
		showChangelog = false;
	}}
	class="changelog"
	class:dialog-wide={appWindow.isNarrow}>
	<div class="dialog-body">
		<button
			class="close"
			on:click={() => {
				showChangelog = false;
			}}>Close</button>
		<div class="section">
			<h1>4-17-24</h1>
			<ul>
				<li><h2>Alpha Strike List builder and 350 List Builder:</h2></li>
				<ul>
					<li>Feature: Added export for <a href="https://jdgwf.github.io/battletech-tools/" target="_blank">Jeff's Battletech Tools</a></li>
				</ul>
			</ul>
		</div>
		<div class="section">
			<h1>4-15-24</h1>
			<ul>
				<li><h2>350 List Builder:</h2></li>
				<ul>
					<li>Feature: Added sublist management and printing</li>
				</ul>
			</ul>
		</div>
		<div class="section">
			<h1>3-26-24</h1>
			<ul>
				<li><h2>Alpha Strike List builder and 350 List Builder:</h2></li>
				<ul>
					<li>Feature: Added ability page reference numbers to printed lists.</li>
				</ul>
			</ul>
		</div>
		<div class="section">
			<h1>3-25-24</h1>
			<ul>
				<li><h2>Alpha Strike List builder and 350 List Builder:</h2></li>
				<ul>
					<li>Feature: Added additional filtering to abilities allowing for searching for multiple abilities, or optional abilities.</li>
				</ul>
			</ul>
		</div>
		<div class="section">
			<h1>3-22-24</h1>
			<ul>
				<li><h2>Alpha Strike List builder:</h2></li>
				<ul>
					<li>
						Feature: Added basic generic Alpha Strike List builder. Does not have the unit type, rules level, or ability restrictions the 350 list builder does. Also does no list
						validation.
					</li>
				</ul>
			</ul>
		</div>
		<div class="section">
			<h1>3-20-24</h1>
			<ul>
				<li><h2>350 List builder:</h2></li>
				<ul>
					<li>
						Feature: Add caching for faction lists. Should reduce the number of times the MUL is hit when searching for same faction in a day and add ability for listbuilder to
						still function when MUL is down.
					</li>
				</ul>
			</ul>
		</div>
		<div class="section">
			<h1>3-15-24</h1>
			<ul>
				<li><h2>350 List builder:</h2></li>
				<ul>
					<li>Fix: Actually filter out unique mechs correctly</li>
					<li>Fix: Correct issue importing list from code</li>
				</ul>
			</ul>
		</div>
		<div class="section">
			<h1>3-14-24</h1>
			<ul>
				<li><h2>350 List builder:</h2></li>
				<ul>
					<li>Feature: Add Off-board Artillery</li>
					<li>Feature: Mobile support! Going to keep working on it, but at least it's usable now.</li>
				</ul>
			</ul>
		</div>
		<div class="section">
			<h1>3-13-24</h1>
			<ul>
				<li><h2>350 List builder:</h2></li>
				<ul>
					<li>Feature: Add changelog (you're reading it.)</li>
					<li>Feature: Sharing and saving of lists</li>
					<ul>
						<li>Exporting and importing list codes for sharing</li>
						<li>Saving and loading lists to and from local storage</li>
						<li>Export code for tabletop simulator</li>
					</ul>
				</ul>
			</ul>
		</div>
		<div class="section">
			<h1>3-12-24</h1>
			<ul>
				<li><h2>350 List builder:</h2></li>
				<ul>
					<li>Fix: List PV not updating on skill change</li>
				</ul>
			</ul>
		</div>
		<div class="section">
			<h1>Notice from Comstar:</h1>
			<p>Records prior to 3-12-24 unavailable. Assume everything not mentioned above was done before this point.</p>
		</div>
	</div>
</dialog>

<style>
	.changelog {
		max-height: 90%;
		overflow: auto;
	}
	.close {
		width: fit-content;
		position: sticky;
		left: 95%;
		top: 5px;
	}
	h1 {
		font-size: 1.25rem;
		margin: 0;
	}
	h2 {
		font-size: 1rem;
		margin: 0;
	}
	.section {
		border-bottom: 1px solid var(--border);
	}
	li {
		margin-top: 5px;
	}
</style>
