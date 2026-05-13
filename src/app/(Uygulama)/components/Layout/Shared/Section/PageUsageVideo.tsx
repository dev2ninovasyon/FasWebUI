"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Clapperboard, Info } from "lucide-react";
import { usePathname } from "next/navigation";
import { getMenus, getMenuUsagePanelByMenuId, Menu as ApiMenu, MenuUsagePanel } from "@/api/Menu/Menu";

let globalMenusCache: ApiMenu[] | null = null;

const getVimeoEmbedUrl = (value?: string) => {
  const url = String(value || "").trim();
  if (!url) return null;
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

const PageUsageVideo: React.FC = () => {
  const theme = useTheme();
  const pathname = usePathname();
  const [usageData, setUsageData] = useState<MenuUsagePanel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resolveCurrentMenu = (menus: ApiMenu[]) => {
    return menus
      .filter((menu) => !!menu.formUrl)
      .sort((a, b) => (b.formUrl?.length || 0) - (a.formUrl?.length || 0))
      .find((menu) => menu.formUrl === pathname || (menu.formUrl && menu.formUrl !== "/" && pathname.startsWith(menu.formUrl)));
  };

  useEffect(() => {
    const fetchUsage = async () => {
      setIsLoading(true);
      try {
        let menus = globalMenusCache;
        if (!menus || menus.length === 0) {
          menus = await getMenus();
          globalMenusCache = menus;
        }

        const currentMenu = resolveCurrentMenu(menus);

        if (currentMenu?.id) {
          const usage = await getMenuUsagePanelByMenuId(currentMenu.id);
          setUsageData(usage);
        }
      } catch (error) {
        console.error("Kullanim videosu yuklenirken hata:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, [pathname]);

  if (isLoading || !usageData?.hasVideo || !usageData?.video?.url) {
    return null;
  }

  const videoEmbedUrl = getVimeoEmbedUrl(usageData.video.url);

  return (
    <Box mt={3} mb={2}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 1.5,
            backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Clapperboard size={18} color={theme.palette.primary.main} />
            <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
              SAYFA KULLANIM REHBERİ
            </Typography>
          </Stack>
        </Box>
        <Divider />
        <CardContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: usageData.video.aciklama ? 7 : 12 }}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: 2,
                  backgroundColor: "#000",
                  pt: "56.25%", // 16:9 Aspect Ratio
                  boxShadow: theme.shadows[4],
                }}
              >
                <Box
                  component="iframe"
                  src={videoEmbedUrl || usageData.video.url}
                  title={usageData.video.baslik || "Sayfa kullanım videosu"}
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                  allowFullScreen
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
            </Grid>
            {usageData.video.aciklama && (
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={1.5}>
                  <Typography variant="h6" fontWeight={700}>
                    {usageData.video.baslik || "Video Hakkında"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                    {usageData.video.aciklama}
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === "dark" ? "rgba(144, 202, 249, 0.08)" : "rgba(25, 118, 210, 0.05)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                    }}
                  >
                    <Info size={18} style={{ marginTop: 2, flexShrink: 0, color: theme.palette.primary.main }} />
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                      Bu video, sayfanın temel işlevlerini ve dikkat edilmesi gereken noktaları anlatmaktadır. Daha fazla bilgi için yukarıdaki "i" ikonuna tıklayabilirsiniz.
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PageUsageVideo;
