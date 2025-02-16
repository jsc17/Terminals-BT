import type { TFontDictionary, TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import PdfPrinter from "pdfmake";

const fonts: TFontDictionary = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
};

export const printer = new PdfPrinter(fonts);