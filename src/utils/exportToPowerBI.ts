import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { Workbook } from "exceljs";interface AnalysisData {
    id: number;
    tabloAdi: string;
    kalemId: number | null;
    kalemParentId: number | null;
    parentId: number | null;
    adi: string;
    kebirKodu: number | null;
    tutarCariDonem: number;
    tutarOncekiDonem: number;
    mutlak: number;
    yuzde: number;
    reel: number;
}

interface ExportOptions {
    kalemData: AnalysisData[];
    hesapData: AnalysisData[];
    kalemData2: AnalysisData[];
    hesapData2: AnalysisData[];
    title: string;
    title2: string;
    year: number;
    companyName?: string;
}

/**
 * Formats a number to Turkish locale with 2 decimal places
 */
const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num);
};

/**
 * Creates an Excel worksheet with hierarchical data
 */
const createWorksheet = (
    workbook: Workbook,
    sheetName: string,
    title: string,
    year: number,
    kalemData: AnalysisData[],
    hesapData: AnalysisData[]
) => {
    const worksheet = workbook.addWorksheet(sheetName);

    // Set column widths
    worksheet.columns = [
        { width: 50 }, // Adi
        { width: 18 }, // Önceki Dönem
        { width: 18 }, // Cari Dönem
        { width: 18 }, // Mutlak
        { width: 15 }, // Yüzde
        { width: 15 }, // Reel
    ];

    // Add header row
    const headerRow = worksheet.addRow([
        title,
        year - 1,
        year,
        "Mutlak",
        "Yüzde",
        "Reel",
    ]);

    // Style header row
    headerRow.font = { bold: true, size: 12, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF253662" }, // Dark blue
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;

    // Add data rows recursively
    const addRows = (
        rows: AnalysisData[],
        kalemId: number | null,
        level: number = 0
    ) => {
        rows
            .filter((row) => row.kalemParentId === kalemId)
            .forEach((row) => {
                const hasChildren = rows.some((r) => r.kalemParentId === row.kalemId);
                const hasGrandchildren = rows.some(
                    (r) =>
                        hasChildren &&
                        rows.some((child) => child.kalemParentId === row.kalemId) &&
                        r.kalemParentId === row.kalemId
                );

                // Add kalem row
                const dataRow = worksheet.addRow([
                    "  ".repeat(level) + row.adi,
                    row.tutarOncekiDonem,
                    row.tutarCariDonem,
                    row.mutlak,
                    row.yuzde / 100, // Convert to percentage
                    row.reel / 100, // Convert to percentage
                ]);

                // Apply formatting based on hierarchy
                let bgColor = "FFCCCCCC"; // Default gray
                let fontColor = "FF000000"; // Black
                let isBold = false;

                if (hasGrandchildren) {
                    bgColor = "FF253662"; // Dark blue
                    fontColor = "FFFFFFFF"; // White
                    isBold = true;
                } else if (hasChildren) {
                    bgColor = "FFD35400"; // Orange
                    fontColor = "FFFFFFFF"; // White
                    isBold = true;
                } else if (
                    row.adi.includes("Toplam") ||
                    row.adi.includes("Kar") ||
                    row.adi.includes("Zarar")
                ) {
                    bgColor = "FF253662"; // Dark blue
                    fontColor = "FFFFFFFF"; // White
                    isBold = true;
                }

                dataRow.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: bgColor },
                };
                dataRow.font = { bold: isBold, color: { argb: fontColor } };

                // Format numeric cells
                dataRow.getCell(2).numFmt = "#,##0.00";
                dataRow.getCell(3).numFmt = "#,##0.00";
                dataRow.getCell(4).numFmt = "#,##0.00";
                dataRow.getCell(5).numFmt = "0.00%";
                dataRow.getCell(6).numFmt = "0.00%";

                dataRow.alignment = { vertical: "middle" };
                dataRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
                for (let i = 2; i <= 6; i++) {
                    dataRow.getCell(i).alignment = { horizontal: "right", vertical: "middle" };
                }


                // Recursively add child rows
                addRows(rows, row.kalemId || 0, level + 1);
            });
    };

    // Start from top-level items
    addRows(kalemData, kalemData[0]?.kalemId || null);

    return worksheet;
};

/**
 * Exports Karşılaştırmalı Analiz data to Excel
 */
