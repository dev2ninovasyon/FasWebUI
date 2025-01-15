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
import {
  deleteDenetlenenById,
  getDenetlenenByDenetciId,
} from "@/api/Musteri/MusteriIslemleri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BlankCard from "@/app/(Uygulama)/components/Layout/Shared/BlankCard/BlankCard";

const MusteriTable = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const open = Boolean(anchorEl);
  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const router = useRouter();

  const user = useSelector((state: AppState) => state.userReducer);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDuzenle = () => {
    handleClose();
    router.push(`/Musteri/MusteriIslemleri/MusteriDuzenle/${selectedId}`);
  };

  const handleDetay = () => {
    handleClose();
    router.push(`/Musteri/MusteriIslemleri/MusteriDetay/${selectedId}`);
  };

  const handleDelete = async () => {
    handleClose();
    try {
      const result = await deleteDenetlenenById(
        user.token || "",
        selectedId || 0
      );
      if (result) {
        fetchData();
      } else {
        console.error("Denetlenen silinemedi");
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const [rows, setRows] = useState([]);
  const fetchData = async () => {
    try {
      const musteriVerileri = await getDenetlenenByDenetciId(
        user.token || "",
        user.denetciId || 0
      );
      const newRows = musteriVerileri.map((musteri: any) => ({
        id: musteri.id,
        denetciId: musteri.denetciId,
        firmaAdi: musteri.firmaAdi,
        yetkili: musteri.yetkili,
        tel: musteri.tel,
        adres: musteri.adres,
        email: musteri.email,
        webAdresi: musteri.webAdresi,
        ticaretSicilNo: musteri.ticaretSicilNo,
        vergiDairesi: musteri.vergiDairesi,
        vergiNo: musteri.vergiNo,
        tfrs: musteri.tfrs,
        bobi: musteri.bobi,
        bobiBuyuk: musteri.bobiBuyuk,
        tfrsDonemsel: musteri.tfrsDonemsel,
        arsivId: musteri.arsivId,
        kosolide: musteri.kosolide,
        konsolideAltSirketmi: musteri.konsolideAltSirketmi,
        konsolideAnaSirketmi: musteri.konsolideAnaSirketmi,
        konsolideBagliSirketmi: musteri.konsolideBagliSirketmi,
        firmaNo: musteri.tfrs,
        sektor1Id: musteri.sektor1Id,
        sektor2Id: musteri.sektor2Id,
        sektor3Id: musteri.sektor3Id,
        ozelDenetim: musteri.ozelDenetim,
        kumi: musteri.kumi,
        aktifmi: musteri.aktifmi,
        enflasyonMu: musteri.enflasyonMu,
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
                <Typography variant="h6">Firma Adı</Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Yetkili
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Telefon
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Email
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
                  <Typography variant="h6">{row.firmaAdi}</Typography>
                </TableCell>
                <TableCell scope="row">
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.yetkili}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.tel}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    id="basic-button2"
                    aria-controls={open ? "basic-menu2" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "false" : undefined}
                    onClick={(event) => handleClick(event, row.id)}
                  >
                    <IconDotsVertical width={18} />
                  </IconButton>
                  <Menu
                    id="basic-menu2"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "basic-button2",
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

export default MusteriTable;
