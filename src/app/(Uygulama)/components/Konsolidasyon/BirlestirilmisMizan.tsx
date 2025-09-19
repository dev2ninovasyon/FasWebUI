import React, { useState } from "react";
import { Grid, Button, useTheme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import MizanCard from "@/app/(Uygulama)/components/Veri/Mizan/MizanCard";
import Mizan from "@/app/(Uygulama)/components/Veri/Mizan/Mizan";
import { createBirlestirilmisMizan } from "@/api/Veri/Mizan";
import { enqueueSnackbar } from "notistack";

const BirlestirilmisMizan = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();

  const [mizanOlusturTiklandimi, setMizanOlusturTiklandimi] = useState(false);

  const handleBirlestirilmisMizan = async () => {
    try {
      const result = await createBirlestirilmisMizan(
        user.token || "",
        user.denetciId || 0,
        user.yil || 0,
        user.denetlenenId || 0
      );
      if (result) {
        setMizanOlusturTiklandimi(false);
        enqueueSnackbar("Birleştirilmiş Mizan Oluşturuldu", {
          variant: "success",
          autoHideDuration: 5000,
          style: {
            backgroundColor:
              customizer.activeMode === "dark"
                ? theme.palette.success.light
                : theme.palette.success.main,
          },
        });
      } else {
        enqueueSnackbar("Birleştirilmiş Mizan Oluşturulamadı", {
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
    <>
      <Grid container marginTop={3}>
        <Grid item xs={12} lg={6}>
          <Grid
            container
            p={1}
            display={"flex"}
            alignItems="center"
            justifyContent={"center"}
          >
            <Grid item xs={12} md={12} lg={3}>
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                fullWidth
                disabled={mizanOlusturTiklandimi}
                onClick={() => {
                  setMizanOlusturTiklandimi(true);
                  handleBirlestirilmisMizan();
                }}
              >
                Mizan Birleştir
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={6} padding={1}>
          <MizanCard
            type={"BirlestirilmisMizan"}
            mizanOlusturTiklandimi={mizanOlusturTiklandimi}
            setMizanOlusturTiklandimi={setMizanOlusturTiklandimi}
          />
        </Grid>
      </Grid>
      <Grid container marginTop={3}>
        <Grid item xs={12} lg={12} padding={1}>
          <Mizan
            type={"BirlestirilmisMizan"}
            mizanOlusturTiklandimi={mizanOlusturTiklandimi}
            setMizanOlusturTiklandimi={setMizanOlusturTiklandimi}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default BirlestirilmisMizan;
