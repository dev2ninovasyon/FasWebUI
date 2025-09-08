import React, { useEffect, useState } from "react";
import {
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
import { AppState } from "@/store/store";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useSelector } from "@/store/hooks";
import { getMaddiDogrulama } from "@/api/MaddiDogrulama/MaddiDogrulama";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";

interface CalismaKagidiProps {}

interface DenetimDosyaBelgeleriDto {
  id: number;
  name: string;
  children?: DenetimDosyaBelgeleriDto[];
}

const StatusIcon: React.FC<{ status: boolean }> = ({ status }) => {
  return status ? (
    <CheckCircleIcon color="success" />
  ) : (
    <CheckCircleIcon color="disabled" />
  );
};

const MaddiDogrulamaListe: React.FC<CalismaKagidiProps> = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const [openedGroupIndex, setOpenGroupIndex] = useState<number | null>(null);
  const [calismaKagidiVerileri, setCalismaKagidiVerileri] = useState<
    DenetimDosyaBelgeleriDto[]
  >([]);
  const router = useRouter();

  const removeTurkishChars = (str: string) => {
    return str
      .replace(/\s/g, "")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ç/g, "c")
      .replace(/İ/g, "I")
      .replace(/Ö/g, "O")
      .replace(/Ü/g, "U")
      .replace(/Ş/g, "S")
      .replace(/Ğ/g, "G")
      .replace(/Ç/g, "C");
  };

  const handleChildClick = (parentId: string, childId: string) => {
    const cleanParentId = removeTurkishChars(parentId);
    const cleanChildId = removeTurkishChars(childId);
    router.push(
      `/DenetimKanitlari/MaddiDogrulamaProsedurleri/${cleanParentId}/${cleanChildId}`
    );
  };
  const handleOpenGroup = (index: number) => {
    setOpenGroupIndex(openedGroupIndex === index ? null : index);
  };

  const fetchData = async () => {
    try {
      const data = await getMaddiDogrulama(
        user.token || "",
        user.denetimTuru || "",
        user.denetlenenId || 0,
        user.yil || 0
      );
      setCalismaKagidiVerileri(data || []); // Store fetched data in state
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Grid
      container
      sx={{
        width: "95%",
        margin: "0 auto",
        justifyContent: "center",
      }}
    >
      {calismaKagidiVerileri.map((parent, index) => (
        <Grid item lg={12} xs={12} key={parent.id}>
          <Card
            sx={{
              padding: 0,
              width: "100%",
              maxHeight: 500,
              overflow: "auto",
              mt: "20px",
              bgcolor: customizer.activeMode === "dark" ? "#0e121a" : "#f5f5f5",
            }}
          >
            <CardHeader
              title={parent.name}
              sx={{
                cursor: "pointer",
                position: "sticky",
                top: 0,
                zIndex: "1",
                bgcolor:
                  customizer.activeMode === "dark" ? "#0e121a" : "#f5f5f5",
              }}
              onClick={() => handleOpenGroup(index)} // CardHeader'a tıklanınca collapse açılması için
              action={
                <IconButton
                  aria-label="expand row"
                  size="medium"
                  onClick={(e) => {
                    e.stopPropagation(); // IconButton'a tıklanınca CardHeader'a tıklama olayını tetiklememesi için
                    handleOpenGroup(index);
                  }}
                >
                  {openedGroupIndex === index ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    <KeyboardArrowDownIcon />
                  )}
                </IconButton>
              }
            />
            <Collapse
              in={openedGroupIndex === index}
              timeout="auto"
              unmountOnExit
            >
              <Divider />
              <CardContent>
                <Grid container mb={2}>
                  <Grid
                    item
                    xs={12}
                    lg={12}
                    display="flex"
                    alignItems={"center"}
                    justifyContent={"space-between"}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<UploadFileIcon />}
                      fullWidth
                      sx={{
                        mr: 1,
                        backgroundColor:
                          customizer.activeMode == "dark"
                            ? theme.palette.primary.main
                            : theme.palette.primary.main,
                      }}
                    >
                      Referans Dosya Yükle
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<AddIcon />}
                      fullWidth
                      sx={{
                        mr: 1,
                        backgroundColor:
                          customizer.activeMode == "dark"
                            ? theme.palette.secondary.dark
                            : theme.palette.secondary.main,
                      }}
                    >
                      Çalışma Kağıdı Oluştur
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<AssignmentIcon />}
                      fullWidth
                      sx={{
                        backgroundColor:
                          customizer.activeMode == "dark"
                            ? theme.palette.success.dark
                            : theme.palette.success.main,
                      }}
                    >
                      İmzalı Belge Yükle
                    </Button>
                  </Grid>
                </Grid>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Belge Adı</TableCell>
                      <TableCell align="center">Hazırlandı </TableCell>
                      <TableCell align="center">Onaylandı</TableCell>
                      <TableCell align="center">Kalite Kontrol</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parent.children?.map((child) => (
                      <Tooltip
                        title="Belgeye Git"
                        followCursor
                        placement="top"
                        key={child.id}
                        sx={{
                          "& .MuiTooltip-tooltip": {
                            fontSize: "1.2rem", // Tooltip'in yazı boyutunu büyütme
                            padding: "10px", // Tooltip içeriği için padding ekleme
                          },
                        }}
                      >
                        <TableRow
                          onClick={() =>
                            handleChildClick(parent.name, child.name)
                          }
                          sx={{
                            cursor: "pointer",
                            transition: "background-color 0.3s",
                            "&:hover": {
                              backgroundColor:
                                customizer.activeMode === "dark"
                                  ? "#333"
                                  : "#ddd",
                            },
                          }}
                        >
                          <TableCell>
                            <Typography variant="body1">
                              {child.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <StatusIcon status={true} />
                          </TableCell>
                          <TableCell align="center">
                            <StatusIcon status={false} />
                          </TableCell>
                          <TableCell align="center">
                            <StatusIcon status={true} />
                          </TableCell>
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
  );
};

export default MaddiDogrulamaListe;
