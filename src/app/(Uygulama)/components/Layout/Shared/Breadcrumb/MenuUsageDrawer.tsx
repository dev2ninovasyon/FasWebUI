"use client";
import React from "react";
import {
  Alert,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { BookOpen, CircleHelp, Clapperboard, Clock3, Info, Lightbulb, ListChecks, X } from "lucide-react";
import { MenuUsagePanel } from "@/api/Menu/Menu";

interface MenuUsageDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  usageData: MenuUsagePanel | null;
  isLoading?: boolean;
}

const sectionCardSx = {
  p: 2.5,
  borderRadius: 3,
};

const getEmbedUrl = (url?: string) => {
  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtube.com")) {
      const videoId = parsedUrl.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (parsedUrl.hostname.includes("youtu.be")) {
      const videoId = parsedUrl.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    return url;
  } catch {
    return url;
  }
};

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", color: "primary.main" }}>{icon}</Box>
    <Typography variant="subtitle1" fontWeight={700}>
      {title}
    </Typography>
  </Stack>
);

const MenuUsageDrawer: React.FC<MenuUsageDrawerProps> = ({ open, onClose, title, icon, usageData, isLoading }) => {
  const theme = useTheme();
  const embedUrl = getEmbedUrl(usageData?.video?.url);
  const hasUsageContent = Boolean(
    usageData?.kullanimNotu ||
      usageData?.kullanimSemasi?.onKosullar?.length ||
      usageData?.kullanimSemasi?.buSayfadaYapacaklariniz?.length ||
      usageData?.kullanimSemasi?.sonrakiAdimlar?.length ||
      usageData?.kullanimSemasi?.hataRiskiYuksekAlanlar?.length ||
      usageData?.kullanimAdimlari?.length ||
      usageData?.dikkatEdilecekler?.length ||
      usageData?.sikSorulanSorular?.length ||
      usageData?.hasVideo
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 720, lg: 860 },
          p: 0,
          maxWidth: "100%",
          fontFamily: "inherit",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column", fontFamily: "inherit" }}>
        <Box
          sx={{
            px: { xs: 2.5, md: 4 },
            py: { xs: 2.5, md: 3 },
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #0f1722 0%, #172033 100%)"
                : "linear-gradient(135deg, #eef5ff 0%, #f7fbff 100%)",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack spacing={2} sx={{ pr: 2, flex: 1 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                  backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(25, 118, 210, 0.08)",
                  border: `1px solid ${theme.palette.divider}`,
                  flexShrink: 0,
                }}
              >
                {icon || <Info size={22} />}
              </Box>
              <Stack spacing={0.25}>
                <Typography variant="overline" sx={{ letterSpacing: 1.4, color: "text.secondary" }}>
                  SAYFA KULLANIM REHBERİ
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  {usageData?.baslik || `${title} nasıl kullanılır?`}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 560 }}>
                  {usageData?.ozet || "Bu panel, ilgili ekranın ne amaçla kullanıldığını ve hangi adımlarla ilerlemeniz gerektiğini açıklar."}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
            <X size={18} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, p: { xs: 2.5, md: 3.5 }, overflowY: "auto", backgroundColor: "background.default" }}>
          {isLoading ? (
            <Paper variant="outlined" sx={{ ...sectionCardSx, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                Kullanım bilgisi yükleniyor...
              </Typography>
            </Paper>
          ) : usageData && hasUsageContent ? (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ ...sectionCardSx, backgroundColor: "background.paper" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Clock3 size={16} color={theme.palette.text.secondary} />
                    <Typography variant="caption" color="text.secondary">
                      Son güncelleme: {new Date(usageData.eklenmeTarihi).toLocaleDateString("tr-TR")}
                    </Typography>
                  </Stack>
                  <Chip label={`${usageData.hitCount} görüntüleme`} size="small" variant="outlined" />
                </Stack>
              </Paper>

              {!!usageData.kullanimNotu && (
                <Paper variant="outlined" sx={sectionCardSx}>
                  <SectionHeader icon={<BookOpen size={18} />} title="Genel Açıklama" />
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>
                    {usageData.kullanimNotu}
                  </Typography>
                </Paper>
              )}

              {!!usageData.kullanimSemasi &&
                (usageData.kullanimSemasi.onKosullar.length > 0 ||
                  usageData.kullanimSemasi.buSayfadaYapacaklariniz.length > 0 ||
                  usageData.kullanimSemasi.sonrakiAdimlar.length > 0 ||
                  usageData.kullanimSemasi.hataRiskiYuksekAlanlar.length > 0) && (
                  <Paper variant="outlined" sx={sectionCardSx}>
                    <SectionHeader icon={<Info size={18} />} title="Kullanım Şeması" />
                    <Stack spacing={2}>
                      {usageData.kullanimSemasi.onKosullar.length > 0 && (
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                            Önce Bunları Kontrol Edin
                          </Typography>
                          <Stack spacing={0.75}>
                            {usageData.kullanimSemasi.onKosullar.map((item, index) => (
                              <Typography key={`on-kosul-${index}-${item}`} variant="body2" sx={{ lineHeight: 1.7 }}>
                                {`\u2022 ${item}`}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {usageData.kullanimSemasi.buSayfadaYapacaklariniz.length > 0 && (
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                            Bu Sayfada Yapacaklarınız
                          </Typography>
                          <Stack spacing={0.75}>
                            {usageData.kullanimSemasi.buSayfadaYapacaklariniz.map((item, index) => (
                              <Typography key={`yapacaklar-${index}-${item}`} variant="body2" sx={{ lineHeight: 1.7 }}>
                                {`\u2022 ${item}`}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {usageData.kullanimSemasi.sonrakiAdimlar.length > 0 && (
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                            Sonraki Adımlar
                          </Typography>
                          <Stack spacing={0.75}>
                            {usageData.kullanimSemasi.sonrakiAdimlar.map((item, index) => (
                              <Typography key={`sonraki-${index}-${item}`} variant="body2" sx={{ lineHeight: 1.7 }}>
                                {`\u2022 ${item}`}
                              </Typography>
                            ))}
                          </Stack>
                        </Box>
                      )}

                      {usageData.kullanimSemasi.hataRiskiYuksekAlanlar.length > 0 && (
                        <Box>
                          <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                            Hata Oluşabilecek Alanlar
                          </Typography>
                          <Stack spacing={1}>
                            {usageData.kullanimSemasi.hataRiskiYuksekAlanlar.map((item, index) => (
                              <Alert key={`risk-${index}-${item}`} severity="warning" variant="outlined">
                                {item}
                              </Alert>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                )}

              {usageData.kullanimAdimlari.length > 0 && (
                <Paper variant="outlined" sx={sectionCardSx}>
                  <SectionHeader icon={<ListChecks size={18} />} title="Adım Adım Nasıl Kullanılır?" />
                  <Stack spacing={1.25}>
                    {usageData.kullanimAdimlari.map((step, index) => (
                      <Stack key={`${index}-${step}`} direction="row" spacing={1.5} alignItems="flex-start">
                        <Chip label={index + 1} size="small" color="primary" sx={{ minWidth: 32 }} />
                        <Typography variant="body2" sx={{ lineHeight: 1.7, pt: 0.2 }}>
                          {step}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              )}

              {usageData.dikkatEdilecekler.length > 0 && (
                <Paper variant="outlined" sx={sectionCardSx}>
                  <SectionHeader icon={<Lightbulb size={18} />} title="Dikkat Edilecekler" />
                  <Stack spacing={1}>
                    {usageData.dikkatEdilecekler.map((note, index) => (
                      <Alert key={`${index}-${note}`} severity="info" variant="outlined">
                        {note}
                      </Alert>
                    ))}
                  </Stack>
                </Paper>
              )}

              {usageData.sikSorulanSorular.length > 0 && (
                <Paper variant="outlined" sx={sectionCardSx}>
                  <SectionHeader icon={<CircleHelp size={18} />} title="Sık Sorulan Sorular" />
                  <Stack spacing={1.5}>
                    {usageData.sikSorulanSorular.map((item, index) => (
                      <Box key={`${index}-${item.soru || "faq"}`}>
                        <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                          {item.soru}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {item.cevap}
                        </Typography>
                        {index < usageData.sikSorulanSorular.length - 1 && <Divider sx={{ mt: 1.5 }} />}
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}

              {usageData.hasVideo && usageData.video?.url && (
                <Paper variant="outlined" sx={sectionCardSx}>
                  <SectionHeader icon={<Clapperboard size={18} />} title="Anlatım Videosu" />
                  {!!usageData.video.baslik && (
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 0.75 }}>
                      {usageData.video.baslik}
                    </Typography>
                  )}
                  {!!usageData.video.aciklama && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {usageData.video.aciklama}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      overflow: "hidden",
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: "#000",
                      "&::before": {
                        content: '""',
                        display: "block",
                        paddingTop: "56.25%",
                      },
                    }}
                  >
                    <Box
                      component="iframe"
                      src={embedUrl || usageData.video.url}
                      title={usageData.video.baslik || `${title} video anlatımı`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      sx={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        border: 0,
                      }}
                    />
                  </Box>
                </Paper>
              )}
            </Stack>
          ) : usageData ? (
            <Stack spacing={2}>
              <Paper
                variant="outlined"
                sx={{
                  ...sectionCardSx,
                  background:
                    theme.palette.mode === "dark"
                      ? "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"
                      : "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${theme.palette.divider}`,
                      color: "text.secondary",
                    }}
                  >
                    <Info size={20} strokeWidth={1.8} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Bu sayfa için ayrıntılı içerik henüz tamamlanmamış
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Üst başlık bilgisi hazır; detay adımları eklendiğinde bu alan otomatik zenginleşecek.
                    </Typography>
                  </Box>
                </Stack>
                <Alert severity="info" variant="outlined" sx={{ borderRadius: 2 }}>
                  Sayfa bazlı kullanım adımları, dikkat notları ve istenirse video bağlantısı tanımlandığında burada otomatik görünecek.
                </Alert>
              </Paper>
            </Stack>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                ...sectionCardSx,
                mt: 2,
                maxWidth: 620,
                mx: "auto",
                textAlign: "center",
                background:
                  theme.palette.mode === "dark"
                    ? "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)"
                    : "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 2,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `1px solid ${theme.palette.divider}`,
                  color: "text.secondary",
                }}
              >
                <Info size={24} strokeWidth={1.8} />
              </Box>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Bu ekran için rehber içeriği henüz hazır değil
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, mx: "auto", lineHeight: 1.8 }}>
                Rehber kaydı oluşturulduğunda bu alan otomatik olarak adımlar, dikkat notları ve varsa video anlatımı ile dolacaktır.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default MenuUsageDrawer;
