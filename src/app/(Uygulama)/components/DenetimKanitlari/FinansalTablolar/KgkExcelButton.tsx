"use client";

import React, { useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { IconFileTypeXls } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  exportFinansalDurumTablosuKgkExcel,
  exportKarZararTablosuKgkExcel,
  exportNakitAkisTablosuKgkExcel,
  exportOzkaynakTablosuKgkExcel,
} from "@/api/FinansalTablolar/FinansalToblolar";
import { enqueueSnackbar } from "notistack";

type TabloTuru = "finansaldurum" | "karzarar" | "nakitakis" | "ozkaynak";

interface Props {
  tabloTuru: TabloTuru;
  konsolidasyonMu?: boolean;
}

const exportFunctions: Record<
  TabloTuru,
  (
    denetciId: number,
    yil: number,
    denetlenenId: number,
    konsolidasyonMu?: boolean
  ) => Promise<Blob | undefined>
> = {
  finansaldurum: exportFinansalDurumTablosuKgkExcel,
  karzarar: exportKarZararTablosuKgkExcel,
  nakitakis: exportNakitAkisTablosuKgkExcel,
  ozkaynak: exportOzkaynakTablosuKgkExcel,
};

const dosyaAdlari: Record<TabloTuru, string> = {
  finansaldurum: "KGK_Finansal_Durum_Tablosu.xlsm",
  karzarar: "KGK_Kar_Zarar_Tablosu.xlsm",
  nakitakis: "KGK_Nakit_Akis_Tablosu.xlsm",
  ozkaynak: "KGK_Ozkaynak_Degisim_Tablosu.xlsm",
};

const KgkExcelButton: React.FC<Props> = ({
  tabloTuru,
  konsolidasyonMu = false,
}) => {
  const [loading, setLoading] = useState(false);
  const user = useSelector((state: AppState) => state.userReducer);

  const handleExport = async () => {
    setLoading(true);
    try {
      const fn = exportFunctions[tabloTuru];
      const blob = await fn(
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0,
        konsolidasyonMu
      );

      if (!(blob instanceof Blob)) throw new Error("Yanıt bir blob değil");

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", dosyaAdlari[tabloTuru]);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("KGK Excel başarıyla oluşturuldu", {
        variant: "success",
      });
    } catch (error) {
      console.error("KGK Excel export error:", error);
      enqueueSnackbar("Excel oluşturulurken bir hata oluştu", {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outlined"
      color="primary"
      size="medium"
      sx={{ textTransform: "none" }}
      startIcon={
        loading ? (
          <CircularProgress size={18} color="inherit" />
        ) : (
          <IconFileTypeXls size={18} />
        )
      }
      onClick={handleExport}
      disabled={loading}
    >
      KGK Excel
    </Button>
  );
};

export default KgkExcelButton;
