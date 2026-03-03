import React, { useEffect, useState } from "react";
import * as LucideIcons from "lucide-react";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AppState } from "@/store/store";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { useSelector } from "@/store/hooks";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";
import { useLoading } from "@/contexts/LoadingContext";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import Link from "next/link";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
import {
  resolveIconNameByMenuTitle,
  resolveUniqueIconNamesForTitles,
} from "@/utils/menuIconResolver";

interface CalismaKagidiProps {
  parentName?: string;
  onViewModeChange?: (mode: "list" | "card") => void;
}

interface DenetimDosyaBelgeleriDto {
  id: number;
  name: string;
  children?: DenetimDosyaBelgeleriDto[];
}

const lucideIconPool = Object.keys(LucideIcons)
  .filter(
    (key) =>
      /^[A-Z]/.test(key) &&
      key !== "Icon" &&
      key !== "icons" &&
      typeof (LucideIcons as unknown as Record<string, unknown>)[key] !== "undefined"
  )
  .sort();

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const StatusIcon: React.FC<{ status: boolean }> = ({ status }) => {
  return status ? (
    <CheckCircleIcon color="success" />
  ) : (
    <CheckCircleIcon color="disabled" />
  );
};

const MaddiDogrulamaListe: React.FC<CalismaKagidiProps> = ({ parentName, onViewModeChange }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const [openedGroupIndex, setOpenGroupIndex] = useState<number | null>(null);
  const [calismaKagidiVerileri, setCalismaKagidiVerileri] = useState<DenetimDosyaBelgeleriDto[]>([]);

  // Görünümü localStorage'dan oku, yoksa "list" varsayılan yap
  const [viewMode, setViewMode] = useState<"list" | "card">("card");

  const router = useRouter();
  const { setLoading } = useLoading();

  // İlk açılışta localStorage kontrolü
  useEffect(() => {
    const savedMode = localStorage.getItem("maddiDogrulamaViewMode") as "list" | "card";
    if (savedMode) {
      setViewMode(savedMode);
      onViewModeChange?.(savedMode);
    } else {
      onViewModeChange?.(viewMode);
    }
  }, []);

  // Görünüm değiştiğinde localStorage'a kaydet ve parent'a bildir
  const handleToggleView = () => {
    const newMode = viewMode === "list" ? "card" : "list";
    setViewMode(newMode);
    localStorage.setItem("maddiDogrulamaViewMode", newMode);
    onViewModeChange?.(newMode);
  };

  const removeTurkishChars = (str: string | undefined | null) => {
    if (!str) return "";
    return str
      .replace(/\s/g, "")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ü/g, "u")
      .replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ç/g, "c")
      .replace(/İ/g, "I").replace(/Ö/g, "O").replace(/Ü/g, "U")
      .replace(/Ş/g, "S").replace(/Ğ/g, "G").replace(/Ç/g, "C");
  };

  const handleChildClick = (parentId: string, childId: string) => {
    const cleanParentId = removeTurkishChars(parentId);
    const cleanChildId = removeTurkishChars(childId);
    setLoading(true);
    router.push(`/DenetimKanitlari/MaddiDogrulamaProsedurleri/${cleanParentId}/${cleanChildId}?title=${encodeURIComponent(childId)}`);
  };

  const handleOpenGroup = (index: number) => {
    setOpenGroupIndex(openedGroupIndex === index ? null : index);
  };

  const fetchData = async () => {
    try {
      const data = await getMaddiDogrulama(user.denetimTuru || "",
        user.denetlenenId || 0,
        user.yil || 0
      );

      if (parentName) {
        const filtered = data?.filter((item: any) => removeTurkishChars(item.name) === parentName);
        setCalismaKagidiVerileri(filtered || []);
        if (filtered && filtered.length > 0) {
          setOpenGroupIndex(0);
        }
      } else {
        setCalismaKagidiVerileri(data || []);
      }
    } catch (error) {
      console.log("An error occurred:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [parentName]);

  const displayData = parentName && calismaKagidiVerileri[0]?.children
    ? calismaKagidiVerileri[0].children
    : calismaKagidiVerileri;

  const uniqueIconByItemId = React.useMemo(() => {
    const iconNames = resolveUniqueIconNamesForTitles(
      displayData.map((item) => item.name)
    );

    return new Map<number, string>(
      displayData.map((item, index) => [item.id, iconNames[index]])
    );
  }, [displayData]);

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "end", paddingBottom: viewMode === "list" ? "32px" : "0px", paddingRight: "10px" }}>
        <Button onClick={handleToggleView}>
          {viewMode === "list" ? <IconLayoutGrid size={24} /> : <IconList size={24} />}
        </Button>
      </Box>
      {viewMode === "card" ? (
        <Grid container spacing={3} mt={1}>
          {displayData.map((item) => {
            const iconName =
              uniqueIconByItemId.get(item.id) || resolveIconNameByMenuTitle(item.name);
            const CardIcon =
              (LucideIcons as unknown as Record<string, React.ElementType>)[iconName] ||
              LucideIcons.FileText;
            const targetPath = parentName
              ? `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${parentName}/${removeTurkishChars(item.name)}?title=${encodeURIComponent(item.name)}`
              : `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${removeTurkishChars(item.name)}?title=${encodeURIComponent(item.name)}`;

            return (
              <Grid
                key={item.id}
                size={{
                  xs: 12,
                  sm: 4,
                  lg: 3
                }}>
                <Link href={targetPath} passHref onClick={() => setLoading(true)} style={{ textDecoration: 'none' }}>
                  <Box
                    textAlign="center"
                    sx={{
                      borderRadius: "8px",
                      cursor: "pointer",
                      backgroundColor: alpha(theme.palette.primary.main, 0.10),
                    }}
                  >
                    <CardContent style={{ height: "180px", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          backgroundColor: "transparent",
                          color: theme.palette.text.primary,
                          marginBottom: "4px",
                        }}
                      >
                        <CardIcon size={38} strokeWidth={1.5} />
                      </Avatar>
                      <Typography color="text.primary" mt={1} variant="subtitle1" fontWeight={600}>
                        {item.name}
                      </Typography>
                    </CardContent>
                  </Box>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Grid container spacing={3} mt={1}>
          {calismaKagidiVerileri.map((parent, index) => (
            <Grid
              key={parent.id}
              size={{
                lg: 12,
                xs: 12
              }}>
              <Card sx={{ padding: 0, width: "100%", maxHeight: 500, overflow: "auto", mt: "20px", bgcolor: "primary.light", borderRadius: 0, border: `1px solid ${theme.palette.divider}` }}>
                <CardHeader
                  title={parent.name}
                  sx={{ cursor: "pointer", position: "sticky", top: 0, zIndex: "1", bgcolor: "primary.light" }}
                  onClick={() => handleOpenGroup(index)}
                  action={
                    <IconButton aria-label="expand row" size="medium" onClick={(e) => { e.stopPropagation(); handleOpenGroup(index); }}>
                      {openedGroupIndex === index ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  }
                />
                <Collapse in={openedGroupIndex === index} timeout="auto" unmountOnExit>
                  <Divider />
                  <CardContent>
                    <Grid container mb={2} spacing={2} justifyContent="center">
                      <Grid
                        display="flex"
                        justifyContent={"center"}
                        size={{
                          xs: 12,
                          sm: 6
                        }}>
                        <Box sx={{ width: "100%", maxWidth: 400 }}>
                          <EkBelgeYukleButton
                            formKodu={parent.name}
                            text="Belge Yükle"
                            fullWidth={true}
                            buttonVariant="contained"
                            color="primary"
                          />
                        </Box>
                      </Grid>
                      <Grid
                        display="flex"
                        justifyContent={"center"}
                        size={{
                          xs: 12,
                          sm: 6
                        }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          fullWidth
                          sx={{ maxWidth: 400, textTransform: 'none' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLoading(true);
                            router.push(`/DenetimKanitlari/MaddiDogrulamaProsedurleri/CalismaKagidiRaporu?parentName=${parent.name}`);
                          }}
                        >
                          Çalışma Kağıdı Oluştur
                        </Button>
                      </Grid>
                    </Grid>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Belge Adı</TableCell>
                          <TableCell align="center">Hazırlandı</TableCell>
                          <TableCell align="center">Onaylandı</TableCell>
                          <TableCell align="center">Kalite Kontrol</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parent.children?.map((child) => (
                          <Tooltip title="Belgeye Git" followCursor placement="top" key={child.id}>
                            <TableRow
                              onClick={() => handleChildClick(parent.name, child.name)}
                              sx={{ cursor: "pointer", transition: "background-color 0.3s", "&:hover": { backgroundColor: customizer.activeMode === "dark" ? "#333" : "#ddd" } }}
                            >
                              <TableCell><Typography variant="body1">{child.name}</Typography></TableCell>
                              <TableCell align="center"><StatusIcon status={true} /></TableCell>
                              <TableCell align="center"><StatusIcon status={false} /></TableCell>
                              <TableCell align="center"><StatusIcon status={true} /></TableCell>
                            </TableRow>
                          </Tooltip>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Collapse>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </>
  );
};

export default MaddiDogrulamaListe;




