import type { TFontDictionary } from "pdfmake/interfaces";
import PdfPrinter from "pdfmake";

const fonts: TFontDictionary = {
	Helvetica: {
		normal: "Helvetica",
		bold: "Helvetica-Bold",
		italics: "Helvetica-Oblique",
		bolditalics: "Helvetica-BoldOblique"
	},
	NotoSansSymbols: {
		normal: "./files/fonts/NotoSansSymbols/NotoSansSymbols-Regular.ttf",
		bold: "./files/fonts/NotoSansSymbols/NotoSansSymbols-Bold.ttf"
	},
	NotoSansSymbols2: {
		normal: "./files/fonts/NotoSansSymbols2/NotoSansSymbols2-Regular.ttf"
	}
};

export const printer = new PdfPrinter(fonts);
