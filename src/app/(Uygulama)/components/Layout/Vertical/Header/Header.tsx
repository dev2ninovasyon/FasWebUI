import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/material/styles";
import { useSelector, useDispatch } from "@/store/hooks";
import {
  toggleSidebar,
  toggleMobileSidebar,
} from "@/store/customizer/CustomizerSlice";
import { IconMenu2 } from "@tabler/icons-react";
import Notifications from "./Notification";
import Profile from "./Profile/Profile";
import Search from "./Search";
import Language from "./Language";
import { AppState } from "@/store/store";
import MobileRightSidebar from "./MobileRightSidebar";
import SirketPopup from "./SirketPopup";
import SearchBoxAutocomplete from "@/app/(Uygulama)/components/Layout/Vertical/Header/SearchBoxAutoComplete";
import MobileSirketPopup from "./MobileSirketPopup";
import Archive from "./Archive";

const Header = () => {
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));

  // drawer
  const customizer = useSelector((state: AppState) => state.customizer);
  const dispatch = useDispatch();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: customizer.TopbarHeight,
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
    justifyContent: "space-between",
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        {/* ------------------------------------------- */}
        {/* Toggle Button Sidebar */}
        {/* ------------------------------------------- */}
        <Box>
          <IconButton
            color="inherit"
            aria-label="menu"
            onClick={
              lgUp
                ? () => dispatch(toggleSidebar())
                : () => dispatch(toggleMobileSidebar())
            }
          >
            <IconMenu2 size="20" />
          </IconButton>
          {lgUp ? null : <Search />}
          {lgUp ? <SirketPopup /> : <MobileSirketPopup />}
        </Box>
        {/* ------------------------------------------- */}
        {/* Search Dropdown */}
        {/* ------------------------------------------- */}
        {lgUp ? (
          <Box width={"40%"}>
            <SearchBoxAutocomplete />
          </Box>
        ) : null}

        <Stack spacing={1} direction="row" alignItems="center">
          <Language />

          <Archive />
          {/* ------------------------------------------- */}
          {/* End Ecommerce Dropdown */}
          {/* ------------------------------------------- */}
          <Notifications />
          {/* ------------------------------------------- */}
          {/* Toggle Right Sidebar for mobile */}
          {/* ------------------------------------------- */}
          {/*lgDown ? <MobileRightSidebar /> : null*/}
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

export default Header;
