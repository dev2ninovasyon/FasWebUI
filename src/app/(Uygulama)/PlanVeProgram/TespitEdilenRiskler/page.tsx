"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button, Grid, Typography, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material";
import { IconDotsVertical } from "@tabler/icons-react";
import { useState } from "react";
import TespitEdilenRisklerTable from "@/app/(Uygulama)/components/CalismaKagitlari/TespitEdilenRisklerTable";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan ve Program",
  },
  {
    to: "/PlanVeProgram/TespitEdilenRiskler",
    title: "Tespit Edilen Riskler",
  },
];

const Page = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const [isClickedVarsayilanaDon, setIsClickedVarsayilanaDon] = useState(false);
  const [tamamlanan, setTamamlanan] = useState(0);
  const [toplam, setToplam] = useState(0);

  const controller = "TespitEdilenRiskler";

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Breadcrumb title="Tespit Edilen Riskler" items={BCrumb}>
        <>
          {isMobile ? (
            <Grid
              container
              sx={{
                width: "100%",
                height: "100%",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Grid size={8}>
                <Typography
                  variant="body2"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                    textAlign: "left",
                  }}
                >
                  {tamamlanan}/{toplam} Tamamlandı
                </Typography>
              </Grid>
              <Grid sx={{ display: "flex", justifyContent: "flex-end" }} size={4}>
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  aria-label="menu"
                  aria-controls={menuOpen ? 'breadcrumb-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={menuOpen ? 'true' : undefined}
                >
                  <IconDotsVertical />
                </IconButton>
                <Menu
                  id="breadcrumb-menu"
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={handleMenuClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  <MenuItem onClick={handleMenuClose}>
                    Belge Yükle
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
            <Grid
              container
              sx={{
                width: "100%",
                height: "100%",
                justifyContent: "space-between",
              }}
            >
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
                size={{
                  xs: 12,
                  md: 3.8,
                  lg: 3.8
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                    textAlign: "center",
                  }}
                >
                  {tamamlanan}/{toplam} Tamamlandı
                </Typography>
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                size={{
                  xs: 5.8,
                  md: 3.8,
                  lg: 3.8,
                }}
              >
                <EkBelgeYukleButton
                  formKodu={controller}
                  fullWidth={true}
                  text="Belge Yükle"
                  sx={{ height: 40, textTransform: "none" }}
                />
              </Grid>
              <Grid
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                size={{
                  xs: 5.8,
                  md: 3.8,
                  lg: 3.8,
                }}
              >
                <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  disabled={isClickedVarsayilanaDon}
                  onClick={() => setIsClickedVarsayilanaDon(true)}
                  sx={{
                    width: "100%",
                    height: 40,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Varsayılana Dön
                </Button>
              </Grid>
            </Grid>
          )}
        </>
      </Breadcrumb>
      <PageContainer
        title="Tespit Edilen Riskler"
        description="this is Tespit Edilen Riskler"
      >
        <Box
          sx={{
            width: "100%",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          <TespitEdilenRisklerTable
            isClickedVarsayilanaDon={isClickedVarsayilanaDon}
            setIsClickedVarsayilanaDon={setIsClickedVarsayilanaDon}
            setTamamlanan={setTamamlanan}
            setToplam={setToplam}
          />
        </Box>
      </PageContainer>
    </>
  );
};

export default Page;
