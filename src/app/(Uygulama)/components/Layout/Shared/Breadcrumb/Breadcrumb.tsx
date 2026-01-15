"use client";
import React from "react";
import {
  Grid,
  Typography,
  Box,
  Breadcrumbs,
  Theme,
  ListItemIcon,
  useMediaQuery,
} from "@mui/material";
import NextLink from "next/link";
import { IconChevronLeft, IconCircle } from "@tabler/icons-react";
import { MenuitemsType } from "@/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems";
import { createMenuItems } from "@/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useLoading } from "@/contexts/LoadingContext";
import { usePathname } from "next/navigation";

interface BreadCrumbType {
  subtitle?: string;
  items?: any[];
  title: string;
  children?: JSX.Element;
}

const Breadcrumb = ({ subtitle, items, title, children }: BreadCrumbType) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const { setLoading } = useLoading();
  const pathname = usePathname();

  // useMemo ile menü cache'leniyor - performans iyileştirmesi
  const Menuitems: MenuitemsType[] = React.useMemo(() => createMenuItems(
    user.rol || undefined,
    user.denetimTuru || undefined,
    user.enflasyonmu || undefined,
    user.konsolidemi || undefined,
    user.bddkmi || undefined
  ), [user.rol, user.denetimTuru, user.enflasyonmu, user.konsolidemi, user.bddkmi]);
  const itemsTitle =
    items && items.length > 0
      ? items.map((item) =>
        item.title
          .toUpperCase()
          .replace(/I/g, "İ")
          .replace(/C/g, "Ç")
          .replace(/G/g, "Ğ")
          .replace(/S/g, "Ş")
          .replace(/O/g, "Ö")
          .replace(/U/g, "Ü")
      )[0]
      : "";

  const MenuItem: any =
    itemsTitle &&
    Menuitems.find(
      (item) =>
        item.title
          ?.replace(/I/g, "İ")
          .replace(/C/g, "Ç")
          .replace(/G/g, "Ğ")
          .replace(/S/g, "Ş")
          .replace(/O/g, "Ö")
          .replace(/U/g, "Ü") === itemsTitle
    );

  const Icon = MenuItem && MenuItem?.icon;
  const itemIcon = MenuItem && <Icon stroke={0.8} size="100%" />;

  const handleBreadcrumbClick = (to: string) => {
    // Farklı bir sayfaya gidiyorsa loading göster
    if (pathname !== to) {
      setLoading(true);
    }
  };

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down("md"));
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));
  return (
    <Grid
      container
      alignItems="center"
      sx={{
        backgroundColor: "primary.light",
        borderRadius: (theme: Theme) => theme.shape.borderRadius / 4,
        p: "15px 25px",
        marginBottom: "15px",
        position: "relative",
        overflow: { xs: "visible", sm: "hidden" },
        height: children ? (smDown ? "auto" : "") : "",
        minHeight: children ? "80" : "auto",

      }}
    >
      <Grid
        item
        xs={12}
        sm={6}
        lg={8}
        mb={0}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography variant="h4">{title}</Typography>

        {items && (
          <Breadcrumbs
            separator={null}
            sx={{ alignItems: "center", mt: 0.5, }}
            aria-label="breadcrumb"
          >
            {items
              ? items
                .filter((item) => item.title !== title)
                .map((item) => (
                  <div key={item.title}>
                    {item.to ? (
                      <NextLink
                        href={item.to}
                        passHref
                        onClick={() => handleBreadcrumbClick(item.to)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          color={
                            item.title === subtitle ? "white" : "textSecondary"
                          }
                          sx={{
                            backgroundColor:
                              item.title === subtitle
                                ? "primary.main"
                                : "textSecondary",
                            px: item.title === subtitle ? 1 : 0,
                            borderRadius: (theme: Theme) =>
                              theme.shape.borderRadius / 4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <IconChevronLeft style={{ marginRight: 4 }} />
                          {item.title}
                        </Typography>
                      </NextLink>
                    ) : (
                      <Typography
                        color={
                          item.title === subtitle ? "white" : "textSecondary"
                        }
                        sx={{
                          backgroundColor:
                            item.title === subtitle
                              ? "primary.main"
                              : "textSecondary",
                          px: item.title === subtitle ? 1 : 0,
                          borderRadius: (theme: Theme) =>
                            theme.shape.borderRadius / 4,
                        }}
                      >
                        {item.title}
                      </Typography>
                    )}
                  </div>
                ))
              : ""}
          </Breadcrumbs>
        )}
      </Grid>
      <Grid item xs={12} sm={6} lg={4} display="flex" justifyContent="flex-end" alignItems="center">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 1,
            pr: 2,
            height: "100%"
          }}
        >
          {MenuItem && !mdDown && (
            <Box
              sx={{
                height: "60px",
                width: "60px",
                opacity: 0.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <ListItemIcon
                sx={{
                  color: "inherit",
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "unset",
                  "& svg": {
                    width: "100%",
                    height: "100%"
                  }
                }}
              >
                {itemIcon}
              </ListItemIcon>
            </Box>
          )}
          {children && (
            <Box sx={{ width: "100%", display: "flex", justifyContent: "flex-end" }}>
              {children}
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default Breadcrumb;
