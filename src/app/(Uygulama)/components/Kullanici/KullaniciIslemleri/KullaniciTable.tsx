import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Chip,
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
import {
  deleteKullaniciById,
  getKullaniciByDenetciId,
} from "@/api/Kullanici/KullaniciIslemleri";
import { useRouter } from "next/navigation";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BlankCard from "@/app/(Uygulama)/components/Layout/Shared/BlankCard/BlankCard";

const KullaniciTable = () => {
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
    router.push(`/Kullanici/KullaniciIslemleri/KullaniciDuzenle/${selectedId}`);
  };

  const handleDetay = () => {
    handleClose();
    router.push(`/Kullanici/KullaniciIslemleri/KullaniciDetay/${selectedId}`);
  };

  const handleDelete = async () => {
    handleClose();
    try {
      const result = await deleteKullaniciById(
        user.token || "",
        selectedId || 0
      );
      if (result) {
        fetchData();
      } else {
        console.error("Denetci silinemedi");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const [rows, setRows] = useState([]);

  const fetchData = async () => {
    try {
      const kullaniciVerileri = await getKullaniciByDenetciId(
        user.token || "",
        user.denetciId
      );
      const newRows = kullaniciVerileri.map((kullanici: any) => ({
        id: kullanici.id,
        personelAdi: kullanici.personelAdi,
        unvan: kullanici.unvani,
        email: kullanici.email,
        tel: kullanici.tel,
        gsm: kullanici.gsm,
        aktifPasif: kullanici.aktifPasif,
      }));
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
                  Ünvan
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Email
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Telefon
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Gsm
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Durum
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
                    {row.unvan}
                  </Typography>
                </TableCell>
                <TableCell>
                  {" "}
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  {" "}
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.tel}
                  </Typography>
                </TableCell>
                <TableCell>
                  {" "}
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.gsm}
                  </Typography>
                </TableCell>

                <TableCell sx={{ textAlign: "center" }}>
                  <Chip
                    label={row.aktifPasif ? "Aktif" : "Pasif"}
                    sx={{
                      backgroundColor: row.aktifPasif
                        ? (theme) => theme.palette.success.light
                        : (theme) => theme.palette.error.light,
                      color: row.aktifPasif
                        ? (theme) => theme.palette.success.main
                        : (theme) => theme.palette.error.main,
                    }}
                  />
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

export default KullaniciTable;
