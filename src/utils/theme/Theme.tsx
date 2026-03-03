import _ from 'lodash';
import { createTheme } from '@mui/material/styles';
import { useSelector } from '@/store/hooks';
import { useEffect } from 'react';
import { AppState } from '@/store/store';
import type { RootState } from '@/store/store';
import components from './Components';
import typography from './Typography';
import { shadows, darkshadows } from './Shadows';
import { DarkThemeColors } from './DarkThemeColors';
import { LightThemeColors } from './LightThemeColors';
import { baseDarkTheme, baselightTheme } from './DefaultColors';
import * as locales from '@mui/material/locale';

const fallbackCustomizer: RootState["customizer"] = {
  activeTheme: "BLUE_THEME",
  activeMode: "light",
  activeDir: "ltr",
  avatarSrc: "/images/profile/user-1.jpg",
  SidebarWidth: 270,
  MiniSidebarWidth: 87,
  TopbarHeight: 70,
  isCollapse: false,
  isLayout: "full",
  isSidebarHover: false,
  isMobileSidebar: false,
  isHorizontal: false,
  isLanguage: "tr",
  isCardShadow: true,
  borderRadius: 7,
};

export const BuildTheme = (
  config: any = {},
  customizer: RootState["customizer"]
) => {
  const themeOptions = LightThemeColors.find((theme) => theme.name === config.theme);
  const darkthemeOptions = DarkThemeColors.find((theme) => theme.name === config.theme);
  const defaultTheme = customizer.activeMode === 'dark' ? baseDarkTheme : baselightTheme;
  const defaultShadow = customizer.activeMode === 'dark' ? darkshadows : shadows;
  const themeSelect = customizer.activeMode === 'dark' ? darkthemeOptions : themeOptions;
  const baseMode = {
    palette: {
      mode: customizer.activeMode,
    },
    shape: {
      borderRadius: customizer.borderRadius,
    },
    shadows: defaultShadow,
    typography: typography,
  };
  const theme = createTheme(
    _.merge({}, baseMode, defaultTheme, locales, themeSelect, {
      direction: config.direction,
    }),
  );
  theme.components = components(theme);

  return theme;
};

const useThemeSettings = () => {
  const customizer = useSelector((state: AppState) => state.customizer ?? fallbackCustomizer);
  const activDir = customizer.activeDir;
  const activeTheme = customizer.activeTheme;
  const theme = BuildTheme({
    direction: activDir,
    theme: activeTheme,
  }, customizer);
  useEffect(() => {
    document.dir = activDir;
  }, [activDir]);

  return theme;
};


export { useThemeSettings };
