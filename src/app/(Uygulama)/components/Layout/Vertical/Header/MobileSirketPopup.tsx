import { useState } from "react";
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
} from "@/store/user/UserSlice";
import { AppState } from "@/store/store";

const MobileSirketPopup = () => {
  // drawer top
  const user = useSelector((state: AppState) => state.userReducer);

  const [showDrawer2, setShowDrawer2] = useState(false);
  const [selectedId, setSelectedId] = useState(0);
  const [selectedAdi, setSelectedAdi] = useState("");
  const [selectedDenetimTuru, setSelectedDenetimTuru] = useState("");
  const [selectedBobimi, setSelectedBobimi] = useState(false);
  const [selectedTfrsmi, setSelectedTfrsmi] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedYearNumber, setSelectedYearNumber] = useState(0);

  const [company, setCompany] = useState(
    user.denetlenenFirmaAdi?.split(" ").slice(0, 2).join(" ")
  );
  const [year, setYear] = useState(user.yil);

  const dispatch = useDispatch();

  const handleDrawerClose2 = () => {
    setShowDrawer2(false);
  };

  function handleButtonClick() {
    dispatch(setDenetlenenId(selectedId));
    dispatch(setDenetlenenFirmaAdi(selectedAdi));
    dispatch(setYil(selectedYearNumber));
    dispatch(setDenetimTuru(selectedDenetimTuru));
    dispatch(setBobimi(selectedBobimi));
    dispatch(setTfrsmi(selectedTfrsmi));
    setYear(parseInt(selectedYear));
    setCompany(selectedAdi.split(" ").slice(0, 2).join(" "));

    window.location.reload();

    handleDrawerClose2();
  }

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
