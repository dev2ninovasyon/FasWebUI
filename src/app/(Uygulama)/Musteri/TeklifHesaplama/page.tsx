"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import {
  Button,
  Fab,
  Grid,
  MenuItem,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useEffect, useState } from "react";
import CustomFormLabel from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomFormLabel";
import CustomTextAreaAutoSize from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextAreaAutoSize";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";
import {
  deleteTeklifHesaplama,
  getTeklifHesaplama,
  TeklifHesapla,
  updateTeklifHesaplama,
} from "@/api/Musteri/MusteriIslemleri";
import CustomSelect from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomSelect";
import { enqueueSnackbar } from "notistack";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import { ConfirmPopUpComponent } from "@/app/(Uygulama)/components/CalismaKagitlari/ConfirmPopUp";
import { IconExclamationMark } from "@tabler/icons-react";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/TeklifHesaplama",
    title: "Teklif Hesaplama",
  },
];

interface Veri {
  id: number;
  siraNo: number;
  genelBilgi: string;
  tespit: string;
  deger: string;
}

const Page = () => {
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  const [kaydetTiklandimi, setKaydetTiklandimi] = useState(false);
  const [hesaplaTiklandimi, setHesaplaTiklandimi] = useState(false);

  const [silTiklandimi, setSilTiklandimi] = useState(false);

  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const handleCloseConfirmPopUp = () => {
    setIsConfirmPopUpOpen(false);
  };

  const handleSaveTeklifHesaplama = async () => {
    const keys = [
      "denetciId",
      "denetlenenId",
      "yil",
      "id",
      "siraNo",
      "genelBilgi",
      "tespit",
      "deger",
    ];

    const jsonData = fetchedData.map((item: Veri) => {
      let obj: { [key: string]: any } = {};
      keys.forEach((key, i) => {
        if (key === "denetciId") {
          obj[key] = user.denetciId;
        } else if (key === "denetlenenId") {
          obj[key] = user.denetlenenId;
        } else if (key === "yil") {
          obj[key] = user.yil;
        } else if (key === "id") {
          obj[key] = item.id;
        } else if (key === "siraNo") {
          obj[key] = item.siraNo;
        } else if (key === "genelBilgi") {
          obj[key] = item.genelBilgi;
        } else if (key === "tespit") {
          obj[key] = item.tespit;
        } else if (key === "deger") {
          if (item.siraNo > 4) {
            obj[key] = item.deger.toString();
          } else {
            obj[key] = item.deger;
          }
        }
      });

      return obj;
    });

    const result = await updateTeklifHesaplama(user.token || "", jsonData);
    if (result) {
      enqueueSnackbar("Kaydedildi", {
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
      enqueueSnackbar("Kaydedilemedi", {
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
    setKaydetTiklandimi(false);
  };

  const handleTeklifHesapla = async () => {
    const result = await TeklifHesapla(
      user.token || "",
      user.denetciId || 0,
      user.denetlenenId || 0,
      user.yil || 0
    );
    if (result) {
      enqueueSnackbar("Hesaplandı", {
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
      enqueueSnackbar("Hesaplanmadı", {
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
    setHesaplaTiklandimi(false);
  };

  const handleDeleteTeklifHesaplama = async () => {
    try {
      const result = await deleteTeklifHesaplama(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      if (result) {
        enqueueSnackbar("Silindi", {
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
        fetchData();
      } else {
        enqueueSnackbar("Silinemedi", {
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
      const teklidHesaplamaVerileri = await getTeklifHesaplama(
        user.token || "",
        user.denetciId || 0,
        user.denetlenenId || 0,
        user.yil || 0
      );
      const rowsAll: any = [];
      teklidHesaplamaVerileri.forEach((veri: Veri) => {
        const newRow: any = {
          id: veri.id,
          siraNo: veri.siraNo,
          genelBilgi: veri.genelBilgi,
          tespit: veri.tespit,
          deger:
            veri.siraNo > 4
              ? (() => {
                  const parsed = parseFloat(veri.deger);

                  return isNaN(parsed) ? 0 : parsed;
                })()
              : veri.deger,
        };
        rowsAll.push(newRow);
      });
      setFetchedData(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!hesaplaTiklandimi) {
      fetchData();
    }
  }, [hesaplaTiklandimi]);

  useEffect(() => {
    if (silTiklandimi) {
      handleDeleteTeklifHesaplama();
      setSilTiklandimi(false);
    }
  }, [silTiklandimi]);

  return (
    <>
      <Breadcrumb title="Teklif Hesaplama" items={BCrumb}>
        <>
          <Grid
            container
            sx={{
              width: "95%",
              height: "100%",
              margin: "0 auto",
              justifyContent: "space-between",
            }}
          >
            <Grid
              item
              xs={12}
              md={3.8}
              lg={3.8}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                disabled={kaydetTiklandimi}
                onClick={() => {
                  setKaydetTiklandimi(true);
                  handleSaveTeklifHesaplama();
                }}
                sx={{ width: "100%", height: { lg: "54px", md: "54px" } }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                  }}
                >
                  Kaydet
                </Typography>
              </Button>
            </Grid>
            <Grid
              item
              xs={12}
              md={3.8}
              lg={3.8}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                disabled={hesaplaTiklandimi}
                onClick={() => {
                  setHesaplaTiklandimi(true);
                  handleTeklifHesapla();
                }}
                sx={{ width: "100%", height: { lg: "54px", md: "54px" } }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                  }}
                >
                  Hesapla
                </Typography>
              </Button>
            </Grid>
            <Grid
              item
              xs={12}
              md={3.8}
              lg={3.8}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Button
                size="medium"
                variant="outlined"
                color="primary"
                onClick={() => setIsConfirmPopUpOpen(true)}
                sx={{ width: "100%", height: { lg: "54px", md: "54px" } }}
              >
                <Typography
                  variant="body1"
                  sx={{ overflowWrap: "break-word", wordWrap: "break-word" }}
                >
                  Sil
                </Typography>
              </Button>
            </Grid>
          </Grid>
        </>
      </Breadcrumb>
      <PageContainer
        title="Teklif Hesaplama"
        description="this is Teklif Hesaplama"
      >
        <Grid
          container
          sx={{
            width: "97%",
            margin: "0 auto",
            justifyContent: "space-between",
          }}
        >
          <Grid item>
            <Grid container spacing={2}>
              <Grid item xs={3.6} md={3.8} lg={2.2}>
                <CustomFormLabel
                  htmlFor="genelBilgiler"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                >
                  <Typography variant="h6" p={1}></Typography>
                </CustomFormLabel>
              </Grid>
              <Grid
                item
                xs={3.9}
                md={4.3}
                lg={4.6}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <CustomFormLabel
                  htmlFor="tespit"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                >
                  <Typography variant="h6" p={1}>
                    Tespit
                  </Typography>
                </CustomFormLabel>
              </Grid>
              <Grid
                item
                xs={4.5}
                md={3.9}
                lg={5.2}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CustomFormLabel
                  htmlFor="deger"
                  sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                >
                  <Typography variant="h6" p={1}>
                    Değer
                  </Typography>
                </CustomFormLabel>
                <Tooltip title="Değer Girişi Yaparken Binlik Ayıracı Kullanmayınız">
                  <Fab color="warning" size="small">
                    <IconExclamationMark width={18.25} height={18.25} />
                  </Fab>
                </Tooltip>
              </Grid>
              {fetchedData.map((data, index) =>
                data.siraNo < 22 ? (
                  <Grid
                    item
                    key={data.id}
                    xs={12}
                    md={12}
                    lg={12}
                    sx={{
                      display: "flex",
                      alignContent: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Grid item xs={12} md={8} lg={2}>
                      <CustomFormLabel
                        htmlFor={data.genelBilgi}
                        sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                      >
                        <Typography variant="body1" p={1}>
                          {data.genelBilgi}
                        </Typography>
                      </CustomFormLabel>
                    </Grid>
                    <Grid item xs={10} md={8} lg={4} sx={{ mr: 6 }}>
                      <CustomTextAreaAutoSize
                        id={data.tespit}
                        value={data.tespit}
                        onChange={(e: any) => {
                          // 1) Dizinin kopyasını oluştur
                          const newData = [...fetchedData];
                          // 2) İlgili elemanı güncelle
                          newData[index] = {
                            ...newData[index],
                            tespit: e.target.value.toString(),
                          };
                          // 3) State'e geri at
                          setFetchedData(newData);
                        }}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={15} md={8} lg={5}>
                      {data.siraNo == 1 ? (
                        <CustomSelect
                          labelId={data.deger?.toString()}
                          id={data.deger?.toString()}
                          size="medium"
                          value={data.deger}
                          onChange={(e: any) => {
                            // 1) Dizinin kopyasını oluştur
                            const newData = [...fetchedData];
                            // 2) İlgili elemanı güncelle
                            newData[index] = {
                              ...newData[index],
                              deger: e.target.value.toString(),
                            };
                            // 3) State'e geri at
                            setFetchedData(newData);
                          }}
                          height={"36px"}
                          fullWidth
                        >
                          <MenuItem value={"Bobi"}>Bobi</MenuItem>
                          <MenuItem value={"BobiBüyük"}> Bobi Büyük</MenuItem>
                          <MenuItem value={"Tfrs"}> Tfrs</MenuItem>
                          <MenuItem value={"TfrsDönemsel"}>
                            Tfrs Dönemsel
                          </MenuItem>
                          <MenuItem value={"ÖzelDenetim"}>
                            Özel Denetim
                          </MenuItem>
                        </CustomSelect>
                      ) : (
                        <CustomTextField
                          id={data.deger?.toString()}
                          type={
                            data.siraNo == 3 || data.siraNo == 4
                              ? "date"
                              : "number"
                          }
                          fullWidth
                          disabled={
                            data.siraNo == 18 ||
                            data.siraNo == 19 ||
                            data.siraNo == 20
                              ? true
                              : false
                          }
                          value={data.deger}
                          onChange={(e: any) => {
                            const newData = [...fetchedData];
                            newData[index] = {
                              ...newData[index],
                              deger: e.target.value.toString(),
                            };
                            setFetchedData(newData);
                          }}
                        />
                      )}
                    </Grid>
                  </Grid>
                ) : (
                  <Grid
                    item
                    key={data.id}
                    xs={12}
                    lg={12}
                    sx={{
                      display: "flex",
                      alignContent: "center",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Grid item xs={5} md={5.6} lg={2}>
                      <CustomFormLabel
                        htmlFor={data.genelBilgi}
                        sx={{ mt: 0, mb: { xs: "-10px", sm: 0 }, mr: 2 }}
                      >
                        <Typography variant="body1" p={1}>
                          {data.genelBilgi}
                        </Typography>
                      </CustomFormLabel>
                    </Grid>

                    <Grid item xs={12} md={12} lg={9.67}>
                      <CustomTextField
                        id={data.deger.toString()}
                        type="number"
                        fullWidth
                        disabled={
                          data.siraNo == 22 ||
                          data.siraNo == 28 ||
                          data.siraNo == 29 ||
                          data.siraNo == 35 ||
                          data.siraNo == 36
                            ? true
                            : false
                        }
                        value={data.deger}
                        onChange={(e: any) => {
                          const newData = [...fetchedData];
                          newData[index] = {
                            ...newData[index],
                            deger: e.target.value.toString(),
                          };
                          setFetchedData(newData);
                        }}
                      />
                    </Grid>
                  </Grid>
                )
              )}
            </Grid>
          </Grid>
          {isConfirmPopUpOpen && (
            <ConfirmPopUpComponent
              isConfirmPopUp={isConfirmPopUpOpen}
              handleClose={handleCloseConfirmPopUp}
              handleDelete={handleDeleteTeklifHesaplama}
            />
          )}
        </Grid>
        <Grid
          container
          sx={{
            width: "95%",
            margin: "0 auto",
            justifyContent: "space-between",
          }}
        >
          <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
            <BelgeKontrolCard hazirlayan="Ahmet Geçmiş"></BelgeKontrolCard>
          </Grid>
          <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
            <BelgeKontrolCard onaylayan="Ahmet Geçmiş"></BelgeKontrolCard>
          </Grid>
          <Grid item xs={12} md={3.9} lg={3.9} mt={3}>
            <BelgeKontrolCard kaliteKontrol="Ahmet Geçmiş"></BelgeKontrolCard>
          </Grid>
        </Grid>
      </PageContainer>
    </>
  );
};

export default Page;
