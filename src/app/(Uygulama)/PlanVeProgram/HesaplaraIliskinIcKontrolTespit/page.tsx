"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, MenuItem, Typography, IconButton, Menu, useTheme, useMediaQuery } from "@mui/material";
import { IconDotsVertical } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import { useState } from "react";
import HesaplaraIliskinIcKontrolTespitTable from "@/app/(Uygulama)/components/CalismaKagitlari/HesaplaraIliskinIcKontrolTespitTableHandson";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";

const BCrumb = [
  { to: "/PlanVeProgram", title: "Plan ve Program" },
  { to: "/PlanVeProgram/HesaplaraIliskinIcKontrolTespit", title: "Hesaplara İlişkin İç Kontrol Tespit" },
];

const Page = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);
  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const controller = "HesaplaraIliskinIcKontrolTespit";

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  return (
    <>
      <Breadcrumb title="Hesaplara İlişkin İç Kontrol Tespit Belgesi" items={BCrumb}>
        <>
          {isMobile ? (
            <Grid container sx={{ width: "95%", height: "100%", margin: "0 auto", justifyContent: "space-between", alignItems: "center" }}>
              <Grid size={8}>
                <Typography variant="body2">{tamamlanan}/{toplam} Tamamlandı</Typography>
              </Grid>
              <Grid sx={{ display: "flex", justifyContent: "flex-end" }} size={4}>
                <IconButton onClick={handleMenuOpen} size="small" aria-label="menu">
                  <IconDotsVertical />
                </IconButton>
                <Menu id="breadcrumb-menu" anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
                  <MenuItem onClick={handleMenuClose}>
                    <EkBelgeYukleButton formKodu={controller} fullWidth={false} text="Belge Yükle" />
                  </MenuItem>
                  <MenuItem
                    onClick={() => { setIsClickedVarsayilanaDon(true); handleMenuClose(); }}
                    disabled={isClickedVarsayilanaDon}
                  >
                    Varsayılana Dön
                  </MenuItem>
                </Menu>
              </Grid>
            </Grid>
          ) : (
            <Grid container sx={{ width: "95%", height: "100%", margin: "0 auto", justifyContent: "space-between" }}>
              <Grid sx={{ display: "flex", alignItems: "center" }} size={{ xs: 12, md: 4 }}>
                <Typography variant="body1">{tamamlanan}/{toplam} Tamamlandı</Typography>
              </Grid>
              <Grid sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={{ xs: 6, md: 4 }}>
                <EkBelgeYukleButton formKodu={controller} fullWidth={false} text="Belge Yükle" />
              </Grid>
              <Grid sx={{ display: "flex", alignItems: "center", justifyContent: "center" }} size={{ xs: 6, md: 4 }}>
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  disabled={isClickedVarsayilanaDon}
                  onClick={() => setIsClickedVarsayilanaDon(true)}
                  sx={{ width: "100%" }}
                >
                  Varsayılana Dön
                </Button>
              </Grid>
            </Grid>
          )}
        </>
      </Breadcrumb>
      <PageContainer
        title="Hesaplara İlişkin İç Kontrol Tespit Belgesi"
        description="BDS-315 kapsamında hesap bazlı iç kontrol tespit tablosu"
      >
        <HesaplaraIliskinIcKontrolTespitTable
          isClickedVarsayilanaDon={isClickedVarsayilanaDon}
          setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
          setTamamlanan={setTamamlanan}
          setToplam={setToplam}
        />
      </PageContainer>
    </>
  );
};

export default Page;
