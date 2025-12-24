import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType, TextRun, PageBreak, VerticalAlign, Header, Footer, ImageRun } from "docx";
import { saveAs } from "file-saver";
import { KysRiskMatrisi, RiskMatrixData } from "@/api/Kys/KysRiskMatrisi";
import { riskMatrixSections, documentMapping } from "@/api/Kys/KysRiskMatrixConstants";

export const exportRiskMatrixToWord = async (data: KysRiskMatrisi[], relatedDocs: Record<string, any>, companyName: string, year: number) => {

    const colorToHex = (color?: string): string | undefined => {
        if (!color) return undefined;
        let c = color.trim().toLowerCase();
        if (c === "transparent" || c.startsWith("rgba(0,0,0,0)") || c.startsWith("rgba(0, 0, 0, 0)")) return undefined;
        if (c.startsWith("#")) return c.replace("#", "").toUpperCase();
        if (c.startsWith("rgb")) {
            const matches = c.match(/\d+/g);
            if (matches && matches.length >= 3) {
                return matches.slice(0, 3).map(x => {
                    const hex = parseInt(x).toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                }).join("").toUpperCase();
            }
        }
        // If it's a 3 or 6 digit hex without #
        if (/^[0-9A-F]{3}$/i.test(c) || /^[0-9A-F]{6}$/i.test(c)) return c.toUpperCase();
        return undefined;
    };

    // Improved recursive DOM-based HTML to docx component mapper
    const parseHtmlToElements = (html: string, initialStyle: any = { size: 20 }): (Paragraph | Table)[] => {
        if (!html) return [];

        const cleanHtml = html.replace(/&nbsp;/g, ' ').trim();
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanHtml, "text/html");
        const body = doc.body;

        const elements: (Paragraph | Table)[] = [];

        interface StyleContext {
            bold?: boolean;
            italics?: boolean;
            underline?: boolean;
            color?: string;
            size?: number;
        }

        const processNode = (
            node: Node,
            currentRuns: TextRun[] = [],
            listLevel: number = -1,
            style: StyleContext = initialStyle
        ): (Paragraph | Table | null)[] => {
            const results: (Paragraph | Table | null)[] = [];

            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || "";
                if (text.trim() || text === " ") {
                    currentRuns.push(new TextRun({
                        text,
                        size: style.size,
                        bold: style.bold,
                        italics: style.italics,
                        underline: style.underline ? {} : undefined,
                        color: style.color
                    }));
                }
                return [];
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const tagName = element.tagName.toLowerCase();

                // Handle inline formatting
                const isInline = ["b", "strong", "i", "em", "u", "span", "a", "font"].includes(tagName);

                if (isInline) {
                    const newStyle = { ...style };
                    if (tagName === "b" || tagName === "strong") newStyle.bold = true;
                    if (tagName === "i" || tagName === "em") newStyle.italics = true;
                    if (tagName === "u") newStyle.underline = true;
                    if (tagName === "a") {
                        newStyle.color = colorToHex("0563C1");
                        newStyle.underline = true;
                    }

                    // Extract Inline Styles
                    if (element.style.color) {
                        const hex = colorToHex(element.style.color);
                        if (hex) newStyle.color = hex;
                    }
                    if (element.style.fontWeight === "bold") newStyle.bold = true;
                    if (element.style.fontStyle === "italic") newStyle.italics = true;
                    if (element.style.textDecoration === "underline") newStyle.underline = true;

                    element.childNodes.forEach(child => {
                        processNode(child, currentRuns, listLevel, newStyle);
                    });
                    return [];
                }

                // Handle Block elements
                if (["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li", "br"].includes(tagName)) {
                    if (tagName === "br") {
                        currentRuns.push(new TextRun({ text: "", break: 1 }));
                        return [];
                    }

                    const blockRuns: TextRun[] = [];
                    element.childNodes.forEach(child => {
                        const childResults = processNode(child, blockRuns, listLevel, style);
                        results.push(...childResults);
                    });

                    if (blockRuns.length > 0 || tagName === "li") {
                        const pOptions: any = {
                            children: blockRuns,
                            spacing: { before: 120, after: 120, line: 360 }, // 1.5 line spacing
                        };

                        if (tagName.startsWith("h")) {
                            const level = parseInt(tagName.substring(1));
                            pOptions.heading = HeadingLevel[`HEADING_${level}` as keyof typeof HeadingLevel] || HeadingLevel.HEADING_1;
                        }

                        if (tagName === "li") {
                            pOptions.bullet = { level: Math.max(0, listLevel) };
                            pOptions.spacing = { before: 40, after: 40 };
                        }

                        results.push(new Paragraph(pOptions));
                    }
                    return results;
                }

                // Handle Lists
                if (tagName === "ul" || tagName === "ol") {
                    element.childNodes.forEach(child => {
                        results.push(...processNode(child, [], listLevel + 1, style));
                    });
                    return results;
                }

                // Handle Tables
                if (tagName === "table") {
                    const rows: TableRow[] = [];
                    element.querySelectorAll("tr").forEach(tr => {
                        const cells: TableCell[] = [];
                        const trChildren = Array.from(tr.childNodes).filter(n => n.nodeName.toLowerCase() === "td" || n.nodeName.toLowerCase() === "th");

                        trChildren.forEach((child, childIndex) => {
                            const td = child as HTMLElement;
                            const isHeader = td.tagName.toLowerCase() === "th";

                            // Extract cell styles to pass down
                            const cellStyle: any = { ...style };
                            if (td.style.color) {
                                const hex = colorToHex(td.style.color);
                                if (hex) cellStyle.color = hex;
                            }
                            if (td.style.fontWeight === "bold" || isHeader) cellStyle.bold = true;

                            const cellShading = isHeader ? "F2F2F2" : colorToHex(td.style.backgroundColor);

                            // Contrast safety: if background is dark and no color set, use white
                            if (cellShading && !cellStyle.color) {
                                // Simple check for perceived darkness
                                const r = parseInt(cellShading.substring(0, 2), 16);
                                const g = parseInt(cellShading.substring(2, 4), 16);
                                const b = parseInt(cellShading.substring(4, 6), 16);
                                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                                if (brightness < 128) cellStyle.color = "FFFFFF";
                            }

                            if (td.style.fontSize) {
                                const sizeMatch = td.style.fontSize.match(/\d+/);
                                if (sizeMatch) cellStyle.size = parseInt(sizeMatch[0]) * 2;
                            }

                            const cellElements = parseHtmlToElements(td.innerHTML, cellStyle);

                            // Check if cell is effectively empty to avoid "blue blocks"
                            const isEmpty = td.innerText.trim() === "" && td.querySelectorAll("img, table").length === 0;
                            const finalShading = (isEmpty && !isHeader) ? undefined : (cellShading ? { fill: cellShading } : undefined);

                            // Width Detection & Sidebar Detection
                            let colWidth: number | string = 100 / trChildren.length;
                            const wAttr = td.getAttribute("width") || td.style.width;

                            if (wAttr) {
                                if (wAttr.endsWith("%")) {
                                    colWidth = parseInt(wAttr);
                                } else {
                                    // Handle px, pt, or raw numeric values
                                    const val = parseInt(wAttr.replace(/[^\d]/g, ""));
                                    if (!isNaN(val)) {
                                        // Simple heuristic: if val > 100, treat as pixels and map to a scale
                                        // docx likes 1/1440 of an inch (twips) for fixed, but since we use WidthType.PERCENTAGE, 
                                        // we'll try to guess percentage if possible.
                                        if (val < 100) colWidth = val;
                                        else colWidth = (val / 800) * 100; // Assume 800px base
                                    }
                                }
                            } else {
                                // Fallback to our balanced distribution
                                if (trChildren.length === 2) {
                                    // Sidebar detection: if first column is shaded and has little text, make it narrow
                                    const textLength = td.innerText.trim().length;
                                    if (childIndex === 0 && cellShading && textLength < 50) {
                                        colWidth = 15;
                                    } else if (childIndex === 1 && trChildren[0] instanceof HTMLElement && colorToHex((trChildren[0] as HTMLElement).style.backgroundColor) && (trChildren[0] as HTMLElement).innerText.trim().length < 50) {
                                        colWidth = 85;
                                    } else {
                                        colWidth = childIndex === 0 ? 25 : 75;
                                    }
                                } else if (trChildren.length === 3) {
                                    colWidth = childIndex === 0 ? 10 : 45;
                                }
                            }

                            // Colspan Support
                            const colSpan = parseInt(td.getAttribute("colspan") || "1");

                            cells.push(new TableCell({
                                children: cellElements.length > 0 ? cellElements : [new Paragraph("")],
                                width: { size: colWidth as number, type: WidthType.PERCENTAGE },
                                shading: finalShading,
                                verticalAlign: VerticalAlign.CENTER,
                                margins: { top: 100, bottom: 100, left: 100, right: 100 },
                                columnSpan: colSpan > 1 ? colSpan : undefined
                            }));
                        });
                        if (cells.length > 0) rows.push(new TableRow({ children: cells }));
                    });

                    if (rows.length > 0) {
                        results.push(new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: rows,
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" },
                                bottom: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" },
                                left: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" },
                                right: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" },
                                insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D9D9D9" },
                                insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "D9D9D9" },
                            }
                        }));
                    }
                    return results;
                }

                // Default fallback
                element.childNodes.forEach(child => {
                    results.push(...processNode(child, currentRuns, listLevel, style));
                });
            }

            return results;
        };

        body.childNodes.forEach(node => {
            const nodeResults = processNode(node);
            nodeResults.forEach(res => {
                if (res instanceof Paragraph || res instanceof Table) {
                    elements.push(res);
                }
            });
        });

        return elements;
    };

    const docElements: any[] = [];

    // 1. COVER PAGE
    docElements.push(new Paragraph({
        children: [new TextRun({ text: "KYS RİSK MATRİSİ VE ANALİZ RAPORU", bold: true, color: "1F4E78", size: 44 })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 3000, after: 1000 },
    }));

    docElements.push(new Paragraph({
        children: [
            new TextRun({ text: companyName.toUpperCase(), bold: true, color: "2E75B6", size: 32 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
    }));

    docElements.push(new Paragraph({
        children: [
            new TextRun({ text: `${year} DENETİM DÖNEMİ`, color: "7F7F7F", size: 26 }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 4000 },
    }));

    docElements.push(new Paragraph({
        children: [
            new TextRun({ text: "Gizli ve Kişiye Özel", italics: true, color: "C00000", size: 18 }),
        ],
        alignment: AlignmentType.CENTER,
    }));

    docElements.push(new Paragraph({ children: [new PageBreak()] }));

    // 2. FOREWORD (ÖNSÖZ)
    docElements.push(new Paragraph({
        children: [new TextRun({ text: "1. ÖNSÖZ", bold: true, color: "1F4E78", size: 32 })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 300 },
    }));

    docElements.push(new Paragraph({
        children: [new TextRun({ text: "KYS Risk Matrisinin Amacı", bold: true, color: "2E75B6", size: 22 })],
        spacing: { before: 200, after: 120 },
    }));

    docElements.push(new Paragraph({
        children: [new TextRun({
            text: "Bu rapor, Kalite Yönetim Sistemi (KYS) standartları gereğince hazırlanan risk analizlerini içermektedir. Raporun temel amacı, denetim süreçlerinde karşılaşılabilecek olası riskleri önceden belirlemek, bu risklerin etkilerini değerlendirmek ve gerekli önleyici aksiyonları planlamaktır.",
            size: 20
        })],
        spacing: { after: 240 },
        alignment: AlignmentType.BOTH
    }));

    docElements.push(new Paragraph({
        children: [new TextRun({
            text: "Bu belge, kurumun kalite hedeflerine ulaşması yolunda bir yol haritası teşkil eder ve tüm denetim kadrosu için rehber niteliğindedir.",
            size: 20
        })],
        spacing: { after: 400 },
        alignment: AlignmentType.BOTH
    }));

    docElements.push(new Paragraph({ children: [new PageBreak()] }));

    // 3. MAIN SECTIONS
    riskMatrixSections.forEach((section, sIndex) => {
        const matrix = data.find(m => m.kategoriKodu === section.kategoriKodu);
        if (!matrix) return;

        let matrixData: RiskMatrixData = { rows: [] };
        try {
            matrixData = JSON.parse(matrix.matrisJson);
        } catch (e) {
            console.error("Word export JSON parse error", e);
        }

        // Section Title
        docElements.push(new Paragraph({
            children: [new TextRun({ text: `${sIndex + 2}. ${section.label.toUpperCase()}`, bold: true, color: "000000", size: 28 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 300 },
        }));

        // Matrix Header
        docElements.push(new Paragraph({
            children: [new TextRun({ text: matrix.baslik.toUpperCase(), bold: true, color: "000000", size: 20 })],
            spacing: { before: 200, after: 200 },
        }));

        // Matrix Table
        if (matrixData.rows.length > 0) {
            docElements.push(new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        tableHeader: true,
                        children: [
                            new TableCell({
                                children: [new Paragraph({ children: [new TextRun({ text: "KALİTE HEDEFLERİ", bold: true, color: "ffffff", size: 18 })], alignment: AlignmentType.CENTER })],
                                shading: { fill: "4472C4" },
                                width: { size: 25, type: WidthType.PERCENTAGE },
                                verticalAlign: VerticalAlign.CENTER,
                                margins: { top: 120, bottom: 120, left: 120, right: 120 },
                            }),
                            new TableCell({
                                children: [new Paragraph({ children: [new TextRun({ text: "ÖRNEK KALİTE RİSKLERİ", bold: true, color: "ffffff", size: 18 })], alignment: AlignmentType.CENTER })],
                                shading: { fill: "4472C4" },
                                width: { size: 37.5, type: WidthType.PERCENTAGE },
                                verticalAlign: VerticalAlign.CENTER,
                                margins: { top: 120, bottom: 120, left: 120, right: 120 },
                            }),
                            new TableCell({
                                children: [new Paragraph({ children: [new TextRun({ text: "RİSK AKSİYONLARI", bold: true, color: "ffffff", size: 18 })], alignment: AlignmentType.CENTER })],
                                shading: { fill: "4472C4" },
                                width: { size: 37.5, type: WidthType.PERCENTAGE },
                                verticalAlign: VerticalAlign.CENTER,
                                margins: { top: 120, bottom: 120, left: 120, right: 120 },
                            }),
                        ],
                    }),
                    ...matrixData.rows.map((row, idx) => new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({ children: [new TextRun({ text: `(${row.objective.letter}) ${row.objective.title}`, bold: true, color: "2F5597", size: 18 })], spacing: { after: 80 } }),
                                    ...(row.objective.items?.map(item => new Paragraph({
                                        children: [new TextRun({ text: item, size: 18 })],
                                        bullet: { level: 0 },
                                        spacing: { before: 40, after: 40 }
                                    })) || []),
                                ],
                                shading: idx % 2 === 1 ? { fill: "F2F2F2" } : undefined,
                                margins: { top: 120, bottom: 120, left: 120, right: 120 },
                                verticalAlign: VerticalAlign.TOP
                            }),
                            new TableCell({
                                children: row.risks.map(risk => new Paragraph({
                                    children: [new TextRun({ text: risk.text, size: 18 })],
                                    bullet: { level: 0 },
                                    spacing: { before: 60, after: 60 }
                                })),
                                shading: idx % 2 === 1 ? { fill: "F2F2F2" } : undefined,
                                margins: { top: 120, bottom: 120, left: 120, right: 120 },
                                verticalAlign: VerticalAlign.TOP
                            }),
                            new TableCell({
                                children: row.actions.map(action => new Paragraph({
                                    children: [new TextRun({ text: action.text, size: 18 })],
                                    bullet: { level: 0 },
                                    spacing: { before: 60, after: 60 }
                                })),
                                shading: idx % 2 === 1 ? { fill: "F2F2F2" } : undefined,
                                margins: { top: 120, bottom: 120, left: 120, right: 120 },
                                verticalAlign: VerticalAlign.TOP
                            }),
                        ],
                    })),
                ],
                borders: {
                    top: { style: BorderStyle.SINGLE, size: 6, color: "4472C4" },
                    bottom: { style: BorderStyle.SINGLE, size: 6, color: "4472C4" },
                    left: { style: BorderStyle.SINGLE, size: 6, color: "4472C4" },
                    right: { style: BorderStyle.SINGLE, size: 6, color: "4472C4" },
                    insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D9D9D9" },
                    insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "D9D9D9" },
                },
            }));
        }

        // Related Documents
        section.documents.forEach((docKey) => {
            const docInfo = documentMapping[docKey];
            if (!docInfo) return;

            const docData = relatedDocs[docInfo.formKodu];
            if (!docData) return;

            // Check if document has actual content to avoid empty blue headers
            const hasContent = docInfo.type === 2 ? (docData.metin || docData.icerik) :
                (docInfo.type === 1 || docInfo.type === 3) ? (Array.isArray(docData) && docData.length > 0) :
                    docInfo.type === 4 ? (docData.icerik || (docData.kontrolListesi && docData.kontrolListesi.length > 0)) : false;

            if (!hasContent) return;

            docElements.push(new Paragraph({
                children: [new TextRun({ text: docInfo.title.toUpperCase(), bold: true, color: "000000", size: 22 })],
                spacing: { before: 600, after: 200 },
                heading: HeadingLevel.HEADING_2,
            }));

            if (docInfo.type === 2) {
                // Robust extraction for Type 2 (Editor Text)
                // Can be an array (from getKysBelgelerEditorText) or a single object
                let textContent = "";
                if (Array.isArray(docData)) {
                    if (docData.length > 0) {
                        textContent = docData[0].metin || docData[0].icerik || "";
                    }
                } else {
                    textContent = docData.metin || docData.icerik || "";
                }

                if (textContent) {
                    docElements.push(...parseHtmlToElements(textContent));
                }
            } else if ((docInfo.type === 1 || docInfo.type === 3) && Array.isArray(docData) && docData.length > 0) {
                const headerCells = [
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: "NO", bold: true, color: "ffffff", size: 16 })], alignment: AlignmentType.CENTER })],
                        width: { size: 5, type: WidthType.PERCENTAGE },
                        shading: { fill: "2E75B6" },
                        margins: { top: 80, bottom: 80, left: 80, right: 80 },
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: docInfo.type === 1 ? "İŞLEM" : "KONU", bold: true, color: "ffffff", size: 16 })], alignment: AlignmentType.CENTER })],
                        width: { size: 30, type: WidthType.PERCENTAGE },
                        shading: { fill: "2E75B6" },
                        margins: { top: 80, bottom: 80, left: 80, right: 80 },
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: docInfo.type === 1 ? "TESPİT / DEĞERLENDİRME" : "AKSİYON", bold: true, color: "ffffff", size: 16 })], alignment: AlignmentType.CENTER })],
                        width: { size: 65, type: WidthType.PERCENTAGE },
                        shading: { fill: "2E75B6" },
                        margins: { top: 80, bottom: 80, left: 80, right: 80 },
                    }),
                ];
                const rows = docData.map((row: any, idx: number) => (
                    new TableRow({
                        children: [
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: (idx + 1).toString(), size: 16 })], alignment: AlignmentType.CENTER })], margins: { top: 80, bottom: 80, left: 80, right: 80 }, shading: idx % 2 === 1 ? { fill: "F9F9F9" } : undefined }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.islem || row.konu || "", size: 16 })] })], margins: { top: 80, bottom: 80, left: 80, right: 80 }, shading: idx % 2 === 1 ? { fill: "F9F9F9" } : undefined }),
                            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: row.tespit || row.yorum || row.cozum || "", size: 16 })] })], margins: { top: 80, bottom: 80, left: 80, right: 80 }, shading: idx % 2 === 1 ? { fill: "F9F9F9" } : undefined }),
                        ],
                    })
                ));
                docElements.push(new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [new TableRow({ children: headerCells, tableHeader: true }), ...rows],
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6" },
                        bottom: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6" },
                        left: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6" },
                        right: { style: BorderStyle.SINGLE, size: 4, color: "2E75B6" },
                        insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D9D9D9" },
                        insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "D9D9D9" },
                    },
                }));
            } else if (docInfo.type === 4) {
                if (docData.icerik) {
                    docElements.push(...parseHtmlToElements(docData.icerik));
                    docElements.push(new Paragraph({ spacing: { after: 200 } }));
                }
                if (docData.kontrolListesi && docData.kontrolListesi.length > 0) {
                    const checkRows = docData.kontrolListesi.map((item: any, idx: number) => (
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: item.checked ? "☑" : "☐", bold: true, color: item.checked ? "2E75B6" : "A6A6A6", size: 22 })], alignment: AlignmentType.CENTER })],
                                    width: { size: 8, type: WidthType.PERCENTAGE },
                                    margins: { top: 80, bottom: 80, left: 80, right: 80 },
                                    shading: idx % 2 === 1 ? { fill: "F9F9F9" } : undefined,
                                    verticalAlign: VerticalAlign.CENTER
                                }),
                                new TableCell({
                                    children: [new Paragraph({ children: [new TextRun({ text: item.label, size: 18, color: item.checked ? "000000" : "7F7F7F" })] })],
                                    width: { size: 92, type: WidthType.PERCENTAGE },
                                    margins: { top: 80, bottom: 80, left: 80, right: 80 },
                                    shading: idx % 2 === 1 ? { fill: "F9F9F9" } : undefined
                                }),
                            ],
                        })
                    ));
                    docElements.push(new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: checkRows,
                        borders: {
                            top: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" },
                            bottom: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" },
                            left: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" },
                            right: { style: BorderStyle.SINGLE, size: 4, color: "BFBFBF" },
                            insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "D9D9D9" },
                            insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "D9D9D9" },
                        },
                    }));
                }
            }
        });

        // Page break after section
        if (sIndex < riskMatrixSections.length - 1) {
            docElements.push(new Paragraph({ children: [new PageBreak()] }));
        }
    });

    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Calibri",
                        color: "000000",
                        size: 20
                    },
                    paragraph: {
                        spacing: {
                            line: 276, // 1.15 line spacing
                            before: 120,
                            after: 120,
                        },
                    },
                },
                heading1: {
                    run: {
                        font: "Calibri",
                        size: 32,
                        bold: true,
                        color: "1F4E78",
                    },
                    paragraph: {
                        spacing: { before: 480, after: 240 },
                    },
                },
                heading2: {
                    run: {
                        font: "Calibri",
                        size: 24,
                        bold: true,
                        color: "000000",
                    },
                    paragraph: {
                        spacing: { before: 400, after: 200 },
                    },
                },
            },
        },
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        bottom: 1440,
                        left: 1440,
                        right: 1440,
                    },
                },
            },
            headers: {
                default: new Header({
                    children: [
                        new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({
                                            children: [new Paragraph({ children: [new TextRun({ text: "KYS RİSK ANALİZİ RAPORU", bold: true, color: "7F7F7F", size: 16 })] })],
                                            borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "7F7F7F" }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                                        }),
                                        new TableCell({
                                            children: [new Paragraph({ children: [new TextRun({ text: companyName, bold: true, color: "7F7F7F", size: 16 })], alignment: AlignmentType.RIGHT })],
                                            borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "7F7F7F" }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                                        }),
                                    ],
                                }),
                            ],
                            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
                        }),
                    ],
                }),
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({ text: "Sayfa ", size: 16, color: "7F7F7F" }),
                                new TextRun({ children: ["PAGE_NUMBER"], size: 16, color: "7F7F7F" }),
                                new TextRun({ text: " / ", size: 16, color: "7F7F7F" }),
                                new TextRun({ children: ["NUM_PAGES"], size: 16, color: "7F7F7F" }),
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 200 }
                        }),
                    ],
                }),
            },
            children: docElements,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `KYS_Risk_Analizi_${year}.docx`);
};
