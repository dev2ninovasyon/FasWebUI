// src/app/(Uygulama)/components/Dashboard/SonIslemlerKartlari.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  Avatar,
  ButtonBase,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { getUserRecentActions, UserActionDto } from "@/api/AnaSayfa/AnaSayfa";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EditNoteIcon from "@mui/icons-material/EditNote";

export function SonIslemlerKartlari() {
  const theme = useTheme();
  const router = useRouter();
  const user = useSelector((state: AppState) => state.userReducer);

  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<UserActionDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Gerekli bilgiler yoksa istek atma
    if (!user.token || !user.denetlenenId || !user.yil) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await getUserRecentActions(
          user.token || "",
          user.id||0,
          user.denetlenenId||0,
          user.yil||0,
          30 // server max 30 log dönsün, ekranda biz 6–8 gösteriyoruz
        );
        setActions(data || []);
      } catch (err: any) {
        setError(err.message || "Son işlemler alınırken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.token, user.denetlenenId, user.yil]);

  if (!user.token) return null;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box py={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (actions.length === 0) {
    return (
      <Box py={2}>
        <Typography color="textSecondary">
          Seçili denetlenen ve yıl için kaydedilmiş bir işleminiz bulunmuyor.
        </Typography>
      </Box>
    );
  }

  const getCardPalette = (index: number) => {
    const palettes = [
      { bg: theme.palette.primary.light, text: theme.palette.primary.main },
      { bg: theme.palette.warning.light, text: theme.palette.warning.main },
      { bg: theme.palette.info.light, text: theme.palette.info.main },
      { bg: theme.palette.error.light, text: theme.palette.error.main },
      { bg: theme.palette.success.light, text: theme.palette.success.main },
      { bg: theme.palette.secondary.light, text: theme.palette.secondary.main },
    ];
    return palettes[index % palettes.length];
  };

  const getStatusChip = (statusCode: number, isError: boolean) => {
    const isSuccess = !isError && statusCode >= 200 && statusCode < 300;

    return (
      <Chip
        size="small"
        label={isSuccess ? "Başarılı" : "Hata"}
        icon={
          isSuccess ? (
            <CheckCircleIcon fontSize="small" />
          ) : (
            <ErrorOutlineIcon fontSize="small" />
          )
        }
        sx={{
          bgcolor: isSuccess
            ? theme.palette.success.main
            : theme.palette.error.main,
          color: theme.palette.common.white,
          height: 22,
        }}
      />
    );
  };

  const getMethodLabel = (method?: string) => {
    switch (method?.toUpperCase()) {
      case "GET":
        return "Görüntüleme";
      case "POST":
        return "Kayıt / İşlem";
      case "PUT":
      case "PATCH":
        return "Güncelleme";
      case "DELETE":
        return "Silme";
      default:
        return "İşlem";
    }
  };

  return (
    <Box mt={2}>
      <Typography variant="h6" gutterBottom>
        Son Yaptığınız İşlemler
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Son
        çalıştığınız ekranlar. Kartlara tıklayarak ilgili sayfayı yeniden
        açabilirsiniz.
      </Typography>

      <Grid container spacing={2}>
        {actions.slice(0, 6).map((action, index) => {
          const { bg, text } = getCardPalette(index);
          const created = new Date(action.createdAt);
          const createdText = created.toLocaleString("tr-TR");

          const title = action.friendlyTitle || action.title || "İşlem";
          const message =
            action.friendlyMessage ||
            action.subtitle ||
            getMethodLabel(action.httpMethod);

          const handleOpenPage = () => {
            if (action.clientUrl) {
              router.push(action.clientUrl);
            }
          };

          const isClickable = !!action.clientUrl;

          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={action.id}>
              <ButtonBase
                onClick={handleOpenPage}
                disabled={!isClickable}
                sx={{
                  width: "100%",
                  borderRadius: 3,
                  textAlign: "left",
                }}
              >
                <Card
                  sx={{
                    width: "100%",
                    borderRadius: 3,
                    backgroundColor: bg,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    transition: "all 0.2s ease",
                    "&:hover": isClickable
                      ? {
                          transform: "translateY(-3px)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        }
                      : undefined,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1.5}
                    >
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.common.white,
                          color: text,
                          width: 40,
                          height: 40,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {action.isError ? (
                          <ErrorOutlineIcon />
                        ) : (
                          <EditNoteIcon />
                        )}
                      </Avatar>

                      {getStatusChip(action.statusCode, action.isError)}
                    </Stack>

                    <Box mt={2}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: text, fontWeight: 600 }}
                      >
                        {title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, color: text, opacity: 0.9 }}
                      >
                        {message}
                      </Typography>
                    </Box>

                    <Box mt={1.5}>
                      <Typography
                        variant="caption"
                        sx={{ color: text, opacity: 0.8, display: "block" }}
                      >
                        {createdText}
                      </Typography>
                      {action.clientUrl && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: text,
                            opacity: 0.95,
                            fontWeight: 500,
                            display: "block",
                            mt: 0.5,
                          }}
                        >
                          Sayfayı açmak için tıklayın
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </ButtonBase>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
