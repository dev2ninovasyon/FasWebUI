"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import {
  Avatar,
  Box,
  Button,
  Grid,
  styled,
  Typography,
  useTheme,
} from "@mui/material";
import { setAvatar } from "@/store/customizer/CustomizerSlice";
import HesapAyarlariLayout from "./HesapAyarlariLayout";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import { useState } from "react";
import ChildCard from "@/app/(Uygulama)/components/Layout/Shared/ChildCard/ChildCard";
import { enqueueSnackbar } from "notistack";
import { updatekullaniciSifre } from "@/api/Kullanici/KullaniciIslemleri";
interface avatars {
  id: number;
  src: string;
}

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const dispatch = useDispatch();

  const StyledBox = styled(Box)(({ theme }) => ({
    boxShadow: theme.shadows[8],
    padding: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "0.1s ease-in",
    border: "1px solid rgba(145, 158, 171, 0.12)",
    position: "relative",
    "&:hover": {
      transform: "scale(1.05)",
    },
  }));

  const pAvatars: avatars[] = [
    { id: 1, src: "/images/profile/user-1.jpg" },
    { id: 2, src: "/images/profile/user-2.jpg" },
    { id: 3, src: "/images/profile/user-3.jpg" },
    { id: 4, src: "/images/profile/user-4.jpg" },
    { id: 5, src: "/images/profile/user-5.jpg" },
    { id: 6, src: "/images/profile/user-6.jpg" },
    { id: 7, src: "/images/profile/user-7.jpg" },
    { id: 8, src: "/images/profile/user-8.jpg" },
    { id: 9, src: "/images/profile/user-9.jpg" },
    { id: 10, src: "/images/profile/user-10.jpg" },
  ];

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleButtonClick = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      enqueueSnackbar("Tüm Alanları Doldurun", {
        variant: "warning",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.warning.dark
              : theme.palette.warning.main,
        },
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      enqueueSnackbar("Yeni Şifreler Eşleşmiyor", {
        variant: "warning",
        autoHideDuration: 5000,
        style: {
          backgroundColor:
            customizer.activeMode === "dark"
              ? theme.palette.warning.dark
              : theme.palette.warning.main,
        },
      });
      return;
    }
    const updatedPassword = {
      oldPassword,
      newPassword,
      confirmPassword,
    };
    try {
      const result = await updatekullaniciSifre(
        user.token || "",
        user.id,
        updatedPassword
      );
      if (result) {
        enqueueSnackbar("Şifre Değiştirildi", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
            maxWidth: "720px",
          },
        });
      } else {
        enqueueSnackbar("Şifre Değiştirilemedi", {
          variant: "error",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.error.light
                : theme.palette.error.main,
            maxWidth: "720px",
          },
        });
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  return (
    <HesapAyarlariLayout>
      <PageContainer
        title="Hesap Ayarları"
        description="this is Hesap Ayarları"
      >
        <Box p={3}>
          {/* ------------------------------------------- */}
          {/* ------------ Avatar setting ------------- */}
          {/* ------------------------------------------- */}
          <Typography variant="h5" gutterBottom>
            Avatar Seçenekleri
          </Typography>
          <Grid container spacing={2}>
            {pAvatars.map((avatar) => {
              const isSelected = customizer.avatarSrc === avatar.src;
              return (
                <Grid item xs={2.4} key={avatar.id}>
                  <StyledBox
                    onClick={() => dispatch(setAvatar(avatar.src))}
                    sx={{
                      borderColor: isSelected
                        ? customizer.activeMode == "dark"
                          ? theme.palette.primary.dark
                          : theme.palette.primary.main
                        : "rgba(145, 158, 171, 0.12)",
                      boxShadow: isSelected
                        ? `0 0 8px ${
                            customizer.activeMode == "dark"
                              ? theme.palette.primary.dark
                              : theme.palette.primary.main
                          }`
                        : "none",
                    }}
                  >
                    <Avatar
                      src={avatar.src}
                      alt="ProfileAvatar"
                      sx={{ width: 50, height: 50, borderRadius: "50%" }}
                    />
                  </StyledBox>
                </Grid>
              );
            })}
          </Grid>
        </Box>
        <Box p={3}>
          {/* ------------------------------------------- */}
          {/* ------------ Password setting ------------- */}
          {/* ------------------------------------------- */}
          <Typography variant="h5" gutterBottom>
            Şifre Değiştirme
          </Typography>
          <ChildCard>
            <Grid container spacing={3}>
              {/* Eski Şifre */}
              <Grid item xs={12} sm={3} display="flex" alignItems="center">
                <CustomFormLabel
                  htmlFor="oldPassword"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                >
                  Eski Şifre
                </CustomFormLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <CustomTextField
                  id="oldPassword"
                  type={"text"}
                  value={oldPassword}
                  fullWidth
                  onChange={(e: any) => setOldPassword(e.target.value)}
                />
              </Grid>
              {/* Yeni Şifre */}
              <Grid item xs={12} sm={3} display="flex" alignItems="center">
                <CustomFormLabel
                  htmlFor="newPassword"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                >
                  Yeni Şifre
                </CustomFormLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <CustomTextField
                  id="newPassword"
                  type={"text"}
                  value={newPassword}
                  fullWidth
                  onChange={(e: any) => setNewPassword(e.target.value)}
                />
              </Grid>
              {/* Yeni Şifre Tekrar */}
              <Grid item xs={12} sm={3} display="flex" alignItems="center">
                <CustomFormLabel
                  htmlFor="confirmPassword"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 } }}
                >
                  Yeni Şifre (Tekrar)
                </CustomFormLabel>
              </Grid>
              <Grid item xs={12} sm={9}>
                <CustomTextField
                  id="confirmPassword"
                  type={"text"}
                  value={confirmPassword}
                  fullWidth
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                />
              </Grid>
              {/* Kaydet Butonu */}
              <Grid item xs={12} sm={3}></Grid>
              <Grid item xs={12} sm={9}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleButtonClick}
                >
                  Şifreyi Güncelle
                </Button>
              </Grid>
            </Grid>
          </ChildCard>
        </Box>
      </PageContainer>
    </HesapAyarlariLayout>
  );
};

export default Page;