export const exportKarsilastirmaliAnalizToExcel = async (
    options: ExportOptions
): Promise<Blob> => {
    const {
        kalemData,
        hesapData,
        kalemData2,
        hesapData2,
        title,
        title2,
        year,
        companyName,
    } = options;

    const { default: ExcelJS } = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "FAS WebUI";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Create first worksheet (Finansal Durum)
    if (kalemData.length > 0) {
        createWorksheet(workbook, "Finansal Durum", title, year, kalemData, hesapData);
    }

    // Create second worksheet (Kar/Zarar)
    if (kalemData2.length > 0) {
        createWorksheet(workbook, "Kar Zarar", title2, year, kalemData2, hesapData2);
    }

    // Generate Excel file as blob
    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
};

/**
 * Creates a PowerBI package (ZIP) containing Excel data and template
 */
export const createPowerBIPackage = async (
    excelBlob: Blob,
    year: number,
    companyName?: string
): Promise<Blob> => {
    const zip = new JSZip();

    // Add Excel file to ZIP
    const excelFileName = `Karsilastirmali_Analiz_${year}_Veri.xlsx`;
    zip.file(excelFileName, excelBlob);

    // Add PowerBI template guide (README)
    const readmeContent = `# Karşılaştırmalı Analiz - PowerBI Paketi

## İçerik
- ${excelFileName}: Karşılaştırmalı Analiz verileri
- README.txt: Bu dosya

## PowerBI ile Kullanım Talimatları

### Adım 1: Excel Verisini Power BI'a Aktarma
1. Power BI Desktop'ı açın
2. "Get Data" > "Excel" seçeneğini tıklayın
3. "${excelFileName}" dosyasını seçin
4. "Finansal Durum" ve "Kar Zarar" tablolarını seçin
5. "Load" butonuna tıklayın

### Adım 2: Görselleştirme Oluşturma

#### Finansal Durum Tablosu İçin:
1. Yeni bir sayfa oluşturun (Page 1)
2. "Table" görselleştirmesi ekleyin
3. Tüm kolonları tabloya sürükleyin
4. "Clustered Column Chart" ekleyin:
   - X-Axis: Adi (ilk 10 satır için filter uygulayın)
   - Y-Axis: Cari Dönem, Önceki Dönem
5. "Line Chart" ekleyin:
   - X-Axis: Adi
   - Y-Axis: Mutlak

#### Kar/Zarar Tablosu İçin:
1. Yeni bir sayfa oluşturun (Page 2)
2. "Table" görselleştirmesi ekleyin
3. Tüm kolonları tabloya sürükleyin
4. "Waterfall Chart" ekleyin:
   - Category: Adi
   - Y-Axis: Mutlak
5. "Gauge" ekleyin:
   - Value: Yüzde

### Adım 3: DAX Measures (Opsiyonel)

Power BI'da "New Measure" ile aşağıdaki formülleri ekleyebilirsiniz:

\`\`\`
Değişim Oranı = 
    DIVIDE(
        SUM('Finansal Durum'[Mutlak]),
        SUM('Finansal Durum'[Önceki Dönem])
    )

Ortalama Değişim = 
    AVERAGE('Finansal Durum'[Yüzde])
\`\`\`

### Adım 4: Raporun Kaydedilmesi
1. File > Save
2. .pbix formatında kaydedin
3. Power BI Service'e yüklemek isterseniz "Publish" butonunu kullanın

## Notlar
- Bu veriler ${year} yılı için oluşturulmuştur${companyName ? ` (${companyName})` : ""}
- Veriler otomatik olarak FAS WebUI'dan export edilmiştir
- Daha fazla bilgi için: [PowerBI Documentation](https://docs.microsoft.com/power-bi/)

Generated on: ${new Date().toLocaleString("tr-TR")}
`;

    zip.file("README.txt", readmeContent);

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: "blob" });
    return zipBlob;
};

/**
 * Main export function - downloads PowerBI package
 */
export const downloadPowerBIExport = async (
    options: ExportOptions
): Promise<void> => {
    try {
        // Create Excel file
        const excelBlob = await exportKarsilastirmaliAnalizToExcel(options);

        // Create PowerBI package (ZIP)
        const zipBlob = await createPowerBIPackage(
            excelBlob,
            options.year,
            options.companyName
        );

        // Download the ZIP file
        const fileName = `Karsilastirmali_Analiz_PowerBI_${options.year}_${new Date().getTime()}.zip`;
        saveAs(zipBlob, fileName);
    } catch (error) {
        console.log("PowerBI export error:", error);
        throw error;
    }
};


