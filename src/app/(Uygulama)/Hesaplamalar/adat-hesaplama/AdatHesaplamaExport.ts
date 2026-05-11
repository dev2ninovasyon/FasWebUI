import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";

export interface AdatExportDetail {
  yevmiyeTarih?: string;
  borc: number;
  alacak: number;
  balance: number;
  makulBakiye: number;
  kalanBakiye: number;
  gecenGunSayisi: number;
  faizOrani: number;
  faizTutari: number;
  dovizKuru: number;
}

export interface AdatExportSection {
  hesapAdi: string;
  kebirKodu?: number;
  baslangicTarihi: string;
  bitisTarihi: string;
  toplamBorc: number;
  toplamAlacak: number;
  toplamFaizTutari: number;
  ortalamaFaizOrani: number;
  details: AdatExportDetail[];
}

export interface AdatExportMeta {
  hazirlayan?: string;
  onaylayan?: string;
  yil: number;
  denetlenen?: string;
}

const COLS = [
  "TARİH",
  "BORÇ TUTARI",
  "ALACAK TUTARI",
  "BAKİYE",
  "MAKUL BAKİYE",
  "KALAN BAKİYE",
  "GÜN",
  "FAİZ %",
  "ADAT FAİZ",
  "DÖVİZ KURU",
];

function fmtNum(v: number | undefined, decimals = 2): string {
  return (v ?? 0).toLocaleString("tr-TR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtDate(s?: string): string {
  if (!s) return "-";
  return new Date(s).toLocaleDateString("tr-TR");
}

function detailRow(d: AdatExportDetail): string[] {
  return [
    fmtDate(d.yevmiyeTarih),
    fmtNum(d.borc),
    fmtNum(d.alacak),
    fmtNum(d.balance),
    fmtNum(d.makulBakiye),
    fmtNum(d.kalanBakiye),
    String(d.gecenGunSayisi ?? 0),
    `%${fmtNum(d.faizOrani)}`,
    fmtNum(d.faizTutari),
    (d.dovizKuru ?? 1) === 1 ? "-" : fmtNum(d.dovizKuru, 4),
  ];
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

export function exportAdatToPdf(sections: AdatExportSection[], meta: AdatExportMeta) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.addFont("https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.36/fonts/Roboto/Roboto-Regular.ttf", "Roboto", "normal");

  const headerBlue: [number, number, number] = [0, 120, 215];
  const lightGray: [number, number, number] = [245, 245, 245];
  const pageW = doc.internal.pageSize.getWidth();

  let isFirst = true;

  for (const section of sections) {
    if (!isFirst) doc.addPage();
    isFirst = false;

    // Başlık
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text("ADAT HESAPLAMA TABLOSU", pageW / 2, 14, { align: "center" });

    doc.setFontSize(9);
    doc.text(`Hesap: ${section.hesapAdi}`, 14, 22);
    doc.text(`Dönem: ${fmtDate(section.baslangicTarihi)} - ${fmtDate(section.bitisTarihi)}`, 14, 27);
    doc.text(`Yıl: ${meta.yil}`, pageW - 50, 22);
    if (meta.denetlenen) doc.text(`Denetlenen: ${meta.denetlenen}`, pageW - 100, 27);

    // Özet
    const summaryY = 33;
    doc.setFontSize(8);
    doc.text(`Toplam Borç: ${fmtNum(section.toplamBorc)}`, 14, summaryY);
    doc.text(`Toplam Alacak: ${fmtNum(section.toplamAlacak)}`, 70, summaryY);
    doc.text(`Toplam Adat Faiz: ${fmtNum(section.toplamFaizTutari)}`, 140, summaryY);
    doc.text(`Ort. Faiz: %${fmtNum(section.ortalamaFaizOrani)}`, 220, summaryY);

    // Tablo
    autoTable(doc, {
      startY: summaryY + 4,
      head: [COLS],
      body: section.details.map(detailRow),
      styles: { fontSize: 7, cellPadding: 1.5, overflow: "linebreak" },
      headStyles: { fillColor: headerBlue, textColor: 255, fontStyle: "bold", halign: "center" },
      alternateRowStyles: { fillColor: lightGray },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { halign: "right" },
        5: { halign: "right" },
        6: { halign: "center", cellWidth: 12 },
        7: { halign: "center", cellWidth: 14 },
        8: { halign: "right" },
        9: { halign: "right", cellWidth: 18 },
      },
      margin: { left: 10, right: 10 },
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    doc.setFontSize(7);
    doc.setTextColor(120);
    const footerY = doc.internal.pageSize.getHeight() - 6;
    if (meta.hazirlayan) doc.text(`Hazırlayan: ${meta.hazirlayan}`, 14, footerY);
    if (meta.onaylayan) doc.text(`Onaylayan: ${meta.onaylayan}`, 100, footerY);
    doc.text(`Sayfa ${pageCount}`, pageW - 20, footerY);
  }

  doc.save(`Adat_Hesaplama_${meta.yil}.pdf`);
}

// ─── WORD ────────────────────────────────────────────────────────────────────

function makeWordTableRow(cells: string[], isHeader = false): TableRow {
  return new TableRow({
    children: cells.map(
      (text) =>
        new TableCell({
          shading: isHeader ? { type: ShadingType.SOLID, color: "0078D7" } : undefined,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text,
                  bold: isHeader,
                  color: isHeader ? "FFFFFF" : "000000",
                  size: 16,
                }),
              ],
            }),
          ],
          width: { size: 10, type: WidthType.PERCENTAGE },
        })
    ),
  });
}

export async function exportAdatToWord(sections: AdatExportSection[], meta: AdatExportMeta) {
  const children: (Paragraph | Table)[] = [];

  children.push(
    new Paragraph({
      text: "ADAT HESAPLAMA TABLOSU",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
    })
  );

  if (meta.denetlenen) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: `Denetlenen: ${meta.denetlenen} | Yıl: ${meta.yil}`, size: 20 })],
      })
    );
  }

  children.push(new Paragraph({ text: "" }));

  for (const section of sections) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: section.hesapAdi, bold: true })],
      })
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Dönem: ${fmtDate(section.baslangicTarihi)} - ${fmtDate(section.bitisTarihi)}   `, size: 18 }),
          new TextRun({ text: `Toplam Borç: ${fmtNum(section.toplamBorc)}   `, size: 18 }),
          new TextRun({ text: `Toplam Alacak: ${fmtNum(section.toplamAlacak)}   `, size: 18 }),
          new TextRun({ text: `Toplam Adat Faiz: ${fmtNum(section.toplamFaizTutari)}   `, size: 18 }),
          new TextRun({ text: `Ort. Faiz: %${fmtNum(section.ortalamaFaizOrani)}`, size: 18 }),
        ],
      })
    );

    const tableRows: TableRow[] = [
      makeWordTableRow(COLS, true),
      ...section.details.map((d) => makeWordTableRow(detailRow(d))),
    ];

    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
        },
        rows: tableRows,
      })
    );

    children.push(new Paragraph({ text: "" }));
  }

  // Hazırlayan / Onaylayan
  if (meta.hazirlayan || meta.onaylayan) {
    children.push(new Paragraph({ text: "" }));
    children.push(
      new Paragraph({
        children: [
          ...(meta.hazirlayan ? [new TextRun({ text: `Hazırlayan: ${meta.hazirlayan}`, size: 18 }), new TextRun({ text: "          " })] : []),
          ...(meta.onaylayan ? [new TextRun({ text: `Onaylayan: ${meta.onaylayan}`, size: 18 })] : []),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Adat_Hesaplama_${meta.yil}.docx`);
}
