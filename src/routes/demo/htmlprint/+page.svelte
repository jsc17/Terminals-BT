<script lang="ts">
	import { type PrintListOutput, type PrintOptionsOutput } from "./types";
	import ListTemplate from "./ListTemplate.svelte";
	import { printList } from "./print.remote";
	import { toastController } from "$lib/stores";
	import { getMULDataFromId } from "$lib/remote/unit.remote";
	import { getAmmoByName } from "$lib/remote/ammo.remote";
	import { getMulCard, getMulImage } from "./mulImages.remote";
	import { parseTest } from "./parse.remote";

	const listData = $state<PrintListOutput>({
		name: "FWL Jihad",
		units: [
			{
				id: "2P4nFv",
				mulId: 1302,
				skill: 3,
				customization: {
					spa: ["Animal Mimicry"],
					ammo: ["Air-Defense Arrow IV"]
				}
			},
			{
				id: "AGAW",
				mulId: 996,
				skill: 4
			}
		],
		formations: [
			{
				name: "Unassigned units",
				type: "none",
				units: ["2P4nFv"]
			},
			{
				name: "Test",
				type: "Battle",
				units: ["AGAW"]
			}
		]
	});
	const printOptions = $state<PrintOptionsOutput>({
		printStyle: "detailed", //done
		printFormations: true, //done
		printCardsByFormation: true, //done
		printFormationBonuses: false,
		cardStyle: "generated", //done
		formationHeaderStyle: "side", //done
		measurementUnits: "inches", //done
		printReferences: true //done
	});

	const mulUnitData = new Map(
		(await Promise.allSettled(listData.units.map(async (u) => getMULDataFromId(u.mulId)))).filter((u) => u.status == "fulfilled").map((u) => [u.value!.mulId, u.value!])
	);

	const ammoReferenceList = (
		await Promise.allSettled(
			listData.units
				.flatMap((u) => u.customization?.ammo)
				.filter((v) => v != undefined)
				.map(async (v) => getAmmoByName(v))
		)
	)
		.filter((r) => r.status == "fulfilled")
		.map((r) => `${r.value!.name} (${r.value!.page})`);

	const unitImages = new Map(
		(await Promise.allSettled(mulUnitData.values().map(async (u) => getMulImage({ mulId: u.mulId, unitImageLink: u.imageLink ?? "" }))))
			.filter((r) => r.status == "fulfilled")
			.map((r) => [r.value.mulId, r.value.image ?? ""])
	);

	const unitCardImages = new Map(
		(await Promise.allSettled(listData.units.map(async (u) => getMulCard({ mulId: u.mulId, skill: u.skill }))))
			.filter((r) => r.status == "fulfilled")
			.map((r) => [r.value.mulId, r.value.image ?? ""])
	);
</script>

<main>
	<div>
		<button
			onclick={() => {
				printList({ listData, printOptions })
					.then((pdf) => {
						const blob = new Blob([new Uint8Array(pdf)], { type: "application/pdf" });
						const downloadElement = document.createElement("a");
						downloadElement.download = listData.name;
						downloadElement.href = URL.createObjectURL(blob);
						downloadElement.click();
						toastController.addToast("PDF Generation Complete");
					})
					.catch((r) => toastController.addToast("PDF failed to generate"));
			}}>Print to Playwright</button
		>
	</div>
	<form {...parseTest} enctype="multipart/form-data">
		<input type="file" name="list" />
		<button>Parse</button>
	</form>
	<ListTemplate {listData} {printOptions} {mulUnitData} {ammoReferenceList} {unitImages} {unitCardImages} />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
</style>
