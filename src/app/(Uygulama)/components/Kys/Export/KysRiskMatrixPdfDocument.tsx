import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { KysRiskMatrisi, RiskMatrixData } from '@/api/Kys/KysRiskMatrisi';
import { riskMatrixSections, documentMapping } from '@/api/Kys/KysRiskMatrixConstants';
import DOMPurify from 'dompurify';

// Register a font that supports Turkish characters from a more stable source
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.ttf', fontWeight: 'normal' },
        { src: 'https://fonts.gstatic.com/s/roboto/v20/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.ttf', fontWeight: 'bold' },
    ],
});

// Register fonts for Turkish characters (optional but recommended if using custom fonts)
// For simplicity, we use standard fonts that support Latin-1, but for full Turkish support,
// we might need to register a custom font like DejaVuSans.

const styles = StyleSheet.create({
    page: {
        paddingTop: 50,
        paddingBottom: 50,
        paddingLeft: 50,
        paddingRight: 50,
        fontSize: 9,
        fontFamily: 'Roboto',
        color: '#2c3e50',
    },
    // Cover Page Styles
    coverPage: {
        padding: 0,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
    },
    coverHeader: {
        width: '100%',
        height: '35%',
        backgroundColor: '#2980b9',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    coverTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        letterSpacing: 2,
        zIndex: 10,
    },
    coverDecor: {
        position: 'absolute',
        top: -50,
        right: -50,
        width: 250,
        height: 250,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 125,
    },
    coverFooter: {
        width: '100%',
        padding: 40,
        borderTop: '1px solid #eee',
        alignItems: 'center',
    },
    coverLogos: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 30,
        marginBottom: 20,
    },
    logoText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#7f8c8d',
    },
    coverMeta: {
        alignItems: 'center',
        gap: 5,
    },
    coverCompanyName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2980b9',
    },
    coverYear: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    // General styles
    tocTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2980b9',
        marginBottom: 30,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    tocItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderBottom: '1px dotted #bdc3c7',
        paddingBottom: 4,
    },
    tocText: {
        fontSize: 11,
        color: '#34495e',
    },
    tocPage: {
        fontSize: 11,
        color: '#2980b9',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 25,
        borderBottom: '1.5pt solid #2980b9',
        paddingBottom: 10,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000000',
    },
    metaInfo: {
        fontSize: 8,
        color: '#7f8c8d',
        textAlign: 'right',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 15,
        marginTop: 20,
        borderBottom: '1px solid #2980b9',
        paddingBottom: 5,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10,
        backgroundColor: '#f1f7fa',
        padding: 8,
        color: '#2980b9',
        borderLeft: '4pt solid #2980b9',
    },
    table: {
        width: '100%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#dee2e6',
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#2980b9',
        color: '#ffffff',
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomColor: '#dee2e6',
        borderBottomWidth: 1,
        minHeight: 30,
    },
    tableRowEven: {
        backgroundColor: '#f8f9fa',
    },
    tableCell: {
        padding: 8,
        borderRightColor: '#dee2e6',
        borderRightWidth: 1,
    },
    headerCell: {
        padding: 8,
        borderRightColor: '#ffffff',
        borderRightWidth: 1,
        fontSize: 10,
        textAlign: 'center',
    },
    column1: { width: '25%' },
    column2: { width: '37.5%' },
    column3: { width: '37.5%' },
    bold: {
        fontWeight: 'bold',
        color: '#2c3e50',
    },
    item: {
        marginBottom: 5,
        fontSize: 9,
        lineHeight: 1.4,
    },
    docHeader: {
        fontSize: 11,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#000000',
        borderBottom: '0.5pt solid #eee',
        paddingBottom: 4,
    },
    docContent: {
        fontSize: 9,
        marginBottom: 15,
        backgroundColor: '#ffffff',
        padding: 12,
        border: '1px solid #f1f1f1',
        borderRadius: 4,
        color: '#34495e',
        lineHeight: 1.5,
    },
    footerLabel: {
        position: 'absolute',
        bottom: 30,
        left: 50,
        right: 50,
        textAlign: 'center',
        fontSize: 8,
        color: '#bdc3c7',
        borderTop: '0.5pt solid #eee',
        paddingTop: 10,
    },
    htmlP: { marginBottom: 8 },
    htmlB: { fontWeight: 'bold' },
    htmlI: { fontStyle: 'italic' },
    htmlLi: { marginLeft: 15, marginBottom: 4, flexDirection: 'row' },
    htmlBullet: { width: 10 }
});

