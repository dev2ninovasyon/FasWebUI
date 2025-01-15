import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import SearchIcon from "@mui/icons-material/Search";
import Menuitems, {
  MenuitemsType,
} from "@/app/(Uygulama)/components//Layout/Vertical/Sidebar/MenuItems";
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

function extractMenuItems(menuItems: MenuitemsType[]) {
  for (const menuItem of menuItems) {
    if (menuItem.title !== undefined) {
      pages.push({
        label: firstLetterUpperCase(menuItem.title) || "",
        href: menuItem.href || "",
      });
    }

    if (menuItem.children && menuItem.children.length > 0) {
      extractMenuItems(menuItem.children);
    }
  }
}

extractMenuItems(Menuitems);

function handleButtonClick(link: string) {
  document.location.href = link;
}

const SearchBoxAutocomplete = () => (
  <Autocomplete
    disablePortal
    id="search-box"
    options={pages}
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

export default SearchBoxAutocomplete;
