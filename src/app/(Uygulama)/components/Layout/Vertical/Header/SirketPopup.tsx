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
  Chip,
  Button,
  useTheme,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import CompanyBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/CompanyBoxAutoComplete";
import YearBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/YearBoxAutoComplete";
import { useDispatch, useSelector } from "@/store/hooks";
import {
  setBobimi,
  setDenetimTuru,
  setDenetlenenFirmaAdi,
  setDenetlenenId,
  setEnflasyonmu,
  setKonsolidemi,
  setRol,
  setTfrsmi,
  setYil,
} from "@/store/user/UserSlice";
import { AppState } from "@/store/store";
import { getRol } from "@/api/Sozlesme/DenetimKadrosuAtama";
import { updateSonSecilenAyarlari } from "@/api/Kullanici/KullaniciAyarlar";

const SirketPopup = () => {
  // drawer top
  const user = useSelector((state: AppState) => state.userReducer);

  const customizer = useSelector((state: AppState) => state.customizer);

  const theme = useTheme();
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

  // Redux state değiştiğinde local state'i güncelle
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
      const rolVerileri = await getRol(
        user.token || "",
        user.id || 0,
        selectedId,
        selectedYearNumber
      );
      if (rolVerileri) {
        dispatch(setRol(rolVerileri.rol));
      }

      // Persist to database
      if (user.token && user.id && user.id !== 0) {
        console.log(`SirketPopup - Persisting selection for user ${user.id}: Company=${selectedId}, Year=${selectedYearNumber}`);
        await updateSonSecilenAyarlari(user.token, user.id, selectedId, selectedYearNumber);
        console.log("SirketPopup - Persistence update successful.");
      } else {
        console.warn("SirketPopup - Skipping persistence update: Invalid user state.", { token: !!user.token, id: user.id });
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }

    handleDrawerClose2();

    // Sayfayı tamamen yenile - tüm veriler güncellenecek
    window.location.reload();
  };

  return (
    <>
      <IconButton
        aria-label="show 4 new mails"
        color="inherit"
        aria-controls="search-menu"
        aria-haspopup="true"
        aria-hidden="false"
        onClick={() => setShowDrawer2(true)}
        size="medium"
      >
        <Chip
          variant="outlined"
          label={
            user.denetlenenFirmaAdi && user.yil
              ? company + " - " + year
              : "Şirket ve Yıl Seçiniz"
          }
          size="medium"
          sx={{
            borderColor:
              customizer.activeMode === "dark"
                ? theme.palette.primary.dark
                : theme.palette.primary.main,
            color:
              customizer.activeMode === "dark"
                ? theme.palette.primary.dark
                : theme.palette.primary.main,
          }}
        />
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

export default SirketPopup;
