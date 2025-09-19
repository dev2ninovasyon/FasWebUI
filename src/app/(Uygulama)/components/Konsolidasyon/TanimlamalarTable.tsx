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
import { IconDotsVertical, IconEdit } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { getTanimlamalarByDenetlenenId } from "@/api/Konsolidasyon/Konsolidasyon";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import BlankCard from "@/app/(Uygulama)/components/Layout/Shared/BlankCard/BlankCard";

const TanimlamalarTable = () => {
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
    router.push(`/Konsolidasyon/Tanimlamalar/TanimlamaDuzenle/${selectedId}`);
  };

  const [rows, setRows] = useState([]);

  const fetchData = async () => {
    try {
      const tanimlamalarVerileri = await getTanimlamalarByDenetlenenId(
        user.token || "",
        user.denetlenenId || 0
      );
      const newRows = tanimlamalarVerileri.map((tanimlamalar: any) => ({
        id: tanimlamalar.id,
        firmaAdi: tanimlamalar.firmaAdi,
        yil: tanimlamalar.yil,
        bagliIstirakOrani: tanimlamalar.bagliIstirakOrani,
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
                  Yıl
                </Typography>
              </TableCell>
              <TableCell>
                <Typography textAlign="center" variant="h6">
                  Bağlı İştirak Oranı
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
                    {row.yil}
                  </Typography>
                </TableCell>
                <TableCell scope="row">
                  <Typography
                    textAlign="center"
                    variant="subtitle1"
                    color="textSecondary"
                  >
                    {row.bagliIstirakOrani}
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

export default TanimlamalarTable;
