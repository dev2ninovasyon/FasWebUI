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

interface BreadCrumbType {
  subtitle?: string;
  items?: any[];
  title: string;
  children?: JSX.Element;
}

const Breadcrumb = ({ subtitle, items, title, children }: BreadCrumbType) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const Menuitems: MenuitemsType[] = createMenuItems(
    user.rol || undefined,
    user.denetimTuru || undefined,
    user.enflasyonmu || undefined,
    user.konsolidemi || undefined,
    user.bddkmi || undefined
  );

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

  const mdDown = useMediaQuery((theme: any) => theme.breakpoints.down("md"));
  const smDown = useMediaQuery((theme: any) => theme.breakpoints.down("sm"));

  return (
    <Grid
      container
      sx={{
        backgroundColor: "primary.light",
        borderRadius: (theme: Theme) => theme.shape.borderRadius / 4,
        p: "30px 25px 20px",
        marginBottom: "20px",
        position: "relative",
        overflow: "hidden",
        height: children ? (smDown ? "235px" : "") : "",
      }}
    >
      <Grid
        item
        xs={12}
        sm={6}
        lg={8}
        mb={1}
        pl={children ? (mdDown ? "2%" : "10%") : ""}
      >
        <Typography variant="h4">{title}</Typography>

        <Breadcrumbs
          separator={null}
          sx={{ alignItems: "center", mt: items ? "10px" : "" }}
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
      </Grid>
      <Grid item xs={12} sm={6} lg={4} display="flex" alignItems="flex-end">
        <Box
          sx={{
            display: { xs: "block", md: "flex", lg: "flex" },
            alignItems: "center",
            justifyContent: "flex-end",
            width: "100%",
          }}
        >
          {children ? (
            <>
              {MenuItem ? (
                <>
                  {mdDown ? (
                    ""
                  ) : (
                    <Box
                      sx={{
                        bottom: "0",
                        left: children ? "2%" : "unset",
                        right: children ? "unset" : "2%",
                        position: "absolute",
                        height: "100%",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: "inherit",
                          height: "100%",
                          p: "3px 0",
                        }}
                      >
                        {itemIcon}
                      </ListItemIcon>
                    </Box>
                  )}
                </>
              ) : (
                ""
              )}
              <Box
                sx={{
                  bottom: "0",
                  right: "2%",
                  position: "absolute",
                  height: smDown ? "50%" : "100%",
                  width: smDown ? "96%" : "auto",
                }}
              >
                {children}
              </Box>
            </>
          ) : (
            <>
              {MenuItem ? (
                <>
                  {mdDown ? (
                    ""
                  ) : (
                    <Box
                      sx={{
                        bottom: "0",
                        left: children ? "2%" : "unset",
                        right: children ? "unset" : "2%",
                        position: "absolute",
                        height: "100%",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: "inherit",
                          height: "100%",
                          p: "3px 0",
                        }}
                      >
                        {itemIcon}
                      </ListItemIcon>
                    </Box>
                  )}
                </>
              ) : (
                ""
                /*<Box
                  sx={{
                    bottom: "0",
                    right: "2%",
                    position: "absolute",
                    height: "100%",
                  }}
                >
                  <Image
                    src={breadcrumbImg}
                    alt={"breadcrumbImg"}
                    style={{ width: "165px", height: "165px" }}
                    priority
                  />
                </Box>*/
              )}
            </>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default Breadcrumb;
