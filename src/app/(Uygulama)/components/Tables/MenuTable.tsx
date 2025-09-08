import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Collapse,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { MenuitemsType } from "@/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems";
import { createMenuItems } from "@/app/(Uygulama)/components/Layout/Vertical/Sidebar/MenuItems";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import Link from "next/link";
import BlankCard from "@/app/(Uygulama)/components/Layout/Shared/BlankCard/BlankCard";
import { getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu } from "@/api/CalismaKagitlari/CalismaKagitlari";

interface NestedMenuItemProps {
  item: MenuitemsType;
  level: number; // Hiyerarşi seviyesi
}

const StatusIcon: React.FC<{ status: boolean }> = ({ status }) => {
  return status ? (
    <CheckCircleIcon color="success" />
  ) : (
    <CheckCircleIcon color="disabled" />
  );
};

const NestedMenuItem: React.FC<NestedMenuItemProps> = ({ item, level }) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const customizer = useSelector((state: AppState) => state.customizer);

  const hasChildren = item.children && item.children.length > 0;

  // Typography stilini hiyerarşi seviyesi
  let typographyVariant: "h6" | "subtitle1" | "body1" = "h6";
  switch (level) {
    case 0:
      typographyVariant = "h6"; // Üst seviye
      break;
    case 1:
      typographyVariant = "subtitle1"; // Orta seviye
      break;
    default:
      typographyVariant = "body1"; // Alt seviye
  }

  const [hazirlayan, setHazirlayan] = React.useState<boolean>(false);
  const [onaylayan, setOnaylayan] = React.useState<boolean>(false);
  const [kontrolEden, setKontrolEden] = React.useState<boolean>(false);

  const fetchData = async () => {
    if (!item.formKodu) {
      return;
    }
    try {
      const formHazirlayanOnaylayanVerileri =
        await getFormHazirlayanOnaylayanByDenetciDenetlenenYilFormKodu(
          user.token || "",
          user.denetciId || 0,
          user.denetlenenId || 0,
          user.yil || 0,
          item.formKodu
        );

      if (formHazirlayanOnaylayanVerileri.hazirlayanId) {
        setHazirlayan(true);
      }
      if (formHazirlayanOnaylayanVerileri.onaylayanId) {
        setOnaylayan(true);
      }
      if (formHazirlayanOnaylayanVerileri.kontrolEdenId) {
        setKontrolEden(true);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <>
      <TableRow
        sx={{
          "&:hover": {
            backgroundColor:
              customizer.activeMode === "light"
                ? theme.palette.primary.light
                : theme.palette.primary.light,
          },
          backgroundColor: open
            ? customizer.activeMode === "light"
              ? theme.palette.primary.light
              : theme.palette.primary.light
            : "",
          // BorderBottom ayarları
          borderBottom: level === 0 ? 1 : 0,
          borderColor: theme.palette.divider,
          cursor: hasChildren ? "pointer" : "default",
        }}
        onClick={() => hasChildren && setOpen(!open)}
      >
        <TableCell sx={{ width: "40%" }}>
          <Typography variant={typographyVariant}>{item.title}</Typography>
        </TableCell>

        {/* Hazırlandı mı Icon */}
        <TableCell sx={{ textAlign: "center", width: "15%" }}>
          {!hasChildren && item.formKodu && <StatusIcon status={hazirlayan} />}
        </TableCell>

        {/* Onaylandı mı Icon */}
        <TableCell sx={{ textAlign: "center", width: "15%" }}>
          {!hasChildren && item.formKodu && <StatusIcon status={onaylayan} />}
        </TableCell>

        {/* Kalite Kontrol Icon */}
        <TableCell sx={{ textAlign: "center", width: "15%" }}>
          {!hasChildren && item.formKodu && <StatusIcon status={kontrolEden} />}
        </TableCell>

        {/* Expand/Collapse or Arrow Icon */}
        <TableCell sx={{ textAlign: "center", width: "15%" }}>
          {!hasChildren ? (
            <Link href={item.href || ""}>
              <ArrowCircleRightIcon sx={{ color: "#1976d2" }} />
            </Link>
          ) : (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setOpen(!open);
              }}
            >
              <ExpandMoreIcon
                sx={{
                  transform: open ? "rotate(360deg)" : "rotate(270deg)",
                  transition: "transform 0.2s ease",
                }}
              />
            </IconButton>
          )}
        </TableCell>
      </TableRow>

      {/* Collapsible Children */}
      {hasChildren && (
        <TableRow
          sx={{
            "&:last-child tr": {
              borderBottom: 1,
              borderColor: theme.palette.divider,
            },
          }}
        >
          <TableCell
            colSpan={5}
            sx={{
              paddingBottom: 0,
              paddingTop: 0,
              paddingLeft: 0,
              paddingRight: 0,
              borderBottom: 0,
            }}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Table stickyHeader>
                <TableBody>
                  {item.children?.map((child) => (
                    <NestedMenuItem
                      key={child.id}
                      item={child}
                      level={level + 1}
                    />
                  ))}
                </TableBody>
              </Table>
            </Collapse>
          </TableCell>
        </TableRow>
      )}

      {/* Açık olduğunda hücre arka planını ayarla */}
      {open && (
        <TableRow>
          <TableCell
            colSpan={5}
            sx={{
              backgroundColor:
                customizer.activeMode === "light"
                  ? theme.palette.primary.light
                  : theme.palette.primary.light, // Renk theme'den alınıyor
              pb: "10px",
            }}
          />
        </TableRow>
      )}
    </>
  );
};

const FilteredMenu: React.FC<{ title: string }> = ({ title }) => {
  const user = useSelector((state: AppState) => state.userReducer);

  const Menuitems: MenuitemsType[] = createMenuItems(
    user.rol || undefined,
    user.denetimTuru || undefined,
    user.enflasyonmu || undefined,
    user.konsolidemi || undefined,
    user.bddkmi || undefined
  );

  const mainItem = Menuitems.find(
    (item: MenuitemsType) => item.title === title
  );

  if (!mainItem || !mainItem.children || mainItem.children.length === 0) {
    return <Typography>No items found</Typography>;
  }

  return (
    <BlankCard>
      <TableContainer
        sx={{
          maxHeight: 600,
          overflow: "auto",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "40%" }}>
                <Typography variant="h5">İşlem</Typography>
              </TableCell>
              <TableCell sx={{ textAlign: "center", width: "15%" }}>
                <Typography variant="h5">Hazırlandı</Typography>
              </TableCell>
              <TableCell sx={{ textAlign: "center", width: "15%" }}>
                <Typography variant="h5">Onaylandı</Typography>
              </TableCell>
              <TableCell sx={{ textAlign: "center", width: "15%" }}>
                <Typography variant="h5">Kalite Kontrol</Typography>
              </TableCell>
              <TableCell sx={{ textAlign: "center", width: "15%" }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mainItem.children?.map((child) => (
              <NestedMenuItem key={child.id} item={child} level={0} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </BlankCard>
  );
};

export default FilteredMenu;
