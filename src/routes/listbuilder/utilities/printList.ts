import type { TFontDictionary, TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import PdfPrinter from "pdfmake";
import BlobStream, { type IBlobStream } from "blob-stream";
import { isUnit, type Unit } from "$lib/types/unit"
import { eras, factions } from "$lib/data/erasFactionLookup";
import type { Formation } from "$lib/types/formation.svelte";
import references from "$lib/data/reference.json"
import { existsSync } from "fs";
import fs from "fs/promises"

type PrintableList = {
    units: Unit[];
    playername: string;
    listname: string;
    era: number;
    faction: number;
    general: number;
    style: "mul" | "detailed"
}
const fonts: TFontDictionary = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};
const printer = new PdfPrinter(fonts);

function createUnitLine(unit: Unit, listStyle: string, indent: boolean) {
    let unitLine: TableCell[] = []
    const style = indent ? "cellIndented" : "cell"
    if (listStyle == "mul") {
        unitLine = [
            { text: unit.name, style: style },
            { text: unit.subtype, style: "cellCentered" },
            { text: unit.skill?.toString() ?? "-", style: "cellCentered" },
            { text: `${unit.cost} (${Math.round(unit.cost / 2)})`, style: "cellCentered" }
        ]
    } else {
        let moveString = "-";
        if (unit.move) {
            moveString = "";
            for (const movement of unit.move!) {
                moveString += `${movement.speed}"${movement.type}/`;
            }
            moveString = moveString.replace(/\/$/gm, "")
        }
        let damageString = unit.damageS == undefined ? "-" : `${unit.damageS}${unit.damageSMin ? "*" : ""}/${unit.damageM}${unit.damageMMin ? "*" : ""}/${unit.damageL}${unit.damageLMin ? "*" : ""}`;
        let healthString = unit.health == undefined ? "-" : `${unit.health} (${unit.armor}a+${unit.structure}s)`
        unitLine = [
            { text: unit.name, style: style },
            { text: unit.subtype, style: "cellCentered" },
            { text: moveString, style: "cellCentered" },
            { text: damageString, style: "cellCentered" },
            { text: healthString, style: "cellCentered" },
            { text: unit.skill?.toString() ?? "-", style: "cellCentered" },
            { text: `${unit.cost} (${Math.round(unit.cost / 2)})`, style: "cellCentered" }
        ]
    }
    return unitLine;
}

function createUnitTable(listStyle: string, units: (Unit | Formation)[], drawFormations: boolean): TableCell[][] {
    let unitTable: TableCell[][] = []
    let unitCount = 0;
    let totalPV = 0;
    const headerLength = listStyle == "mul" ? 4 : 7;
    for (const unit of units) {
        if (isUnit(unit)) {
            unitCount++;
            totalPV += unit.cost;
            unitTable.push(createUnitLine(unit, listStyle, false))
        } else {
            let indent = false;
            if (drawFormations) {
                indent = true;
                let formationPV = 0;
                const formationUnitLines = []
                for (const item of unit.units) {
                    formationPV += item.cost;
                    formationUnitLines.push(createUnitLine(item, listStyle, true))
                }
                unitTable.push([{ text: `${unit.name} - ${unit.type} formation - ${unit.units.length} Units - ${formationPV} PV`, colSpan: headerLength, style: "formationHeader" }, ...Array(headerLength - 1).fill("")]);
                unitTable = unitTable.concat(formationUnitLines);
            }
        }
    }
    unitTable.push([{ text: `${unitCount} Units`, colSpan: headerLength - 1, style: "cellHeader" }, ...Array(headerLength - 2).fill(""), { text: totalPV, style: "cellHeaderCentered" }]);
    return unitTable
}

function createReferenceList(units: (Unit | Formation)[]) {
    const includedReferences = new Set()
    for (const item of units) {
        if (isUnit(item)) {
            references.forEach((reference) => {
                if (item.abilities.includes(reference.ability)) {
                    includedReferences.add(reference)
                }
            });
        } else {
            for (const unit of item.units) {
                references.forEach((reference) => {
                    if (unit.abilities.includes(reference.ability)) {
                        includedReferences.add(reference)
                    }
                });
            }
        }
    }
    const referenceLines = [...includedReferences].map((reference: any) => { return `${reference.ability} (${reference.name}, pg.${reference.page})` }).sort().map((reference: any) => { return { text: reference, style: "listItem" } })

    return referenceLines

}

