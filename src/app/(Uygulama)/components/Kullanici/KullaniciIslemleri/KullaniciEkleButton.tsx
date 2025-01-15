import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { url } from "@/api/apiBase";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

const KullaniciEkleButton = () => {
  const [showDrawer2, setShowDrawer2] = useState(false);
  const [denetciId, setDeneticiId] = useState(0);
  const [personelDosyaArsivId, setPersonelDosyaArsivId] = useState("abcd");

  const [bdSicilNo, setBdSicilNo] = useState("");
  const [personelAdi, setPersonelAdi] = useState("");
  const [unvani, setUnvani] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [gsm, setGsm] = useState("");
  const [sifre, setSifre] = useState("");
  const [aktifPasif, setAktifPasif] = useState(true);

  const router = useRouter();

  const handleDrawerClose2 = () => {
    setShowDrawer2(false);
  };

  const handleRouteClick = () => {
    router.push("/Kullanici/KullaniciIslemleri/KullaniciEkle");
  };

  const handleButtonClick = async () => {
    try {
      const response = await fetch(`${url}/Kullanici`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          denetciId,
          unvani,
          personelAdi,
          tel,
          gsm,
          email,
          sifre,
          personelDosyaArsivId,
          aktifPasif,
        }),
      });

      if (response.ok) {
        handleDrawerClose2();
      } else {
        console.error("Kullanıcı ekleme başarısız");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  return (
    <>
      <Stack
        spacing={1}
        direction="row"
        justifyContent="start"
        marginBottom={4}
      >
        <Button
          color="primary"
          onClick={
            () => handleRouteClick()
            /*() => setShowDrawer2(true)*/
          }
          startIcon={<IconPlus width={18} />}
        >
          Kullanıcı Ekle
        </Button>
      </Stack>
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
              Kullanıcı Ekle
            </Typography>
            <IconButton size="small" onClick={handleDrawerClose2}>
              <IconX size="18" />
            </IconButton>
          </Stack>
        </DialogContent>
        <Divider />
        <Box p={3} sx={{ height: "auto" }}>
          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              B.D Sicil No
            </Typography>
            <CustomTextField
              fullWidth
              id="bdSicilNo"
              name="bdSicilNo"
              onChange={(e: any) => setBdSicilNo(e.target.value)}
            />
          </Box>
          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              Personel Adı
            </Typography>
            <CustomTextField
              fullWidth
              id="personelAdi"
              name="personelAdi"
              onChange={(e: any) => setPersonelAdi(e.target.value)}
            />
          </Box>
          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              Ünvanı
            </Typography>
            <CustomTextField
              fullWidth
              id="unvan"
              name="unvan"
              onChange={(e: any) => setUnvani(e.target.value)}
            />
          </Box>

          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              Email
            </Typography>
            <CustomTextField
              fullWidth
              id="email"
              name="email"
              onChange={(e: any) => setEmail(e.target.value)}
            />
          </Box>
          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              Tel
            </Typography>
            <CustomTextField
              fullWidth
              id="tel"
              name="tel"
              onChange={(e: any) => setTel(e.target.value)}
            />
          </Box>
          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              Gsm
            </Typography>
            <CustomTextField
              fullWidth
              id="gsm"
              name="gsm"
              onChange={(e: any) => setGsm(e.target.value)}
            />
          </Box>
          <Box marginBottom={3}>
            <Typography variant="h6" p={1}>
              Şifre
            </Typography>
            <CustomTextField
              fullWidth
              id="password"
              name="email"
              onChange={(e: any) => setSifre(e.target.value)}
            />
          </Box>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={handleButtonClick}
          >
            Kullanıcı Ekle
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default KullaniciEkleButton;
