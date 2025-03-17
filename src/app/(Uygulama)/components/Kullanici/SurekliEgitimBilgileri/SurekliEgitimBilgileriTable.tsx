import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
} from "@mui/material";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconEye,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BlankCard from "@/app/(Uygulama)/components/Layout/Shared/BlankCard/BlankCard";
import {
  deleteSurekliEgitimBilgileriById,
  getSurekliEgitimBilgileriByDenetciId,
} from "@/api/Kullanici/SurekliEgitimBilgileri";

const SurekliEgitimBilgileriTable = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const user = useSelector((state: AppState) => state.userReducer);

  const open = Boolean(anchorEl);
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const router = useRouter();

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDuzenle = () => {
    handleClose();
    router.push(
      `/Kullanici/SurekliEgitimBilgileri/SurekliEgitimBilgileriDuzenle/${selectedId}`
    );
  };

  const handleDetay = () => {
    handleClose();
    router.push(
      `/Kullanici/SurekliEgitimBilgileri/SurekliEgitimBilgileriDetay/${selectedId}`
    );
  };

  const handleDelete = async () => {
    handleClose();
    try {
      const result = await deleteSurekliEgitimBilgileriById(
        user.token || "",
        selectedId || 0
      );
      if (result) {
        fetchData();
      } else {
        console.error("Sürekli Eğitim Bilgileri silinemedi");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const [rows, setRows] = useState([]);

  const fetchData = async () => {
    try {
      const surekliEgitimBilgileriVerileri =
        await getSurekliEgitimBilgileriByDenetciId(
          user.token || "",
          user.denetciId
        );

      const newRows = surekliEgitimBilgileriVerileri.map(
        (surekliEgitimBilgileri: any) => ({
          id: surekliEgitimBilgileri.id,
          personelId: surekliEgitimBilgileri.personelId,
          personelAdi: surekliEgitimBilgileri.personelAdi,
          sertifikaAdi: surekliEgitimBilgileri.sertifikaAdi,
          egitimBaslangicTarihi: surekliEgitimBilgileri.egitimBaslangicTarihi
            .split("T")[0]
            .split("-")
            .reverse()
            .join("."),
          egitimBitisTarihi: surekliEgitimBilgileri.egitimBitisTarihi
            .split("T")[0]
            .split("-")
            .reverse()
            .join("."),
          egitimSaati: surekliEgitimBilgileri.egitimSaati,
          eldeEdilenKredi: surekliEgitimBilgileri.eldeEdilenKredi,
          egitimTuru: surekliEgitimBilgileri.egitimTuru,
        })
      );
      setRows(newRows);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <BlankCard>
      <TableContainer>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h6">Personel Adı</Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Sertifika Adı
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Eğitim Başlangıç Tarihi
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Eğitim Bitiş Tarihi
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Eğitim Saati
                </Typography>
              </TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row: any) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell>
                  <Typography variant="h6">{row.personelAdi}</Typography>
                </TableCell>
                <TableCell scope="row">
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.sertifikaAdi}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.egitimBaslangicTarihi}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.egitimBitisTarihi}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.egitimSaati}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    id="basic-button"
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={(event) => handleClick(event, row.id)}
                  >
                    <IconDotsVertical width={18} />
                  </IconButton>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "basic-button",
                    }}
                  >
                    <MenuItem onClick={() => handleDuzenle()}>
                      <ListItemIcon>
                        <IconEdit width={18} />
                      </ListItemIcon>
                      Düzenle
                    </MenuItem>

                    <MenuItem onClick={() => handleDetay()}>
                      <ListItemIcon>
                        <IconEye width={18} />
                      </ListItemIcon>
                      Detay
                    </MenuItem>
                    <MenuItem onClick={() => handleDelete()}>
                      <ListItemIcon>
                        <IconTrash width={18} />
                      </ListItemIcon>
                      Sil
                    </MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </BlankCard>
  );
};

export default SurekliEgitimBilgileriTable;
