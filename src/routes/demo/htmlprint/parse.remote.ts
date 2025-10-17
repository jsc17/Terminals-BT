import { form } from "$app/server";
import { getDocument } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import * as v from "valibot";

export const parseTest = form(v.object({ list: v.file() }), async (data) => {
	const buffer = await data.list.arrayBuffer();
	const pdf = await getDocument(buffer).promise;
	const metadata = (await pdf.getMetadata()).info;
	const page = await pdf.getPage(1);
	const content = await page.getTextContent();

	console.log(
		content.items.slice(
			16,
			content.items.findIndex((i) => /^\d+ Units$/.test((i as TextItem).str))
		)
	);
});
