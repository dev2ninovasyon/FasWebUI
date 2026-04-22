"use client";

import React, { useMemo } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Typography,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import { MenuitemsType } from "@/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems";
import { createMenuItems } from "@/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

interface SearchItemType {
  label: string;
  href: string;
  breadcrumb: string;
  id: string;
  isDynamic?: boolean;
}

function firstLetterUpperCase(str: string | undefined | null) {
  if (!str) return "";
  var words = str.split(" ");
  var newWord = "";
  for (var i = 0; i < words.length; i++) {
    newWord +=
      words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    if (i !== words.length - 1) {
      newWord += " ";
    }
  }
  return newWord;
}

function extractMenuItems(
  menuItems: MenuitemsType[],
  breadcrumbPath: string[] = [],
  seenTitles: Set<string> = new Set()
) {
  const pages: SearchItemType[] = [];

  for (const menuItem of menuItems) {
    if (menuItem.navlabel || !menuItem.title) continue;

    const formattedTitle = firstLetterUpperCase(menuItem.title);
    if (!formattedTitle) continue;

    const currentPath = [...breadcrumbPath, formattedTitle];
    const breadcrumb = currentPath.join(" > ");

    if (seenTitles.has(breadcrumb)) continue;

    const searchItem: SearchItemType = {
      label: formattedTitle,
      breadcrumb: breadcrumb,
      href: menuItem.href || "",
      id: menuItem.id || breadcrumb, // ID yoksa breadcrumb kullan
      isDynamic: false,
    };

    pages.push(searchItem);
    seenTitles.add(breadcrumb);

    if (menuItem.children && menuItem.children.length > 0) {
      pages.push(...extractMenuItems(menuItem.children, currentPath, seenTitles));
    }
  }

  return pages;
}

function extractDynamicMenuItems(dynamicItems: any[], seenTitles: Set<string> = new Set()): SearchItemType[] {
  const pages: SearchItemType[] = [];

  for (const item of dynamicItems) {
    if (!item || !item.name) continue;

    const formattedTitle = firstLetterUpperCase(item.name);
    if (!formattedTitle) continue;

    const breadcrumb = `Maddi Doğrulama Prosedürleri > ${formattedTitle}`;

    const key = `dynamic-${breadcrumb}`;
    if (seenTitles.has(key)) continue;

    const searchItem: SearchItemType = {
      label: formattedTitle,
      breadcrumb: breadcrumb,
      href: item.href || "",
      id: item.id ? `dynamic-${item.id}` : key,
      isDynamic: true,
    };

    pages.push(searchItem);
    seenTitles.add(key);

    if (item.children && item.children.length > 0) {
      for (const child of item.children) {
        if (!child || !child.name) continue;
        const childTitle = firstLetterUpperCase(child.name);
        if (!childTitle) continue;

        const childBreadcrumb = `Maddi Doğrulama Prosedürleri > ${formattedTitle} > ${childTitle}`;
        const childKey = `dynamic-${childBreadcrumb}`;

        if (!seenTitles.has(childKey)) {
          const childSearchItem: SearchItemType = {
            label: childTitle,
            breadcrumb: childBreadcrumb,
            href: child.href || "",
            id: child.id ? `dynamic-${child.id}` : childKey,
            isDynamic: true,
          };
          pages.push(childSearchItem);
          seenTitles.add(childKey);
        }
      }
    }
  }

  return pages;
}

function handleButtonClick(link: string, event?: React.MouseEvent) {
  if (!link) return;
  if (event && (event.ctrlKey || event.metaKey || event.button === 1)) {
    window.open(link, "_blank");
    return;
  }
  window.location.href = link;
}

const SearchBoxAutocomplete = () => {
  const theme = useTheme();
  const user = useSelector((state: AppState) => state.userReducer);
  const dynamicMenu = useSelector((state: AppState) => state.dynamicMenu);
  const [localPages, setLocalPages] = React.useState<SearchItemType[]>([]);

  // useMemo ile menü cache'leniyor - performans iyileştirmesi
  const Menuitems: MenuitemsType[] = useMemo(
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
    [
      user.rol,
      user.denetimTuru,
      user.enflasyonmu,
      user.konsolidemi,
      user.bddkmi,
      user.yil,
      user.yetki,
    ]
  );

  // Menü itemlerini extract et ve state'e kaydet
  React.useEffect(() => {
    const seenTitles = new Set<string>();
    const staticPages = extractMenuItems(Menuitems, [], seenTitles);
    const dynamicPages = extractDynamicMenuItems(
      dynamicMenu.maddiDogrulamaItems || [],
      seenTitles
    );
    const allPages = [...staticPages, ...dynamicPages];
    setLocalPages(allPages);
  }, [Menuitems, dynamicMenu.maddiDogrulamaItems]);

  // Türkçe karakterleri normalize ederek arama yapan custom filter
  const normalizeText = (text: string) => {
    return text
      // Önce büyük harfleri düzelt (toLowerCase() öncesi)
      .replace(/İ/g, "i")
      .replace(/I/g, "i")
      // Sonra küçük harfe dönüştür
      .toLowerCase()
      // Türkçe karakterleri ASCII'ye çevir
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u");
  };

  const filterOptions = (
    options: SearchItemType[],
    { inputValue }: { inputValue: string }
  ) => {
    if (!inputValue) return options;
    
    // Input'taki birden fazla boşlukları tek boşluğa dönüştür ve normalize et
    const normalizedInput = normalizeText(
      inputValue.replace(/\s+/g, " ").trim()
    );

    return options.filter((option) => {
      // Option'ın label ve breadcrumb'ını normalize edip aranır
      const normalizedLabel = normalizeText(
        option.label.replace(/\s+/g, " ").trim()
      );
      const normalizedBreadcrumb = normalizeText(
        option.breadcrumb.replace(/\s+/g, " ").trim()
      );

      return (
        normalizedLabel.includes(normalizedInput) ||
        normalizedBreadcrumb.includes(normalizedInput)
      );
    });
  };

  return (
    <Autocomplete
      id="search-box"
      options={localPages}
      noOptionsText="Bulunamadı"
      size="small"
      fullWidth
      popupIcon={<SearchIcon style={{ color: "gray" }} />}
      filterOptions={filterOptions}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.label}
      onChange={(event, value) => handleButtonClick(value?.href || "")}
      renderOption={(props, option) => {
        const { key, onClick, ...liProps } = props as any;
        const uniqueKey = key || `opt-${option.id}-${option.breadcrumb}`;
        return (
          <Box
            component="li"
            key={uniqueKey}
            {...liProps}
            onClick={(e: React.MouseEvent) => {
              onClick?.(e);
              handleButtonClick(option.href, e);
            }}
            sx={{
              padding: "0 !important",
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
              "&:last-child": { borderBottom: "none" },
              cursor: "pointer",
            }}
          >
            <Box
              component="a"
              href={option.href}
              onClick={(e: React.MouseEvent) => e.preventDefault()}
              sx={{
                display: "block",
                padding: "8px 16px",
                width: "100%",
                textDecoration: "none",
                color: "inherit"
              }}
            >
            <Stack direction="column" spacing={0.5} width="100%">
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: theme.palette.text.primary }}
              >
                {option.label}
              </Typography>
              {option.breadcrumb && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.text.secondary,
                    fontSize: "0.75rem",
                    fontStyle: "italic",
                  }}
                >
                  {option.breadcrumb}
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      );
    }}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder="Ara"
          aria-label="MenuAra"
          color="secondary"
          InputProps={{
            ...params.InputProps,
          }}
        />
      )}
    />
  );
};
export default SearchBoxAutocomplete;