async function loadUnitCard(mulId: number, skill?: number): Promise<string> {
    return new Promise(async (resolve) => {
        if (mulId < 0) {
            resolve(`./files/cached-cards/customCardImages/${mulId}.png`)
        } else {
            if (existsSync(`./files/cached-cards/${mulId}-${skill}.png`)) {
                resolve(`./files/cached-cards/${mulId}-${skill}.png`)
            } else {
                try {
                    const url = `https://masterunitlist.azurewebsites.net/Unit/Card/${mulId}?skill=${skill}`;
                    const response = await (await fetch(url)).arrayBuffer()
                    await fs.writeFile(`./files/cached-cards/${mulId}-${skill}.png`, new Uint8Array(response))
                    resolve(`./files/cached-cards/${mulId}-${skill}.png`)
                } catch (error) {
                    console.log(error)
                }
            }
        }
    })

}

async function loadUnitImages(units: (Unit | Formation)[]) {
    const promises = []
    for (const item of units) {
        if (isUnit(item)) {
            promises.push(loadUnitCard(item.mulId, item.skill))
        } else {
            for (const unit of item.units) {
                promises.push(loadUnitCard(unit.mulId, unit.skill))
            }
        }
    }
    const results = await Promise.all(promises);
    const unitCards = []
    for (const path of results) {
        unitCards.push({ image: path, width: 250 })
    }
    return unitCards
}

export async function makePDF(list: PrintableList, drawFormations: boolean): Promise<Blob> {
    const listDetails = eras.get(list.era) + " Era - " + factions.get(list.faction) + " with " + factions.get(list.general) + " general list";
    const tableheaders: TableCell[] = list.style == "mul" ?
        [{ text: "Unit", style: "cellHeader" }].concat(["Type", "Skill", "PV"].map((header) => { return { text: header, style: "cellHeaderCentered" } })) :
        [{ text: "Unit", style: "cellHeader" }].concat(["Type", "Move", "Damage", "Health", "Skill", "PV"].map((header) => { return { text: header, style: "cellHeaderCentered" } }));
    const tableWidths = list.style == "mul" ? ["*", "auto", "auto", "auto"] : ["*", "auto", "auto", "auto", "auto", "auto", "auto"];
    const unitTable = createUnitTable(list.style, list.units, drawFormations);
    const abilityReferences = createReferenceList(list.units);
    const unitCards = await loadUnitImages(list.units);

    const dd: TDocumentDefinitions = {
        pageSize: "LETTER",
        pageMargins: 20,
        content: [
            {
                columns: [
                    { text: list.listname, style: "header" },
                    { text: list.playername, style: "player" }],
                columnGap: 10
            },
            { text: listDetails, style: "details" },
            {
                table: {
                    headerRows: 1,
                    widths: tableWidths,
                    body: [
                        tableheaders, ...unitTable
                    ]
                }
            },
            { text: "Ability references:", style: "subheader" },
            {
                columns: [
                    { ul: abilityReferences.slice(0, Math.ceil(abilityReferences.length / 2)) },
                    { ul: abilityReferences.slice(Math.ceil(abilityReferences.length / 2)) }
                ],
                pageBreak: "after"
            },
            {
                columns: [
                    unitCards.filter((v, i) => { return i % 8 < 4 }),
                    unitCards.filter((v, i) => { return i % 8 >= 4 })
                ],
                columnGap: 10
            }
        ],
        footer: {
            columns: [
                { text: "https://Terminal.tools/listbuilder", fontSize: 8, margin: [25, 0, 0, 25] }
            ]
        },
        defaultStyle: {
            font: "Helvetica",
            fontSize: 8,
        },
        styles: {
            header: {
                fontSize: 16,
                bold: true,
                margin: [4, 0, 0, 10]
            },
            subheader: {
                fontSize: 12,
                bold: true,
                margin: [0, 10, 0, 6]
            },
            player: {
                fontSize: 12,
                margin: [0, 0, 10, 10],
                alignment: "right"
            },
            details: {
                margin: [16, 0, 0, 6]
            },
            cellHeader: {
                margin: [0, 1, 0, 0],
                fillColor: "#AAAAAA",
                bold: true
            },
            cellHeaderCentered: {
                margin: [0, 1, 0, 0],
                fillColor: "#AAAAAA",
                alignment: "center",
                bold: true
            },
            cell: {
                margin: [2, 1, 0, 0],
            },
            cellIndented: {
                margin: [12, 1, 0, 0],
            },
            cellCentered: {
                margin: [2, 1, 0, 0],
                alignment: "center"
            },
            formationHeader: {
                margin: [2, 1, 0, 0],
                fillColor: "#e6e6e6"
            },
            listItem: {
                margin: [0, 2]
            }
        }
    }

    return new Promise((resolve, reject) => {
        const pdfDoc = printer.createPdfKitDocument(dd);
        pdfDoc.pipe(BlobStream())
            .on("finish", function (this: IBlobStream) {
                resolve(this.toBlob("application/pdf"));
            })
            .on("error", (err) => {
                console.error("err", err)
                reject(err)
            })
        pdfDoc.end();
    })
}