"use client";
import React, { useState } from "react";
import {
  Grid,
  Typography,
  Box,
  Breadcrumbs,
  Theme,
  useMediaQuery,
  IconButton,
  Menu,
  Stack,
} from "@mui/material";
import NextLink from "next/link";
import { IconChevronLeft, IconDotsVertical } from "@tabler/icons-react";
import { MenuitemsType, createMenuItems } from "@/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useLoading } from "@/contexts/LoadingContext";
import { usePathname } from "next/navigation";
import { getMenus, getMenuUsagePanelByMenuId, incrementMenuUsageView, Menu as ApiMenu, MenuUsagePanel } from "@/api/Menu/Menu";
import MenuUsageDrawer from "./MenuUsageDrawer";
import { Info } from "lucide-react";

interface BreadCrumbType {
  subtitle?: string;
  items?: any[];
  title: string;
  children?: React.ReactNode;
}

let globalMenusCache: ApiMenu[] | null = null;

const Breadcrumb = ({ subtitle, items, title, children }: BreadCrumbType) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { setLoading } = useLoading();
  const pathname = usePathname();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const menuItems: MenuitemsType[] = React.useMemo(
    () =>
      createMenuItems(
        user.rol || undefined,
        user.denetimTuru || undefined,
        user.enflasyonmu || undefined,
        user.konsolidemi || undefined,
        user.bddkmi || undefined,
        user.yil || undefined,
        user.yetki || undefined
      ),
    [user.rol, user.denetimTuru, user.enflasyonmu, user.konsolidemi, user.bddkmi, user.yil, user.yetki]
  );

  const itemsTitle = items && items.length > 0 ? items.map((item) => item.title.toUpperCase().replace(/I/g, "İ"))[0] : "";
  const menuItemData: any = itemsTitle && menuItems.find((item) => item.title?.toUpperCase() === itemsTitle);
  const headerIcon = menuItemData?.icon;
  const itemIcon = headerIcon ? React.createElement(headerIcon, { strokeWidth: 1.5, size: 22 }) : null;

  const handleBreadcrumbClick = (to: string) => {
    if (pathname !== to) {
      setLoading(true);
    }
  };

  const smDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const [isUsageDrawerOpen, setIsUsageDrawerOpen] = useState(false);
  const [usageData, setUsageData] = useState<MenuUsagePanel | null>(null);
  const [isUsageLoading, setIsUsageLoading] = useState(false);

  const resolveCurrentMenu = (menus: ApiMenu[]) => {
    return menus
      .filter((menu) => !!menu.formUrl)
      .sort((a, b) => (b.formUrl?.length || 0) - (a.formUrl?.length || 0))
      .find((menu) => menu.formUrl === pathname || (menu.formUrl && menu.formUrl !== "/" && pathname.startsWith(menu.formUrl)));
  };

  const handleOpenUsage = async () => {
    setIsUsageDrawerOpen(true);
    setIsUsageLoading(true);

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

        if (usage) {
          void incrementMenuUsageView(currentMenu.id).then((updatedCount) => {
            if (typeof updatedCount === "number") {
              setUsageData((prev) => (prev ? { ...prev, hitCount: updatedCount } : prev));
            }
          });
        }
      } else {
        setUsageData(null);
      }
    } catch (error) {
      console.error("Kullanim bilgisi yuklenirken hata:", error);
      setUsageData(null);
    } finally {
      setIsUsageLoading(false);
    }
  };

  return (
    <Grid
      container
      alignItems="center"
      sx={{
        backgroundColor: (theme: Theme) => (theme.palette.mode === "dark" ? "#0e121a" : theme.palette.primary.light),
        borderRadius: (theme: Theme) => (theme.shape.borderRadius as number) / 4,
        p: "20px 25px",
        marginBottom: "15px",
        position: "relative",
        overflow: "hidden",
        minHeight: "90px",
      }}
    >
      <Grid
        sx={{ zIndex: 1 }}
        size={{
          xs: 9,
          sm: 8,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography
            variant="h4"
            sx={{
              color: (theme: Theme) => theme.palette.text.primary,
            }}
          >
            {title}
          </Typography>
          <IconButton
            size="small"
            onClick={handleOpenUsage}
            sx={{
              color: (theme: Theme) => theme.palette.primary.main,
              "&:hover": { backgroundColor: (theme: Theme) => theme.palette.primary.light },
              ml: 0.5,
            }}
            title="Kullanim Bilgisi"
          >
            <Info size={18} />
          </IconButton>
        </Stack>
        {items && (
          <Breadcrumbs separator={null} sx={{ alignItems: "center", mt: 0.5 }} aria-label="breadcrumb">
            {items
              .filter((item) => item.title !== title)
              .map((item) => (
                <div key={item.title}>
                  {item.to ? (
                    <NextLink href={item.to} passHref onClick={() => handleBreadcrumbClick(item.to)} style={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        sx={{
                          color: (theme: Theme) => theme.palette.text.primary,
                          backgroundColor: (theme: Theme) =>
                            item.title === subtitle
                              ? theme.palette.mode === "dark"
                                ? theme.palette.primary.dark
                                : theme.palette.primary.main
                              : "transparent",
                          px: item.title === subtitle ? 1 : 0,
                          borderRadius: (theme: Theme) => (theme.shape.borderRadius as number) / 4,
                          display: "flex",
                          alignItems: "center",
                          fontSize: "0.875rem",
                        }}
                      >
                        <IconChevronLeft size="16" style={{ marginRight: 4 }} />
                        {item.title}
                      </Typography>
                    </NextLink>
                  ) : (
                    <Typography sx={{ fontSize: "0.875rem" }}>{item.title}</Typography>
                  )}
                </div>
              ))}
          </Breadcrumbs>
        )}
      </Grid>

      <Grid
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        sx={{ zIndex: 1 }}
        size={{
          xs: 3,
          sm: 4,
        }}
      >
        {children && (
          <>
            {smDown ? (
              <>
                <IconButton onClick={handleOpenMenu} color="primary">
                  <IconDotsVertical />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleCloseMenu}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  TransitionComponent={Box as any}
                  slotProps={{
                    paper: {
                      sx: {
                        p: 2,
                        minWidth: "200px",
                        borderRadius: "8px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      },
                    },
                  }}
                >
                  <div style={{ outline: "none" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        width: "100%",
                        gap: 2,
                      }}
                    >
                      {React.Children.map(React.Children.toArray(children), (child) => (
                        <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>{child}</Box>
                      ))}
                    </Box>
                  </div>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>{children}</Box>
            )}
          </>
        )}
      </Grid>

      <MenuUsageDrawer
        open={isUsageDrawerOpen}
        onClose={() => setIsUsageDrawerOpen(false)}
        title={title}
        icon={itemIcon}
        usageData={usageData}
        isLoading={isUsageLoading}
      />
    </Grid>
  );
};

export default Breadcrumb;
