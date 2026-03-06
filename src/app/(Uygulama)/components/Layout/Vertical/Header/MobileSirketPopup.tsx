import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  IconButton,
  Dialog,
  DialogContent,
  Stack,
  Divider,
  Box,
  Typography,
  Button,
} from "@mui/material";
import { IconBuildingSkyscraper, IconX } from "@tabler/icons-react";
import CompanyBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/CompanyBoxAutoComplete";
import YearBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/YearBoxAutoComplete";
import { useDispatch, useSelector } from "@/store/hooks";
import {
  setDenetlenenFirmaAdi,
  setDenetlenenId,
  setYil,
  setBobimi,
  setTfrsmi,
  setDenetimTuru,
  setRol,
  setKonsolidemi,
  setEnflasyonmu,
  setToken,
  setRefreshToken,
} from "@/store/user/UserSlice";
import { AppState } from "@/store/store";
import { getRol } from "@/api/Sozlesme/DenetimKadrosuAtama";
import { updateSonSecilenAyarlari } from "@/api/Kullanici/KullaniciAyarlar";
import { apiFetch } from "@/api/apiBase";
import {
  buildRefreshRequestBody,
  persistSessionTokens,
  readStoredAuthTokens,
} from "@/utils/authSession";

const MobileSirketPopup = () => {
  // drawer top
  const user = useSelector((state: AppState) => state.userReducer);
  const router = useRouter();

  const [showDrawer2, setShowDrawer2] = useState(false);
  const [selectedId, setSelectedId] = useState(user.denetlenenId || 0);
  const [selectedAdi, setSelectedAdi] = useState(user.denetlenenFirmaAdi || "");
  const [selectedDenetimTuru, setSelectedDenetimTuru] = useState(user.denetimTuru || "");
  const [selectedBobimi, setSelectedBobimi] = useState(user.bobimi || false);
  const [selectedTfrsmi, setSelectedTfrsmi] = useState(user.tfrsmi || false);
  const [selectedEnflasyonmu, setSelectedEnflasyonmu] = useState(user.enflasyonmu || false);
  const [selectedKonsolidemi, setSelectedKonsolidemi] = useState(user.konsolidemi || false);
  const [selectedYear, setSelectedYear] = useState(user.yil?.toString() || "");
  const [selectedYearNumber, setSelectedYearNumber] = useState(user.yil || 0);

  const [year, setYear] = useState(user.yil);

  const [company, setCompany] = useState(
    user.denetlenenFirmaAdi?.split(" ").slice(0, 2).join(" ")
  );

  const dispatch = useDispatch();

  // Redux state değiş tiğinde local state'i güncelle
  useEffect(() => {
    if (user.yil) {
      setYear(user.yil);
    }
    if (user.denetlenenFirmaAdi) {
      setCompany(user.denetlenenFirmaAdi.split(" ").slice(0, 2).join(" "));
    }
  }, [user.yil, user.denetlenenFirmaAdi]);

  const handleDrawerClose2 = () => {
    setShowDrawer2(false);
  };

  const handleButtonClick = async () => {
    await dispatch(setDenetlenenId(selectedId));
    await dispatch(setDenetlenenFirmaAdi(selectedAdi));
    await dispatch(setYil(selectedYearNumber));
    await dispatch(setDenetimTuru(selectedDenetimTuru));
    await dispatch(setBobimi(selectedBobimi));
    await dispatch(setTfrsmi(selectedTfrsmi));
    await dispatch(setEnflasyonmu(selectedEnflasyonmu));
    await dispatch(setKonsolidemi(selectedKonsolidemi));
    await setYear(parseInt(selectedYear));
    await setCompany(selectedAdi.split(" ").slice(0, 2).join(" "));
    localStorage.setItem("fas_denetlenenId", selectedId.toString());
    localStorage.setItem("fas_yil", selectedYear.toString());

    try {
      if (selectedId && selectedYearNumber) {
        // Redux ve LocalStorage güncellemeleri zaten yapıldı.

        // 1. Önce DB Persist (Son Seçilen Ayarlar) - BU ÖNEMLİ: 
        // Backend'deki session/ayarlar güncellenmeli ki refresh token yeni şirketle gelsin.
        if (user.token && user.id && user.id !== 0) {
          console.log(`MobileSirketPopup - Persisting selection for user ${user.id}: Company=${selectedId}, Year=${selectedYearNumber}`);
          try {
            await updateSonSecilenAyarlari(user.id, selectedId, selectedYearNumber);
            console.log("MobileSirketPopup - Persistence update successful.");

            try {
              const refreshResponse = await apiFetch("/Auth/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: buildRefreshRequestBody(readStoredAuthTokens().refreshToken),
                suppressErrorLog: true,
              });
              const refreshData = await refreshResponse.json().catch(() => null);
              const nextToken = refreshData?.token || refreshData?.Token;
              const nextRefreshToken = refreshData?.refreshToken || refreshData?.RefreshToken;
              if (nextToken) {
                persistSessionTokens(nextToken, nextRefreshToken || readStoredAuthTokens().refreshToken);
                dispatch(setToken(nextToken));
              }
              if (nextRefreshToken) {
                dispatch(setRefreshToken(nextRefreshToken));
              }
              console.log("✅ MobileSirketPopup - Cookie session refreshed.");
            } catch (refreshErr) {
              console.warn("⚠️ MobileSirketPopup - Token refresh hatası:", refreshErr);
            }
          } catch (err) {
            console.error("MobileSirketPopup - Persistence update hatası:", err);
          }
        }

        // 2. Rol Bilgisi Güncelleme
        try {
          const rolVerileri = await getRol(user.id || 0, selectedId, selectedYearNumber);
          if (rolVerileri) {
            dispatch(setRol(rolVerileri.rol));
            console.log("MobileSirketPopup - Rol güncellendi.");
          }
        } catch (err) {
          console.error("MobileSirketPopup - Rol güncelleme hatası:", err);
        }
      }
    } catch (error) {
      console.error("MobileSirketPopup - Genel hata:", error);
    }

    handleDrawerClose2();

    // Sayfayı tamamen yenile - tüm veriler güncellenecek
    // Persistence sync için çok kısa bir bekleme (50ms)
    setTimeout(() => {
      window.location.reload();
    }, 50);
  };

  return (
    <>
      <IconButton
        aria-label="show 4 new mails"
        color="inherit"
        aria-controls="search-menu"
        aria-haspopup="true"
        onClick={() => setShowDrawer2(true)}
      >
        <IconBuildingSkyscraper size="20" />
      </IconButton>
      <Dialog
        open={showDrawer2}
        onClose={() => setShowDrawer2(false)}
        fullWidth
        maxWidth={"sm"}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ sx: { position: "fixed", top: 30, m: 0 } }}
      >
        <DialogContent className="testdialog">
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"space-between"}
            alignItems="center"
          >
            <Typography variant="h5" p={1}>
              Şirket ve Yıl Değiştir
            </Typography>
            <IconButton size="small" onClick={handleDrawerClose2}>
              <IconX size="18" />
            </IconButton>
          </Stack>
        </DialogContent>
        <Divider />
        <Box p={3} sx={{ height: "310px" }}>
          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              Şirket Seçiniz
            </Typography>
            <CompanyBoxAutocomplete
              onSelectId={(selectedId) => setSelectedId(selectedId)}
              onSelectAdi={(selectedAdi) => setSelectedAdi(selectedAdi)}
              onSelectDenetimTuru={(selectedDenetimTuru) =>
                setSelectedDenetimTuru(selectedDenetimTuru)
              }
              onSelectBobimi={(selectedBobimi) =>
                setSelectedBobimi(selectedBobimi)
              }
              onSelectTfrsmi={(selectedTfrsmi) =>
                setSelectedTfrsmi(selectedTfrsmi)
              }
              onSelectEnflasyonmu={(selectedEnflasyonmu) =>
                setSelectedEnflasyonmu(selectedEnflasyonmu)
              }
              onSelectKonsolidemi={(selectedKonsolidemi) =>
                setSelectedKonsolidemi(selectedKonsolidemi)
              }
              currentId={selectedId}
            />
          </Box>
          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              Yıl Seçiniz
            </Typography>
            <YearBoxAutocomplete
              onSelect={(selectedYear) => setSelectedYear(selectedYear)}
              onSelectYear={(selectedYear) =>
                setSelectedYearNumber(selectedYear)
              }
              selectedDenetlenenId={selectedId}
              currentYear={selectedYearNumber}
            />
          </Box>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={handleButtonClick}
          >
            Şirket Seç
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default MobileSirketPopup;
