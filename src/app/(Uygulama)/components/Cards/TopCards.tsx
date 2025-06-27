import Image from "next/image";
import {
  Box,
  CardContent,
  Grid,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import icon1 from "public/images/svgs/icon-connect.svg";
import icon2 from "public/images/svgs/icon-user-male.svg";
import icon3 from "public/images/svgs/icon-briefcase.svg";
import icon4 from "public/images/svgs/icon-mailbox.svg";
import icon5 from "public/images/svgs/icon-favorites.svg";
import icon6 from "public/images/svgs/icon-speech-bubble.svg";
import Link from "next/link";
import { MenuitemsType } from "@/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems";
import { createMenuItems } from "@/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

function randomIcon() {
  var icons = [icon1, icon2, icon3, icon4, icon5, icon6];
  var randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
}

function randomColor() {
  var colors = [
    /*"primary",*/
    /*"warning",*/
    /*"secondary",*/
    "error",
    "success",
    "info",
  ];
  var randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex];
}

interface TopCardsProps {
  title: string;
  parenTitle?: string;
}

const TopCards: React.FC<TopCardsProps> = ({ title, parenTitle }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const Menuitems: MenuitemsType[] = createMenuItems(user.denetimTuru || "");

  const findItemTitle = (
    title: string,
    items: MenuitemsType[],
    parentTitle?: string
  ): MenuitemsType | null => {
    for (const item of items) {
      if (item.title === title) {
        if (parentTitle && item.parentTitle !== parentTitle) {
          continue;
        }
        return item;
      }
      if (item.children) {
        const found = findItemTitle(title, item.children, parentTitle);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };

  const MenuItem = findItemTitle(title, Menuitems, parenTitle);

  let TopCards: Array<{
    icon: any;
    title: string;
    href: string;
    bgcolor: string;
    aciklama?: string;
  }> = [];

  if (MenuItem && MenuItem.children && MenuItem.children.length > 0) {
    TopCards = MenuItem.children.map((child: MenuitemsType) => ({
      icon: child.customIcon
        ? child.customIcon.replace("public", "")
        : randomIcon(),
      title: child.title || "",
      href: child.href || "",
      bgcolor: randomColor(),
      aciklama: child.aciklama,
    }));
  }

  return (
    <Grid container spacing={3} mt={1}>
      {TopCards.map((topcard, i) => (
        <Grid item xs={12} sm={4} lg={3} key={i}>
          {topcard.aciklama != undefined ? (
            <Tooltip
              title={topcard.aciklama}
              placement="bottom"
              slotProps={{
                tooltip: {
                  sx: {
                    backgroundColor:
                      customizer.activeMode == "dark"
                        ? theme.palette.primary.dark
                        : theme.palette.primary.main,
                    color: theme.palette.getContrastText(
                      customizer.activeMode == "dark"
                        ? theme.palette.primary.dark
                        : theme.palette.primary.main
                    ),
                  },
                },
              }}
            >
              <Link href={topcard.href}>
                <Box bgcolor={topcard.bgcolor + ".light"} textAlign="center">
                  <CardContent style={{ height: "180px" }}>
                    <Image
                      src={topcard.icon}
                      alt={"topcard.icon"}
                      width="50"
                      height="50"
                    />

                    <Typography
                      color={topcard.bgcolor + ".main"}
                      mt={1}
                      variant="subtitle1"
                      fontWeight={600}
                    >
                      {topcard.title}
                    </Typography>
                  </CardContent>
                </Box>
              </Link>
            </Tooltip>
          ) : (
            <Link href={topcard.href}>
              <Box bgcolor={topcard.bgcolor + ".light"} textAlign="center">
                <CardContent style={{ height: "180px" }}>
                  <Image
                    src={topcard.icon}
                    alt={"topcard.icon"}
                    width="50"
                    height="50"
                  />

                  <Typography
                    color={topcard.bgcolor + ".main"}
                    mt={1}
                    variant="subtitle1"
                    fontWeight={600}
                  >
                    {topcard.title}
                  </Typography>
                </CardContent>
              </Box>
            </Link>
          )}
        </Grid>
      ))}
    </Grid>
  );
};

export default TopCards;
