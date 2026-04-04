"use client";
import React, { useEffect } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import { ChevronDown } from "lucide-react";
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

const getVimeoEmbedUrl = (value?: string) => {
  const url = String(value || "").trim();

  if (!url) {
    return null;
  }

  if (/^\d+$/.test(url)) {
    return `https://player.vimeo.com/video/${url}?badge=0&autopause=0&player_id=0&app_id=58479`;
  }

  const iframeSrcMatch = url.match(/src=["']([^"']+)["']/i);
  const candidateUrl = iframeSrcMatch?.[1] || url;

  try {
    const parsedUrl = new URL(candidateUrl);
    const pathParts = parsedUrl.pathname.split("/").filter(Boolean);
    const videoId = pathParts.find((item) => /^\d+$/.test(item)) || pathParts[pathParts.length - 1];

    if (
      (parsedUrl.hostname.includes("vimeo.com") || parsedUrl.hostname.includes("player.vimeo.com")) &&
      /^\d+$/.test(videoId || "")
    ) {
      return `https://player.vimeo.com/video/${videoId}?badge=0&autopause=0&player_id=0&app_id=58479`;
    }

    return candidateUrl;
  } catch {
    return candidateUrl;
  }
};

const formatUsageDate = (value?: string) => {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
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
  const videoEmbedUrl = getVimeoEmbedUrl(usageData?.video?.url);

  // Debug logging for FAQ data
  useEffect(() => {
    if (open && usageData) {
      console.log("[MenuUsageDrawer Debug]", {
        baslik: usageData.baslik,
        sikSorulanSorularLength: usageData.sikSorulanSorular?.length || 0,
        sikSorulanSorular: usageData.sikSorulanSorular,
        kullanimNotu: usageData.kullanimNotu?.substring(0, 100),
        kullanimAdimlariLength: usageData.kullanimAdimlari?.length || 0,
        dikkatEdileceklerLength: usageData.dikkatEdilecekler?.length || 0,
        hasVideo: usageData.hasVideo,
        videoUrl: usageData.video?.url?.substring(0, 100),
      });
    }
  }, [open, usageData]);
  const hasManualContent = Boolean(
    usageData?.kullanimNotu ||
      usageData?.kullanimAdimlari?.length ||
      usageData?.dikkatEdilecekler?.length ||
      usageData?.sikSorulanSorular?.length
  );
  const hasUsageContent = Boolean(
    hasManualContent ||
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
          width: { xs: "100%", md: "40%" },
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
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background:
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, #0f1722 0%, #172033 100%)"
                : "linear-gradient(135deg, #eef5ff 0%, #f7fbff 100%)",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="overline" sx={{ letterSpacing: 1.4, fontWeight: 700, color: "text.secondary" }}>
            SAYFA KULLANIM REHBERİ
          </Typography>

          <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
            <X size={18} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, p: { xs: 2.5, md: 3.5 }, overflowY: "auto", backgroundColor: "background.default" }}>
          {!isLoading && (
            <Box sx={{ mb: 3.5 }}>
              <Stack direction="row" spacing={2.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "primary.main",
                    backgroundColor: theme.palette.mode === "dark" ? "rgba(144, 202, 249, 0.08)" : "rgba(25, 118, 210, 0.08)",
                    flexShrink: 0,
                  }}
                >
                  {icon || <Info size={24} />}
                </Box>
                <Stack spacing={0.75}>
                  <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2, color: "text.primary" }}>
                    {usageData?.baslik || `${title} nasıl kullanılır?`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640, lineHeight: 1.6 }}>
                    {usageData?.ozet || "Bu panel, ilgili ekranın ne amaçla kullanıldığını ve hangi adımlarla ilerlemeniz gerektiğini açıklar."}
                  </Typography>
                </Stack>
              </Stack>
              <Divider sx={{ mt: 3 }} />
            </Box>
          )}
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
                      Son güncelleme: {formatUsageDate(usageData.eklenmeTarihi)}
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

              {!hasManualContent &&
                !!usageData.kullanimSemasi &&
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

              {usageData.kullanimAdimlari && usageData.kullanimAdimlari.length > 0 && (
                <Paper variant="outlined" sx={sectionCardSx}>
                  <SectionHeader icon={<ListChecks size={18} />} title="Adım Adım Nasıl Kullanılır?" />
                  <Stack spacing={1.25}>
                    {usageData.kullanimAdimlari.map((step, index) => (
                      <Stack key={`step-${index}-${step?.substring(0, 20) || index}`} direction="row" spacing={1.5} alignItems="flex-start">
                        <Chip label={index + 1} size="small" color="primary" sx={{ minWidth: 32 }} />
                        <Typography variant="body2" sx={{ lineHeight: 1.7, pt: 0.2, whiteSpace: "pre-wrap" }}>
                          {step || `Adım ${index + 1}`}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Paper>
              )}

              {usageData.dikkatEdilecekler && usageData.dikkatEdilecekler.length > 0 && (
                <Paper variant="outlined" sx={sectionCardSx}>
                  <SectionHeader icon={<Lightbulb size={18} />} title="Dikkat Edilecekler" />
                  <Stack spacing={1}>
                    {usageData.dikkatEdilecekler.map((note, index) => (
                      <Alert key={`note-${index}-${note?.substring(0, 20) || index}`} severity="info" variant="outlined">
                        {note || `Not ${index + 1}`}
                      </Alert>
                    ))}
                  </Stack>
                </Paper>
              )}

              {usageData.sikSorulanSorular && usageData.sikSorulanSorular.length > 0 && (
                <Paper variant="outlined" sx={sectionCardSx}>
                  <SectionHeader icon={<CircleHelp size={18} />} title="Sık Sorulan Sorular" />
                  <Stack spacing={0}>
                    {usageData.sikSorulanSorular.map((item, index) => (
                      <Accordion key={`faq-${index}-${item?.soru?.substring(0, 20) || index}`} sx={{ 
                        backgroundColor: "transparent",
                        backgroundImage: "none",
                        boxShadow: "none",
                        borderBottom: index < usageData.sikSorulanSorular.length - 1 ? `1px solid ${theme.palette.divider}` : "none",
                        "&:before": {
                          display: "none",
                        },
                        "&.Mui-expanded": {
                          margin: 0,
                        }
                      }}>
                        <AccordionSummary expandIcon={<ChevronDown size={18} />} sx={{ py: 1 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: "text.primary" }}>
                            {item?.soru || `Soru ${index + 1}`}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                            {item?.cevap || "Cevap yükleniyor..."}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
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
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {usageData.video.aciklama}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      overflow: "hidden",
                      borderRadius: 2,
                      backgroundColor: "#000",
                      pt: "56.25%",
                    }}
                  >
                    <Box
                      component="iframe"
                      src={videoEmbedUrl || usageData.video.url}
                      title={usageData.video.baslik || `${title} video anlatımı`}
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
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
                <Alert severity="info" sx={{ borderRadius: 2 }}>
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
