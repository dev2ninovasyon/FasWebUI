"use client";

import { usePageTitle } from "@/hooks/usePageTitle";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Box,
  BoxProps,
  Grid,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import WbSunnyTwoToneIcon from "@mui/icons-material/WbSunnyTwoTone";
import DarkModeTwoToneIcon from "@mui/icons-material/DarkModeTwoTone";
import { IconCheck, IconVolume, IconVolumeOff } from "@tabler/icons-react";
import { setDarkMode, setNotificationSound, setTheme } from "@/store/customizer/CustomizerSlice";
import TemaAyarlariLayout from "./TemaAyarlariLayout";
import { useTheme } from "@mui/material/styles";

interface colors {
  id: number;
  bgColor: string;
  disp?: string;
  disp2?: string;
}
const Page = () => {
  usePageTitle("Tema Ayarları");
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const dispatch = useDispatch();

  const StyledBox = styled(Box)<BoxProps>(({ theme }) => ({
    boxShadow: theme.shadows[8],
    padding: "20px",
    cursor: "pointer",
    justifyContent: "center",
    display: "flex",
    transition: "0.1s ease-in",
    border: "1px solid rgba(145, 158, 171, 0.12)",
    position: "relative",
    "&:hover": {
      transform: "scale(1.05)",
    },
  }));

  const StyledBox2 = styled(Box)<BoxProps>(({ theme }) => ({
    boxShadow: theme.shadows[8],
    padding: "20px",
    cursor: "pointer",
    justifyContent: "center",
    display: "flex",
    transition: "0.1s ease-in",
    border: "1px solid rgba(145, 158, 171, 0.12)",
    position: "relative",
    "&:hover": {
      transform: "scale(1.03)",
    },
  }));

  const thColors: colors[] = [
    {
      id: 1,
      bgColor: "#113388",
      disp: "BLUE_THEME",
      disp2: "Mavi Tema",
    },
    {
      id: 2,
      bgColor: "#003355",
      disp: "AQUA_THEME",
      disp2: "Aqua Tema",
    },
    {
      id: 3,
      bgColor: "#301050",
      disp: "PURPLE_THEME",
      disp2: "Mor Tema",
    },
    {
      id: 4,
      bgColor: "#022c3c",
      disp: "GREEN_THEME",
      disp2: "Yeşil Tema",
    },
    {
      id: 5,
      bgColor: "#004d50",
      disp: "CYAN_THEME",
      disp2: "Cyan Tema",
    },
    {
      id: 6,
      bgColor: "#7a2b1a",
      disp: "ORANGE_THEME",
      disp2: "Turuncu Tema",
    },
  ];

  return (
    <TemaAyarlariLayout>
      <PageContainer title="Tema Ayarları" description="this is Tema Ayarları">
        <Box p={3}>
          {/* ------------------------------------------- */}
          {/* ------------ Dark light theme setting ------------- */}
          {/* ------------------------------------------- */}
          <Typography variant="h5" gutterBottom>
            Tema Seçenekleri
          </Typography>
          <Stack direction={"row"} gap={2}>
            <StyledBox
              onClick={() => dispatch(setDarkMode("light"))}
              display="flex"
              gap={1}
            >
              <WbSunnyTwoToneIcon
                color={
                  customizer.activeMode === "light" ? "primary" : "inherit"
                }
              />
              Açık Mod
            </StyledBox>
            <StyledBox
              onClick={() => dispatch(setDarkMode("dark"))}
              display="flex"
              gap={1}
            >
              <DarkModeTwoToneIcon
                color={customizer.activeMode === "dark" ? "primary" : "inherit"}
              />
              Koyu Mod
            </StyledBox>
          </Stack>

          <Box pt={3} />
          {/* ------------------------------------------- */}
          {/* ------------ Notification Sound setting ------------- */}
          {/* ------------------------------------------- */}
          <Typography variant="h5" gutterBottom>
            Bildirim Ayarları
          </Typography>
          <Stack direction={"row"} gap={2} alignItems="center">
            <StyledBox
              onClick={() => dispatch(setNotificationSound(!customizer.isNotificationSound))}
              display="flex"
              gap={1}
              sx={{ width: 'fit-content', minWidth: '180px' }}
            >
              {customizer.isNotificationSound ? (
                <IconVolume color={theme.palette.primary.main} />
              ) : (
                <IconVolumeOff color="inherit" />
              )}
              {customizer.isNotificationSound ? "Bildirim Sesi: Açık" : "Bildirim Sesi: Kapalı"}
            </StyledBox>
          </Stack>

          <Box pt={3} />
          {/* ------------------------------------------- */}
          {/* ------------ Theme Color setting ------------- */}
          {/* ------------------------------------------- */}
          <Typography variant="h5" gutterBottom>
            Tema Renkleri
          </Typography>
          <Grid container spacing={2}>
            {thColors.map((thcolor) => (
              <Grid key={thcolor.id} size={4}>
                <StyledBox2 onClick={() => dispatch(setTheme(thcolor.disp))}>
                  <Tooltip title={`${thcolor.disp2}`} placement="top">
                    <Box
                      sx={{
                        backgroundColor: thcolor.bgColor,
                        width: "25px",
                        height: "25px",
                        borderRadius: "60px",
                        alignItems: "center",
                        justifyContent: "center",
                        display: "flex",
                        color: "white",
                      }}
                      aria-label={`${thcolor.bgColor}`}
                    >
                      {customizer.activeTheme === thcolor.disp ? (
                        <IconCheck width={13} />
                      ) : (
                        ""
                      )}
                    </Box>
                  </Tooltip>
                </StyledBox2>
              </Grid>
            ))}
          </Grid>
        </Box>
      </PageContainer>
    </TemaAyarlariLayout>
  );
};

export default Page;