interface KysRiskMatrixPdfDocumentProps {
    data: KysRiskMatrisi[];
    relatedDocs: Record<string, any>;
    companyName: string;
    year: number;
}

const KysRiskMatrixPdfDocument: React.FC<KysRiskMatrixPdfDocumentProps> = ({ data, relatedDocs, companyName, year }) => {
    // Basic HTML parser for PDF
    // Recursive DOM-based HTML to React-PDF component mapper
    const parseHtml = (html: string, initialStyle: any = {}): React.ReactNode => {
        if (!html) return null;

        const cleanHtml = html.replace(/&nbsp;/g, ' ').trim();
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanHtml, "text/html");
        const body = doc.body;

        const processNode = (node: Node, parentStyle: any = initialStyle): React.ReactNode => {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent || "";
                if (!text.trim() && text !== " ") return null;
                return <Text style={parentStyle}>{text}</Text>;
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as HTMLElement;
                const tagName = element.tagName.toLowerCase();

                // Styles for current element
                const currentStyle = { ...parentStyle };
                if (tagName === "b" || tagName === "strong") currentStyle.fontWeight = "bold";
                if (tagName === "i" || tagName === "em") currentStyle.fontStyle = "italic";
                if (tagName === "u") currentStyle.textDecoration = "underline";

                if (element.style.color) {
                    currentStyle.color = element.style.color;
                }

                // Handle inline elements (just wrap kids in Text with style)
                const isInline = ["b", "strong", "i", "em", "u", "span", "a"].includes(tagName);
                if (isInline) {
                    return (
                        <Text style={currentStyle}>
                            {Array.from(element.childNodes).map((child, idx) => (
                                <React.Fragment key={idx}>{processNode(child, currentStyle)}</React.Fragment>
                            ))}
                        </Text>
                    );
                }

                // Handle Block elements
                if (["p", "div", "h1", "h2", "h3", "h4", "h5", "h6", "li"].includes(tagName)) {
                    const blockStyle: any = [styles.htmlP];
                    if (tagName.startsWith("h")) {
                        blockStyle.push({ fontWeight: 'bold', fontSize: 11, color: '#2980b9', marginTop: 10 });
                    }

                    const content = Array.from(element.childNodes).map((child, idx) => (
                        <React.Fragment key={idx}>{processNode(child, currentStyle)}</React.Fragment>
                    ));

                    if (tagName === "li") {
                        return (
                            <View style={styles.htmlLi}>
                                <Text style={styles.htmlBullet}>•</Text>
                                <View style={{ flex: 1 }}>{content}</View>
                            </View>
                        );
                    }

                    return (
                        <View style={blockStyle}>
                            {content}
                        </View>
                    );
                }

                // Handle Lists
                if (tagName === "ul" || tagName === "ol") {
                    return (
                        <View style={{ marginBottom: 10 }}>
                            {Array.from(element.childNodes).map((child, idx) => (
                                <React.Fragment key={idx}>{processNode(child, currentStyle)}</React.Fragment>
                            ))}
                        </View>
                    );
                }

                // Handle Tables
                if (tagName === "table") {
                    const trs = Array.from(element.querySelectorAll("tr"));
                    return (
                        <View style={styles.table}>
                            {trs.map((tr, rowIdx) => {
                                const cells = Array.from(tr.childNodes).filter(node => node.nodeName.toLocaleLowerCase() === "td" || node.nodeName.toLocaleLowerCase() === "th");
                                return (
                                    <View key={rowIdx} style={[styles.tableRow, rowIdx % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
                                        {cells.map((td, cellIdx) => {
                                            const cellElement = td as HTMLElement;
                                            const isHeader = cellElement.tagName.toLowerCase() === "th";

                                            // Inherit styles from cell
                                            const cellStyle: any = { ...parentStyle };
                                            if (cellElement.style.color) {
                                                cellStyle.color = cellElement.style.color;
                                            }
                                            if (cellElement.style.fontWeight === "bold" || isHeader) {
                                                cellStyle.fontWeight = "bold";
                                            }

                                            let bgColor = cellElement.style.backgroundColor;
                                            if (isHeader && !bgColor) bgColor = "#f2f2f2";

                                            // Contrast safety: if background is dark and no color set, use white
                                            if (bgColor && !cellStyle.color) {
                                                const rgb = bgColor.match(/\d+/g);
                                                if (rgb && rgb.length >= 3) {
                                                    const r = parseInt(rgb[0]);
                                                    const g = parseInt(rgb[1]);
                                                    const b = parseInt(rgb[2]);
                                                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                                                    if (brightness < 128) cellStyle.color = "#ffffff";
                                                } else if (bgColor.startsWith("#")) {
                                                    const hex = bgColor.replace("#", "");
                                                    const r = parseInt(hex.substring(0, 2), 16);
                                                    const g = parseInt(hex.substring(2, 4), 16);
                                                    const b = parseInt(hex.substring(4, 6), 16);
                                                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                                                    if (brightness < 128) cellStyle.color = "#ffffff";
                                                }
                                            }

                                            // Check if empty
                                            const isEmpty = cellElement.innerText.trim() === "" && cellElement.querySelectorAll("img, table").length === 0;
                                            const finalBgColor = (!isEmpty || isHeader) ? bgColor : undefined;

                                            // Width Detection & Sidebar Detection
                                            const colSpan = parseInt(cellElement.getAttribute("colspan") || "1");
                                            let flexValue: any = colSpan;

                                            const wAttr = cellElement.getAttribute("width") || cellElement.style.width;
                                            if (wAttr) {
                                                if (wAttr.endsWith("%")) {
                                                    flexValue = (parseInt(wAttr) / 100) * cells.length;
                                                } else {
                                                    const val = parseInt(wAttr.replace(/[^\d]/g, ""));
                                                    if (!isNaN(val)) {
                                                        flexValue = (val / 800) * cells.length;
                                                    }
                                                }
                                            } else if (cells.length === 2) {
                                                const textLength = cellElement.innerText.trim().length;
                                                if (cellIdx === 0 && finalBgColor && textLength < 50) {
                                                    flexValue = 0.3; // Approx 15%
                                                } else if (cellIdx === 1 && cells[0] instanceof HTMLElement && (cells[0] as HTMLElement).innerText.trim().length < 50) {
                                                    flexValue = 1.7; // Approx 85%
                                                } else {
                                                    flexValue = cellIdx === 0 ? 0.5 : 1.5; // 25% / 75%
                                                }
                                            } else if (cells.length === 3) {
                                                flexValue = cellIdx === 0 ? 0.3 : 1.35; // 10% / 45%
                                            }

                                            return (
                                                <View key={cellIdx} style={[styles.tableCell, { flex: flexValue, backgroundColor: finalBgColor }]}>
                                                    {parseHtml(cellElement.innerHTML, cellStyle)}
                                                </View>
                                            );
                                        })}
                                    </View>
                                );
                            })}
                        </View>
                    );
                }

                // Default: just process children
                return (
                    <React.Fragment>
                        {Array.from(element.childNodes).map((child, idx) => (
                            <React.Fragment key={idx}>{processNode(child, currentStyle)}</React.Fragment>
                        ))}
                    </React.Fragment>
                );
            }

            return null;
        };

        return Array.from(body.childNodes).map((node, idx) => (
            <React.Fragment key={idx}>{processNode(node)}</React.Fragment>
        ));
    };

    return (
        <Document title={`KYS Risk Matrisi - ${companyName}`}>
            {/* COVER PAGE */}
            <Page size="A4" style={styles.coverPage}>
                <View style={styles.coverHeader}>
                    <View style={styles.coverDecor} />
                    <Text style={styles.coverTitle}>ÖRNEK RİSK MATRİSİ</Text>
                </View>

                <View style={styles.coverFooter}>
                    <View style={styles.coverLogos}>
                        <Text style={[styles.logoText, { color: '#3498db' }]}>IFAC</Text>
                        <Text style={[styles.logoText, { color: '#e67e22' }]}>GAASP</Text>
                        <Text style={[styles.logoText, { color: '#c0392b' }]}>KGK</Text>
                    </View>
                    <View style={styles.coverMeta}>
                        <Text style={styles.coverCompanyName}>{companyName.toUpperCase()}</Text>
                        <Text style={styles.coverYear}>{year} DENETİM DÖNEMİ</Text>
                    </View>
                </View>
            </Page>

            {/* TABLE OF CONTENTS */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.tocTitle}>İÇİNDEKİLER</Text>
                <View style={{ marginTop: 20 }}>
                    <View style={styles.tocItem}>
                        <Text style={styles.tocText}>ÖNSÖZ</Text>
                        <Text style={styles.tocPage}>3</Text>
                    </View>
                    {riskMatrixSections.map((section, idx) => (
                        <View key={idx} style={styles.tocItem}>
                            <Text style={styles.tocText}>{idx + 1}. {section.label.toUpperCase()}</Text>
                            <Text style={styles.tocPage}>{idx + 4}</Text>
                        </View>
                    ))}
                </View>
            </Page>

            {/* FOREWORD */}
            <Page size="A4" style={styles.page}>
                <Text style={styles.sectionTitle}>ÖNSÖZ</Text>
                <View style={styles.docContent}>
                    <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Örmek Risk Matrisinin Amacı Nedir?</Text>
                    <Text style={{ marginBottom: 10 }}>
                        Bu belge, Kalite Yönetim Sistemi standartları kapsamında hazırlanan risk analizlerini ve bu risklere karşı geliştirilen stratejileri içermektedir.
                        Denetim şirketlerinin ve profesyonel çalışanların kalite hedeflerine ulaşmaları için bir rehber niteliğindedir.
                    </Text>
                    <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Bu Örnek Matris Nasıl Kullanılır?</Text>
                    <Text>
                        Matris içerisinde yer alan riskler ve aksiyonlar örnek teşkil etmekte olup, her denetim şirketinin kendi yapısına,
                        büyüklüğüne ve risk profilini uygun olarak özelleştirilmesi gerekmektedir.
                    </Text>
                </View>
            </Page>

            {/* MAIN SECTIONS */}
            {riskMatrixSections.map((section, sIndex) => {
                const matrix = data.find(m => m.kategoriKodu === section.kategoriKodu);
                if (!matrix) return null;

                let matrixData: RiskMatrixData = { rows: [] };
                try {
                    matrixData = JSON.parse(matrix.matrisJson);
                } catch (e) {
                    console.error("JSON parse error for PDF", e);
                }

                return (
                    <Page key={sIndex} size="A4" style={styles.page}>
                        <View style={styles.header} fixed>
                            <Text style={styles.title}>{section.label.toUpperCase()}</Text>
                            <View style={styles.metaInfo}>
                                <Text style={{ fontWeight: 'bold' }}>{companyName}</Text>
                                <Text>{year} Denetim Raporu</Text>
                            </View>
                        </View>

                        {matrixData.rows.length > 0 && (
                            <>
                                <Text style={styles.sectionHeader}>{matrix.baslik.toUpperCase()}</Text>
                                <View style={styles.table}>
                                    <View style={styles.tableHeader}>
                                        <View style={[styles.headerCell, styles.column1]}>
                                            <Text>KALİTE HEDEFLERİ</Text>
                                        </View>
                                        <View style={[styles.headerCell, styles.column2]}>
                                            <Text>ÖRNEK KALİTE RİSKLERİ</Text>
                                        </View>
                                        <View style={[styles.headerCell, styles.column3, { borderRight: 0 }]}>
                                            <Text>RİSK AKSİYONLARI</Text>
                                        </View>
                                    </View>
                                    {matrixData.rows.map((row, rowIndex) => (
                                        <View key={rowIndex} style={[styles.tableRow, rowIndex % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
                                            <View style={[styles.tableCell, styles.column1]}>
                                                <Text style={styles.bold}>({row.objective.letter}) {row.objective.title}</Text>
                                                {row.objective.items?.map((objItem, objIdx) => (
                                                    <Text key={objIdx} style={[styles.item, { marginLeft: 10 }]}>• {objItem}</Text>
                                                ))}
                                            </View>
                                            <View style={[styles.tableCell, styles.column2]}>
                                                {row.risks.map((risk, riskIdx) => (
                                                    <Text key={riskIdx} style={styles.item}>• {risk.text}</Text>
                                                ))}
                                            </View>
                                            <View style={[styles.tableCell, styles.column3, { borderRight: 0 }]}>
                                                {(row.risks.flatMap(r => r.actions || [])).map((action, actionIdx) => (
                                                    <Text key={actionIdx} style={styles.item}>• {action.text}</Text>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}

                        {section.documents.map((docKey) => {
                            const docInfo = documentMapping[docKey];
                            if (!docInfo) return null;
                            const docData = relatedDocs[docInfo.formKodu];
                            if (!docData) return null;

                            // Robust extraction for Type 2 (Editor Text)
                            // Can be an array (from getKysBelgelerEditorText) or a single object
                            let textContent = "";
                            if (docInfo.type === 2) {
                                if (Array.isArray(docData)) {
                                    if (docData.length > 0) {
                                        textContent = docData[0].metin || docData[0].icerik || "";
                                    }
                                } else {
                                    textContent = docData.metin || docData.icerik || "";
                                }
                            }

                            // Check if document has actual content to avoid empty blue headers
                            const hasContent = docInfo.type === 2 ? !!textContent :
                                (docInfo.type === 1 || docInfo.type === 3) ? (Array.isArray(docData) && docData.length > 0) :
                                    docInfo.type === 4 ? (docData.icerik || (docData.kontrolListesi && docData.kontrolListesi.length > 0)) : false;

                            if (!hasContent) return null;

                            return (
                                <View key={docInfo.formKodu} style={{ marginTop: 25 }} wrap={false}>
                                    <Text style={styles.docHeader}>{docInfo.title.toUpperCase()}</Text>

                                    {docInfo.type === 2 && textContent && (
                                        <View style={styles.docContent}>
                                            {parseHtml(textContent)}
                                        </View>
                                    )}

                                    {(docInfo.type === 1 || docInfo.type === 3) && Array.isArray(docData) && docData.length > 0 && (
                                        <View style={styles.table}>
                                            <View style={[styles.tableHeader, { backgroundColor: '#f1f7fa', color: '#2980b9' }]}>
                                                <View style={[styles.headerCell, { width: '5%', borderRightColor: '#dee2e6' }]}><Text>No</Text></View>
                                                <View style={[styles.headerCell, { width: '30%', borderRightColor: '#dee2e6' }]}><Text>{docInfo.type === 1 ? 'İŞLEM' : 'KONU'}</Text></View>
                                                <View style={[styles.headerCell, { width: '65%', borderRight: 0 }]}><Text>{docInfo.type === 1 ? 'TESPİT' : 'AKSİYON'}</Text></View>
                                            </View>
                                            {docData.map((row: any, idx: number) => (
                                                <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
                                                    <View style={[styles.tableCell, { width: '5%', textAlign: 'center' }]}><Text>{idx + 1}</Text></View>
                                                    <View style={[styles.tableCell, { width: '30%' }]}><Text style={styles.item}>{row.islem || row.konu}</Text></View>
                                                    <View style={[styles.tableCell, { width: '65%', borderRight: 0 }]}><Text style={styles.item}>{row.tespit || row.yorum || row.cozum}</Text></View>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {docInfo.type === 4 && (
                                        <View>
                                            {docData.icerik && (
                                                <View style={styles.docContent}>
                                                    {parseHtml(docData.icerik)}
                                                </View>
                                            )}
                                            {docData.kontrolListesi && docData.kontrolListesi.length > 0 && (
                                                <View style={styles.table}>
                                                    {docData.kontrolListesi.map((item: any, idx: number) => (
                                                        <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
                                                            <View style={[styles.tableCell, { width: '8%', textAlign: 'center' }]}>
                                                                <Text style={{ color: item.checked ? '#2980b9' : '#bdc3c7', fontWeight: 'bold' }}>{item.checked ? 'X' : '-'}</Text>
                                                            </View>
                                                            <View style={[styles.tableCell, { borderRight: 0, flex: 1 }]}>
                                                                <Text style={styles.item}>{item.label}</Text>
                                                            </View>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        })}

                        <Text
                            style={styles.footerLabel}
                            render={({ pageNumber, totalPages }) => `KYS Risk Analiz Raporu • Sayfa ${pageNumber} / ${totalPages}`}
                            fixed
                        />
                    </Page>
                );
            })}
        </Document>
    );
};

export default KysRiskMatrixPdfDocument;
