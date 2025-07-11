"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  getDenetlenenById,
  updateDenetlenenDenetimTuru,
} from "@/api/Musteri/MusteriIslemleri";
import { useDispatch } from "@/store/hooks";
import { setDenetimTuru, setEnflasyonmu } from "@/store/user/UserSlice";
import { getDenetciOdemeBilgileri } from "@/api/Kullanici/KullaniciIslemleri";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/MusteriKabul",
    title: "Müşteri Kabul",
  },
];

const Page: React.FC = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const dispatch = useDispatch();

  const [tur, setTur] = useState("Bobi");
  const handleChangeTur = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTur(event.target.value);
  };

  const [enflasyon, setEnflasyon] = useState("Hayır");
  const handleChangeEnflasyon = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEnflasyon(event.target.value);
  };

  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const handleDenetimeKabulEt = async () => {
    try {
      const result = await updateDenetlenenDenetimTuru(
        user.token || "",
        user.denetlenenId || 0,
        tur,
        enflasyon
      );
      if (result) {
        fetchData();
        setHesaplaTiklandimi(false);
        await dispatch(setDenetimTuru(tur));
        await dispatch(setEnflasyonmu(enflasyon === "Evet"));
        enqueueSnackbar("Denetime Kabul Edildi", {
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
        enqueueSnackbar("Denetime Kabul Edilemedi", {
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

  const fetchData = async () => {
    try {
      const denetlenenVerileri = await getDenetlenenById(
        user.token || "",
        user.denetlenenId || 0
      );
      setTur(denetlenenVerileri.denetimTuru);
      setEnflasyon(denetlenenVerileri.enflasyonMu ? "Evet" : "Hayır");
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };
  const [odemeBilgileriBobi, setOdemeBilgileriBobi] = useState(false);
  const [odemeBilgileriTfrs, setOdemeBilgileriTfrs] = useState(false);
  const [odemeBilgileriKumi, setOdemeBilgileriKumi] = useState(false);

  const fetchData2 = async () => {
    try {
      const response = await getDenetciOdemeBilgileri(user.denetciId);
      if (response) {
        setOdemeBilgileriBobi(response.bobiModulu);
        setOdemeBilgileriTfrs(response.tfrsModulu);
        setOdemeBilgileriKumi(response.kumiModulu);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchData2();
  }, []);

  return (
    <PageContainer title="Müşteri Kabul" description="Müşteri Kabul">
      <Breadcrumb title="Müşteri Kabul" items={BCrumb} />
      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          lg={12}
          sx={{
            display: "flex",
            flexDirection: smDown ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              flexDirection: smDown ? "column" : "row",
              gap: 1,
              width: "100%",
            }}
          >
            <CustomSelect
              labelId="tur"
              id="tur"
              size="small"
              value={tur}
              onChange={handleChangeTur}
              height={"36px"}
            >
              {odemeBilgileriBobi && (
                <MenuItem value={"Bobi"}>Denetim Türü: Bobi</MenuItem>
              )}
              {odemeBilgileriBobi && (
                <MenuItem value={"BobiBüyük"}>
                  Denetim Türü: Bobi Büyük
                </MenuItem>
              )}
              {odemeBilgileriTfrs && (
                <MenuItem value={"Tfrs"}>Denetim Türü: Tfrs</MenuItem>
              )}
              {odemeBilgileriTfrs && (
                <MenuItem value={"TfrsDönemsel"}>
                  Denetim Türü: Tfrs Dönemsel
                </MenuItem>
              )}
              {odemeBilgileriKumi && (
                <MenuItem value={"Kumi"}>Denetim Türü: Kümi</MenuItem>
              )}
              <MenuItem value={"ÖzelDenetim"}>
                Denetim Türü: Özel Denetim
              </MenuItem>
            </CustomSelect>
            <CustomSelect
              labelId="enflasyon"
              id="enflasyon"
              size="small"
              value={enflasyon}
              onChange={handleChangeEnflasyon}
              height={"36px"}
            >
              <MenuItem value={"Evet"}>
                Enflasyon Düzeltmesi Uygulanacak Mı: Evet
              </MenuItem>
              <MenuItem value={"Hayır"}>
                Enflasyon Düzeltmesi Uygulanacak Mı: Hayır
              </MenuItem>
            </CustomSelect>
            <Button
              type="button"
              size="medium"
              disabled={hesaplaTiklandimi}
              variant="outlined"
              color="primary"
              onClick={() => {
                handleDenetimeKabulEt();
              }}
            >
              Denetime Kabul Et
            </Button>
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
