import "@/lib/handsontableSetup";
import { dictionary } from "@/utils/languages/handsontable.tr-TR";
import CustomHotTable from "@/components/HotTableWrapper";




import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Grid, useTheme } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { saveAs } from "file-saver";
import { setCollapse } from "@/store/customizer/CustomizerSlice";
import {
    updateEDefterIncelemeListeVerisi,
    updateEDefterIncelemeVerisi,
} from "@/api/Veri/EDefterInceleme";
import ExceleAktarButton from "@/app/(Uygulama)/components/Veri/ExceleAktarButton";
import { useRouter } from "next/navigation";
import numbro from "numbro";
import trTR from "numbro/languages/tr-TR";
import { getOrneklemFisleri } from "@/api/DenetimKanitlari/DenetimKanitlari";
import TespitAciklamaForm from "@/app/(Uygulama)/components/DenetimKanitlari/Onemlilik/TespitAciklamaForm";

// register Handsontable's modules
if (!numbro.languages()["tr-TR"]) {
    numbro.registerLanguage(trTR);
}
numbro.setLanguage("tr-TR");

interface Props {
    kebirKodu: number;
}

const OrneklemFisleriTable: React.FC<Props> = ({ kebirKodu }) => {
    const hotTableComponent = useRef<any>(null);

    const user = useSelector((state: AppState) => state.userReducer);
    const customizer = useSelector((state: AppState) => state.customizer);
    const dispatch = useDispatch();
    const theme = useTheme();
    const router = useRouter();

    const [rowCount, setRowCount] = useState(0);

    const [fetchedData, setFetchedData] = useState<any[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    const [tespitAciklama, setTespitAciklama] = useState("");

    const [
        secilenlereTespitAciklamaKaydetTiklandimi,
        setSecilenlereTespitAciklamaKaydetTiklandimi,
    ] = useState(false);

    useEffect(() => {
        const loadStyles = async () => {
            dispatch(setCollapse(true));
            if (customizer.activeMode === "dark") {
                await import(
                    "@/app/(Uygulama)/components/Veri/HandsOnTable/HandsOnTableDark.css"
                );
            } else {
                await import(
                    "@/app/(Uygulama)/components/Veri/HandsOnTable/HandsOnTableLight.css"
                );
            }
        };

        loadStyles();
    }, [customizer.activeMode]);

    const colHeaders = [
        "Id",
        "Seçim",
        "Yevmiye No",
        "Yevmiye Tarihi",
        "Detay Kodu",
        "Hesap Adı",
        "Açıklama",
        "Borç",
        "Alacak",
        "Tespit Açıklama",
    ];

    const columns = [
        {
            type: "numeric",
            columnSorting: true,
            readOnly: true,
            editor: false,
            className: "htLeft",
        }, // Id
        {
            type: "checkbox",
            className: "htCenter",
        }, // Seçim
        {
            type: "numeric",
            columnSorting: true,
            readOnly: true,
            editor: false,
            className: "htLeft",
        }, // Yevmiye No
        {
            type: "text",
            columnSorting: true,
            readOnly: true,
            editor: false,
            className: "htRight",
        }, // Yevmiye Tarihi
        {
            type: "text",
            columnSorting: true,
            readOnly: true,
            editor: false,
            className: "htLeft",
        }, // Detay Kodu
        {
            type: "text",
            columnSorting: true,
            readOnly: true,
            editor: false,
            className: "htLeft",
        }, // Hesap Adı
        {
            type: "text",
            columnSorting: true,
            readOnly: true,
            editor: false,
            className: "htLeft",
        }, // Açıklama
        {
            type: "numeric",
            numericFormat: {
                pattern: "0,0.00",
                columnSorting: true,
                culture: "tr-TR",
            },
            columnSorting: true,
            readOnly: true,
            editor: false,
            className: "htRight",
        }, // Borc
        {
            type: "numeric",
            numericFormat: {
                pattern: "0,0.00",
                columnSorting: true,
                culture: "tr-TR",
            },
            columnSorting: true,
            readOnly: true,
            editor: false,
            className: "htRight",
        }, // Alacak
        {
            type: "text",
            columnSorting: true,
            className: "htLeft",
        }, // Tespit Açıklama
    ];




    const handleGetRowData = async (row: number) => {
        if (hotTableComponent.current) {
            const hotInstance = hotTableComponent.current.hotInstance;
            const cellMeta = hotInstance.getDataAtRow(row);
            console.log("Satır Verileri:", cellMeta);
            return cellMeta;
        }
    };

    const handleAfterChange = async (changes: any, source: any) => {
        //Değişen Cellin Satır Indexi
        let changedRow = -1;

        if (source === "loadData") {
            return; // Skip this hook on loadData
        }
        if (source === "edit" || source === "Autofill.fill") {
            const updatedSelectedRows = fetchedData.filter((row) => row[1] == true);
            setSelectedRows(updatedSelectedRows);
        }
        if (changes) {
            for (const [row, prop, oldValue, newValue] of changes) {
                console.log(
                    `Changed cell at row: ${row}, col: ${prop}, from: ${oldValue}, to: ${newValue}`
                );
                changedRow = row;

                //Cell Güncelleme
                if (prop == 9) {
                    await handleUpdateEDefterIncelemeVerisi(changedRow);

                    changedRow = -1;
                }
            }
        }
    };

    const handleUpdateEDefterIncelemeVerisi = async (row: number) => {
        const rowData = await handleGetRowData(row);
        if (rowData[9] == null || rowData[9] == undefined) {
            rowData[9] == "";
        }
        const updatedEDefterIncelemeVerisi = {
            tespitAciklama: rowData[9],
        };

        try {
            const result = await updateEDefterIncelemeVerisi(user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                rowData[0],
                updatedEDefterIncelemeVerisi
            );
            if (result) {
                await fetchData();
                console.log("E-Defter İnceleme Verisi güncelleme başarılı");
            } else {
                console.log("E-Defter İnceleme güncelleme başarısız");
            }
        } catch (error) {
            console.log("Bir hata oluştu:", error);
        }
    };

    const handleUpdateEDefterIncelemeListeVerisi = async () => {
        const updatedEDefterIncelemeVerisi = {
            tespitAciklama: tespitAciklama,
        };

        const ids: string[] = selectedRows
            .filter((row: any[]) => row[1] === true)
            .map((row: any[]) => row[0]);

        try {
            const result = await updateEDefterIncelemeListeVerisi(user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                ids,
                updatedEDefterIncelemeVerisi
            );
            if (result) {
                setSecilenlereTespitAciklamaKaydetTiklandimi(false);
                console.log("E-Defter İnceleme Verisi güncelleme başarılı");
            } else {
                setSecilenlereTespitAciklamaKaydetTiklandimi(false);
                console.log("E-Defter İnceleme güncelleme başarısız");
            }
        } catch (error) {
            console.log("Bir hata oluştu:", error);
        }
    };

    const fetchData = async () => {
        try {
            const orneklemFisleriVerileri = await getOrneklemFisleri(user.denetciId || 0,
                user.denetlenenId || 0,
                user.yil || 0,
                kebirKodu
            );
            const rowsAll: any = [];

            orneklemFisleriVerileri.forEach((veri: any) => {
                const newRow: any = [
                    veri.id,
                    false,
                    veri.yevmiyeNo,
                    veri.yevmiyeTarih.split("T")[0].split("-").reverse().join("."),
                    veri.detayKodu,
                    veri.hesapAdi,
                    veri.aciklama,
                    veri.borc,
                    veri.alacak,
                    veri.tespitAciklama,
                ];
                rowsAll.push(newRow);
            });

            setFetchedData(rowsAll);
            setRowCount(rowsAll.length);
        } catch (error) {
            console.log("Bir hata oluştu:", error);
        }
    };

    useEffect(() => {
        if (kebirKodu > 0) {
            fetchData();
        }
    }, [kebirKodu]);

    useEffect(() => {
        if (secilenlereTespitAciklamaKaydetTiklandimi) {
            handleUpdateEDefterIncelemeListeVerisi();
        } else {
            if (kebirKodu > 0) {
                fetchData();
            }
        }
    }, [secilenlereTespitAciklamaKaydetTiklandimi]);

    const handleDownload = () => {
        const hotTableInstance = hotTableComponent.current.hotInstance;
        const data = hotTableInstance.getData();

        const processedData = data.map((row: any) => row.slice(2));

        const headers = hotTableInstance.getColHeader().slice(2);

        const fullData = [headers, ...processedData];

        async function createExcelFile() {
            const { default: ExcelJS } = await import("exceljs");
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Sayfa1");

            fullData.forEach((row: any) => {
                worksheet.addRow(row);
            });

            const headerRow = worksheet.getRow(1);
            headerRow.font = {
                name: "Calibri",
                size: 12,
                bold: true,
                color: { argb: "FFFFFF" },
            };
            headerRow.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "1a6786" },
            };
            headerRow.alignment = { horizontal: "left" };

            worksheet.columns.forEach((column) => {
                column.width = 25;
            });

            try {
                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                });
                saveAs(blob, "OrneklemFisleri.xlsx");
                console.log("Excel dosyası başarıyla oluşturuldu");
            } catch (error) {
                console.log("Excel dosyası oluşturulurken bir hata oluştu:", error);
            }
        }
        createExcelFile();
    };

    useEffect(() => {
        if (hotTableComponent.current) {
            const diff = customizer.isCollapse
                ? 0
                : customizer.SidebarWidth && customizer.MiniSidebarWidth
                    ? customizer.SidebarWidth - customizer.MiniSidebarWidth
                    : 0;

            hotTableComponent.current.hotInstance.updateSettings({
                width: customizer.isCollapse
                    ? "100%"
                    : hotTableComponent.current.hotInstance.rootElement.clientWidth -
                    diff,
            });
        }
    }, [customizer.isCollapse]);

    return (
        <>
            <Grid container mb={2}>
                <Grid
                    size={{
                        xs: 12,
                        lg: 12
                    }}>
                    <TespitAciklamaForm
                        tespitAciklama={tespitAciklama}
                        setTespitAciklama={setTespitAciklama}
                        setSecilenlereTespitAciklamaKaydetTiklandimi={
                            setSecilenlereTespitAciklamaKaydetTiklandimi
                        }
                    />
                </Grid>
            </Grid>
            <CustomHotTable theme={customizer.activeMode === "dark" ? "ht-theme-horizon-dark" : "ht-theme-horizon"}
                style={{
                    height: "100%",
                    width: "100%",
                    maxHeight: 684,
                    maxWidth: "100%",
                }}
                language={dictionary.languageCode}
                ref={hotTableComponent}
                data={fetchedData}
                height={684}
                colHeaders={colHeaders}
                columns={columns}
                colWidths={[0, 40, 50, 50, 80, 150, 180, 100, 100, 180]}
                stretchH="all"
                manualColumnResize={true}
                rowHeaders={true}
                rowHeights={35}
                autoWrapRow={true}
                minRows={rowCount}
                minCols={9}
                hiddenColumns={{
                    columns: [0],
                }}
                filters={true}
                columnSorting={true}
                dropdownMenu={[
                    "filter_by_condition",
                    "filter_by_value",
                    "filter_action_bar",
                ]}
                licenseKey="non-commercial-and-evaluation" // For non-commercial use only
                afterChange={handleAfterChange}
                copyPaste={true}
                contextMenu={{
                    items: {
                        gise_git: {
                            name: "Fişe Git",
                            callback: async function (key, selection) {
                                const row = await handleGetRowData(selection[0].start.row);
                                router.push(
                                    `/DenetimKanitlari/Onemlilik/Orneklem/OrneklemFisleri/${row[4].substring(
                                        0,
                                        3
                                    )}/FisDetaylari/${row[2]}`
                                );
                            },
                        },
                    },
                }}
            />
            {fetchedData.length > 0 && (
                <Grid container marginTop={2}>
                    <Grid
                        size={{
                            xs: 12,
                            lg: 10
                        }}></Grid>
                    <Grid
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                        size={{
                            xs: 12,
                            lg: 2
                        }}>
                        <ExceleAktarButton
                            handleDownload={handleDownload}
                        ></ExceleAktarButton>
                    </Grid>
                </Grid>
            )}
        </>
    );
};

export default OrneklemFisleriTable;

