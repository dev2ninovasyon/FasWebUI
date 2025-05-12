import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import SearchIcon from "@mui/icons-material/Search";
import { MenuitemsType } from "@/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems";
import { createMenuItems } from "@/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import CustomTextField from "@/app/(Uygulama)/components/Forms/ThemeElements/CustomTextField";

const pages: { label: string; href: string }[] = [];

function firstLetterUpperCase(str: string) {
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

const seenTitles = new Map<string, string>();

function extractMenuItems(menuItems: MenuitemsType[]) {
  for (const menuItem of menuItems) {
    if (!menuItem.title) continue;

    const formattedTitle = firstLetterUpperCase(menuItem.title);
    const formattedParentTitle = firstLetterUpperCase(
      menuItem.parentTitle || ""
    );

    let finalTitle = formattedTitle;

    if (menuItem.parentTitle && formattedParentTitle !== formattedTitle) {
      finalTitle = `${formattedParentTitle} ⚬ ${formattedTitle}`;
    }

    // Aynı başlık daha önce eklendiyse, tekrar ekleme
    if (seenTitles.has(finalTitle)) continue;

    pages.push({
      label: finalTitle,
      href: menuItem.href || "",
    });

    seenTitles.set(finalTitle, menuItem.href || "");

    if (menuItem.children && menuItem.children.length > 0) {
      extractMenuItems(menuItem.children);
    }
  }
}

function handleButtonClick(link: string) {
  document.location.href = link;
}

const SearchBoxAutocomplete = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const Menuitems: MenuitemsType[] = createMenuItems(user.denetimTuru || "");

  extractMenuItems(Menuitems);

  return (
    <Autocomplete
      disablePortal
      id="search-box"
      options={pages}
      noOptionsText="Bulunamadı"
      size="small"
      fullWidth
      onChange={(event, value) => handleButtonClick(value?.href || "")}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder="Ara"
          aria-label="MenuAra"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <div style={{ marginRight: "-28px", marginTop: " 5px" }}>
                <SearchIcon style={{ color: "gray" }} />
              </div>
            ),
          }}
        />
      )}
    />
  );
};
export default SearchBoxAutocomplete;
