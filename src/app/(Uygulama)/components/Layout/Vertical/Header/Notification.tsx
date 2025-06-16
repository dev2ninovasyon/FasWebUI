import React, { useEffect, useState } from "react";
import {
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Chip,
  useTheme,
  Tooltip,
} from "@mui/material";
import { IconBell, IconBellRinging } from "@tabler/icons-react";
import { Stack } from "@mui/system";
import Scrollbar from "@/app/(Uygulama)/components/CustomScroll/Scrollbar";
import {
  getBildirimler,
  updateBildirimlerOkundumu,
} from "@/api/BaglantiBilgileri/BaglantiBilgileri";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface Veri {
  id: number;
  konu: string;
  aciklama: string;
  okundumu: boolean;
}

interface Props {
  isSidebarHover: boolean;
}
const Notifications: React.FC<Props> = ({ isSidebarHover }) => {
  const [anchorEl, setanchorEl] = useState(null);

  const handleClick = (event: any) => {
    setanchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setanchorEl(null);
  };

  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  const handleUpdateOkundumu = async () => {
    try {
      const ids = fetchedData
        .filter((item) => !item.okundumu)
        .map((item) => item.id);
      if (ids.length > 0) {
        await updateBildirimlerOkundumu(user.token || "", ids);
      }
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const bildirimler = await getBildirimler(
        user.token || "",
        user.denetciId || 0
      );
      const rowsAll: any = [];

      bildirimler.forEach((veri: any) => {
        const newRow: any = {
          id: veri.id,
          konu: veri.konu,
          aciklama: veri.aciklama,
          okundumu: veri.okundumu,
        };

        rowsAll.push(newRow);
      });
      rowsAll.sort((a: Veri, b: Veri) => {
        const aOkunmadi = a.okundumu === false;
        const bOkunmadi = b.okundumu === false;
        return bOkunmadi ? 1 : aOkunmadi ? -1 : 0;
      });
      setFetchedData(rowsAll);
    } catch (error) {
      console.error("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [isSidebarHover]);

  useEffect(() => {
    if (anchorEl) {
      handleUpdateOkundumu();
    } else {
      fetchData();
    }
  }, [anchorEl]);

  return (
    <Box>
      <Tooltip title="Bildirimler">
        <IconButton
          size="large"
          aria-label="show new notifications"
          color="inherit"
          aria-controls="msgs-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          {fetchedData.filter((item) => !item.okundumu).length > 0 ? (
            <Badge variant="dot" color="primary">
              <IconBellRinging size="20" />
            </Badge>
          ) : (
            <IconBell size="20" />
          )}
        </IconButton>
      </Tooltip>

      <Menu
        id="msgs-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "360px",
          },
        }}
      >
        <Stack
          direction="row"
          p={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h6">Bildirimler</Typography>
          {fetchedData.filter((item) => !item.okundumu).length > 0 && (
            <Chip
              label={`${
                fetchedData.filter((item) => !item.okundumu).length
              } Yeni`}
              color="primary"
            />
          )}
        </Stack>
        <Scrollbar sx={{ height: "385px" }}>
          {fetchedData.length === 0 ? (
            <Typography variant="subtitle1" color="textSecondary" p={2}>
              Henüz Hiç Bildirim Yok
            </Typography>
          ) : (
            fetchedData.map((notification, index) => (
              <Box key={index}>
                <MenuItem
                  sx={{
                    p: 2,
                    pointerEvents: "none",
                    backgroundColor:
                      notification.okundumu == false
                        ? theme.palette.primary.light
                        : theme.palette.background.default,
                    borderLeft: 1,
                    borderRight: 1,
                    borderBottom: 1,
                    borderRadius: `4px`,
                    borderColor: theme.palette.background.default,
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      src={"/images/svgs/icon-dot.png"}
                      alt={"/images/svgs/icon-dot.png"}
                      sx={{
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="textPrimary"
                        fontWeight={600}
                        sx={{
                          width: "285px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {notification.konu}
                      </Typography>
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        sx={{
                          width: "285px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {notification.aciklama}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              </Box>
            ))
          )}
        </Scrollbar>
      </Menu>
    </Box>
  );
};

export default Notifications;
