import React, { useEffect, useState } from "react";
import {
  IconButton,
  Box,
  Badge,
  MenuItem,
  Popover,
  Avatar,
  Typography,
  Chip,
  useTheme,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from "@mui/material";
import { IconBell, IconBellRinging } from "@tabler/icons-react";
import { Stack } from "@mui/system";
import Scrollbar from "@/app/(Uygulama)/components/CustomScroll/Scrollbar";
import {
  getBildirimler,
  updateBildirimlerOkundumu,
  startBildirimConnection,
  onYeniBildirim,
  stopBildirimConnection,
  startPollingBildirim,
  stopPollingBildirim,
  getBildirimConnectionStatus,
} from "@/api/BaglantiBilgileri/BaglantiBilgileri";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { useRouter } from "next/navigation";
import {
  setBobimi,
  setDenetimTuru,
  setDenetlenenFirmaAdi,
  setDenetlenenId,
  setEnflasyonmu,
  setKonsolidemi,
  setRol,
  setTfrsmi,
  setYil,
} from "@/store/user/UserSlice";
import { getRol } from "@/api/Sozlesme/DenetimKadrosuAtama";
import { updateSonSecilenAyarlari } from "@/api/Kullanici/KullaniciAyarlar";
import { getDenetlenenById } from "@/api/Musteri/MusteriIslemleri";

interface Veri {
  id: number;
  konu: string;
  aciklama: string;
  okundumu: boolean;
  tarih?: string;
  denetlenenId?: number;
  yil?: number;
  tip?: string;
  kaynakUrl?: string;
}

const styles = `
  @keyframes shake {
    0%, 100% { transform: rotate(0deg) scale(1); }
    10%, 30%, 50%, 70%, 90% { transform: rotate(-15deg) scale(1.1); }
    20%, 40%, 60%, 80% { transform: rotate(15deg) scale(1.1); }
  }
  
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
    50% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
  }
  
  @keyframes shake-screen {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
    20%, 40%, 60%, 80% { transform: translateX(3px); }
  }
  
  .bell-shake {
    animation: shake 0.8s ease-in-out infinite;
  }
  
  .bell-pulse {
    animation: pulse 2s infinite;
  }
  
  .screen-shake {
    animation: shake-screen 0.6s ease-in-out;
  }
`;

interface Props {
  isSidebarHover: boolean;
}

// XSS Protection - HTML karakterlerini escape etme
const sanitizeText = (text: string): string => {
  if (!text) return "";
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const Notifications: React.FC<Props> = ({ isSidebarHover }) => {
  const [anchorEl, setanchorEl] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [lastBildirim, setLastBildirim] = useState<Veri | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Şirket Değiştirme Onay Diyaloğu State'leri
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingBildirim, setPendingBildirim] = useState<Veri | null>(null);

  const handleClick = (event: any) => {
    setanchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setanchorEl(null);
  };

  const user = useSelector((state: AppState) => state.userReducer);
  const theme = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const [fetchedData, setFetchedData] = useState<Veri[]>([]);

  // Tarih formatı: "Bugün 14:30" veya "Dün 09:45" veya "01 Ş 14:30"
  const formatTarih = (tarih?: string) => {
    if (!tarih) return "";

    try {
      const bildirimTarihi = new Date(tarih);
      const simdi = new Date();

      const gununAyriMi =
        bildirimTarihi.getDate() !== simdi.getDate() ||
        bildirimTarihi.getMonth() !== simdi.getMonth() ||
        bildirimTarihi.getFullYear() !== simdi.getFullYear();

      const dunmu =
        bildirimTarihi.getDate() === simdi.getDate() - 1 &&
        bildirimTarihi.getMonth() === simdi.getMonth() &&
        bildirimTarihi.getFullYear() === simdi.getFullYear();

      const saat = bildirimTarihi.getHours().toString().padStart(2, "0");
      const dakika = bildirimTarihi.getMinutes().toString().padStart(2, "0");

      if (!gununAyriMi) {
        return `Bugün ${saat}:${dakika}`;
      } else if (dunmu) {
        return `Dün ${saat}:${dakika}`;
      } else {
        const gunler = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
        const aylar = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
        const gun = gunler[bildirimTarihi.getDay()];
        const ay = aylar[bildirimTarihi.getMonth()];
        const tarihGun = bildirimTarihi.getDate().toString().padStart(2, "0");
        return `${gun} ${tarihGun} ${ay} ${saat}:${dakika}`;
      }
    } catch (error) {
      return "";
    }
  };

  const handleUpdateOkundumu = async () => {
    try {
      const ids = fetchedData
        .filter((item) => !item.okundumu)
        .map((item) => item.id);
      if (ids.length > 0) {
        await updateBildirimlerOkundumu(ids);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  const fetchData = async () => {
    try {
      const bildirimler = await getBildirimler(user.denetciId || 0
      );
      const rowsAll: any = [];

      if (bildirimler && Array.isArray(bildirimler)) {
        bildirimler.forEach((veri: any) => {
          const newRow: Veri = {
            id: veri.id || veri.Id,
            konu: veri.konu || veri.Konu,
            aciklama: veri.aciklama || veri.Aciklama,
            okundumu: veri.okundumu !== undefined ? veri.okundumu : veri.Okundumu,
            tarih: veri.tarih || veri.Tarih || new Date().toISOString(),
            denetlenenId: veri.denetlenenId || veri.DenetlenenId,
            yil: veri.yil || veri.Yil,
            tip: veri.tip || veri.Tip,
            kaynakUrl: veri.kaynakUrl || veri.KaynakUrl
          };

          rowsAll.push(newRow);
        });
        setFetchedData(rowsAll);
      }
    } catch (error) {
      console.log("Bir hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // SignalR bağlantısı
  useEffect(() => {
    if (user.token && user.denetciId) {
      const token = user.token as string;
      const denetciId = user.denetciId as number;

      if (process.env.NODE_ENV === 'development') {
        console.log("📡 Bildirim bağlantısı kurulmaya çalışılıyor...");
      }

      // Callback function'ı tanımla
      const handleBildirim = (bildirim: any) => {
        if (process.env.NODE_ENV === 'development') {
          console.log("📬 Yeni bildirim");
        }
        handleNewNotification(bildirim);
      };

      // Listener'ı kaydet ve polling fallback sağla
      onYeniBildirim(handleBildirim, denetciId);

      // Bağlantıyı başlat
      startBildirimConnection(denetciId)
        .then(() => {
          if (process.env.NODE_ENV === 'development') {
            console.log("🟢 SignalR modu aktif!");
          }
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error("⚠️ SignalR başarısız, polling fallback");
          }
        });
    }

    return () => {
      stopPollingBildirim();
    };
  }, [user.token, user.denetciId]);

  // Yeni bildirim handle helper
  const handleNewNotification = (bildirim: any) => {
    const yeniBildirim: Veri = {
      id: bildirim.id || bildirim.Id,
      konu: bildirim.konu || bildirim.Konu,
      aciklama: bildirim.aciklama || bildirim.Aciklama,
      okundumu: false,
      tarih: bildirim.tarih || bildirim.Tarih || new Date().toISOString(),
      denetlenenId: bildirim.denetlenenId || bildirim.DenetlenenId,
      yil: bildirim.yil || bildirim.Yil,
      tip: bildirim.tip || bildirim.Tip,
      kaynakUrl: bildirim.kaynakUrl || bildirim.KaynakUrl
    };

    // Sayfa başlığını güncelle
    const newUnreadCount = fetchedData.filter((item) => !item.okundumu).length + 1;
    setUnreadCount(newUnreadCount);
    document.title = `(${newUnreadCount}) 🔔 YENİ BİLDİRİM - FAS Denetim`;

    // İkonu ve sayfayı sallandır
    setIsShaking(true);
    setScreenShake(true);
    setTimeout(() => {
      setIsShaking(false);
      setScreenShake(false);
    }, 1000);

    // Modal aç (4 saniye sonra kapat)
    setLastBildirim({
      ...yeniBildirim,
      konu: sanitizeText(bildirim.konu || ""),
      aciklama: sanitizeText(bildirim.aciklama || "")
    });
    setShowModal(true);
    setTimeout(() => {
      setShowModal(false);
    }, 4000);

    // Ses çal (daha yüksek ve daha çok)
    playNotificationSound();
    playNotificationSound();

    // Browser notification (izin varsa)
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(bildirim.konu, {
        body: bildirim.aciklama,
        icon: "/images/svgs/icon-dot.png",
        tag: "bildirim",
        requireInteraction: true,
      });
    }

    // Listeye ekle (başa)
    setFetchedData((prev) => [yeniBildirim, ...prev]);
  };

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

  // Bildirim sesi çal (daha yüksek ses)
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 900;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log("Ses çalma hatası");
      }
    }
  };

  // Tarayıcı notification izni iste
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Akıllı Yönlendirme ve Şirket Değiştirme Mantığı
  const handleKontrolEt = async (bildirim: Veri) => {
    // Popup'ları kapat
    setShowModal(false);
    setanchorEl(null);

    const targetDenetlenenId = bildirim.denetlenenId;
    const targetYil = bildirim.yil;

    console.log("Bildirim tıklandı:", {
      targetDenetlenenId,
      targetYil,
      currentDenetlenenId: user.denetlenenId,
      currentYil: user.yil,
      kaynakUrl: bildirim.kaynakUrl,
      tip: bildirim.tip
    });

    const isDifferent = !!(targetDenetlenenId && targetYil && (targetDenetlenenId !== user.denetlenenId || targetYil !== user.yil));

    if (isDifferent) {
      console.log("Farklı şirket/yıl algılandı, onay kutusu açılıyor");
      setPendingBildirim(bildirim);
      setConfirmOpen(true);
    } else {
      console.log("Aynı şirket/yıl, yönlendirme yapılıyor");
      if (bildirim.kaynakUrl) {
        router.push(bildirim.kaynakUrl);
      } else {
        navigateByTip(bildirim.tip);
      }
    }
  };

  const handleConfirmSwitch = async () => {
    if (!pendingBildirim) return;

    try {
      const targetId = pendingBildirim.denetlenenId!;
      const targetYil = pendingBildirim.yil!;

      // Şirket detaylarını getir (Denetim Türü, Bobi vb. için)
      const denetlenen = await getDenetlenenById(targetId);

      if (denetlenen) {
        // Redux State Güncelle
        dispatch(setDenetlenenId(targetId));
        dispatch(setDenetlenenFirmaAdi(denetlenen.firmaAdi));
        dispatch(setYil(targetYil));
        dispatch(setDenetimTuru(denetlenen.denetimTuru));
        dispatch(setBobimi(denetlenen.bobi));
        dispatch(setTfrsmi(denetlenen.tfrs));
        dispatch(setEnflasyonmu(denetlenen.enflasyonMu));
        dispatch(setKonsolidemi(denetlenen.konsolide));

        // LocalStorage Güncelle
        localStorage.setItem("fas_denetlenenId", targetId.toString());
        localStorage.setItem("fas_yil", targetYil.toString());

        // Rol ve DB güncellemesi 
        try {
          // 1. Önce DB Persist (Son Seçilen Ayarlar) - KRİTİK SIRALAMA
          if (user.token && user.id && user.id !== 0) {
            console.log(`Notification - Persisting selection for user ${user.id}: Company=${targetId}, Year=${targetYil}`);
            try {
              await updateSonSecilenAyarlari(user.id, targetId, targetYil);
              console.log("Notification - Persistence update successful.");
            } catch (err) {
              console.error("Notification - Persistence update hatası:", err);
            }
          }

          // 2. Rol Bilgisi Güncelleme
          try {
            const rolVerileri = await getRol(user.id || 0, targetId, targetYil);
            if (rolVerileri) {
              dispatch(setRol(rolVerileri.rol));
              console.log("Notification - Rol güncellendi.");
            }
          } catch (err) {
            console.error("Notification - Rol güncelleme hatası:", err);
          }
        } catch (innerError) {
          console.error("Notification - Şirket detay güncelleme hatası:", innerError);
        }

        // Yönlendirme hedefi
        const path = pendingBildirim.kaynakUrl || getPathByTip(pendingBildirim.tip);

        // Şirket değişimi için router.push kullanıyoruz
        router.push(path);
      }
    } catch (error) {
      console.error("Şirket değiştirme hatası:", error);
    } finally {
      setConfirmOpen(false);
      setPendingBildirim(null);
    }
  };

  const navigateByTip = (tip?: string, kaynakUrl?: string) => {
    const path = kaynakUrl || getPathByTip(tip);
    router.push(path);
  };

  const getPathByTip = (tip?: string) => {
    switch (tip) {
      case "Amortisman":
        return "/Hesaplamalar/Amortisman";
      case "CekSenetReeskont":
        return "/Hesaplamalar/CekSenetReeskont";
      case "DavaKarsiliklari":
        return "/Hesaplamalar/DavaKarsiliklari";
      case "KidemTazminatiBobi":
        return "/Hesaplamalar/KidemTazminatiBobi";
      case "KidemTazminatiTfrs":
        return "/Hesaplamalar/KidemTazminatiTfrs";
      case "Kredi":
        return "/Hesaplamalar/Kredi";
      default:
        return "/Anasayfa";
    }
  };

  return (
    <Box>
      <style>{styles}</style>
      <Tooltip title="Bildirimler">
        <span style={{ display: "inline-flex" }}>
          <IconButton
            size="large"
            aria-label="show new notifications"
            color="inherit"
            aria-controls="msgs-menu"
            aria-haspopup="true"
            onClick={handleClick}
            className={isShaking ? "bell-shake" : ""}
            sx={{
              position: "relative",
              ...(isShaking && {
                filter: "drop-shadow(0 0 8px rgba(244, 67, 54, 0.8))",
              }),
            }}
          >
            {fetchedData.filter((item) => !item.okundumu).length > 0 ? (
              <Badge
                variant="dot"
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    animation: isShaking ? "pulse 1s infinite" : "none",
                    boxShadow: isShaking
                      ? "0 0 0 8px rgba(244, 67, 54, 0.3)"
                      : "none",
                  },
                }}
              >
                <IconBellRinging size="20" />
              </Badge>
            ) : (
              <IconBell size="20" />
            )}
          </IconButton>
        </span>
      </Tooltip>

      <Popover
        id="msgs-menu"
        anchorEl={anchorEl}
        keepMounted={false}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{
          paper: {
            sx: {
              width: "360px",
            },
          },
        }}
      >
        <div style={{ outline: "none" }}>
          <Stack
            direction="row"
            p={2}
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Bildirimler</Typography>
            {fetchedData.filter((item) => !item.okundumu).length > 0 && (
              <Chip
                label={`${fetchedData.filter((item) => !item.okundumu).length
                  } Yeni`}
                color="primary"
              />
            )}
          </Stack>
          <Scrollbar sx={{ height: "385px" }}>
            {fetchedData.length === 0 ? (
              <MenuItem sx={{ pointerEvents: "none" }}>
                <Typography variant="subtitle1" color="textSecondary" p={2}>
                  Henüz Hiç Bildirim Yok
                </Typography>
              </MenuItem>
            ) : (
              fetchedData.map((notification, index) => (
                <MenuItem
                  key={notification.id}
                  sx={{
                    p: 2,
                    backgroundColor:
                      notification.okundumu == false
                        ? theme.palette.primary.light
                        : theme.palette.background.default,
                    borderLeft: 1,
                    borderRight: 1,
                    borderBottom: 1,
                    borderRadius: `4px`,
                    borderColor: theme.palette.background.default,
                    cursor: "pointer",
                    pointerEvents: "auto",
                  }}
                  onClick={() => handleKontrolEt(notification)}
                >
                  <Stack direction="row" alignItems="flex-start" spacing={2}>
                    <Avatar
                      src={"/images/svgs/icon-dot.png"}
                      alt={"/images/svgs/icon-dot.png"}
                      sx={{
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: 0.5,
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        color="textPrimary"
                        fontWeight={600}
                        sx={{
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {sanitizeText(notification.konu)}
                      </Typography>
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        sx={{
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                          mt: 0.5,
                        }}
                      >
                        {sanitizeText(notification.aciklama)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{
                          display: "block",
                          mt: 0.5,
                          fontSize: "0.75rem",
                          fontWeight: 500,
                        }}
                      >
                        {formatTarih(notification.tarih)}
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              ))
            )}
          </Scrollbar>
        </div>
      </Popover>

      {/* Bildirim Popup - Sağ Üst Köşe (Header Altı) */}
      {showModal && (
        <Box
          sx={{
            position: "fixed",
            top: 80,
            right: 20,
            zIndex: 9999,
            animation: "slideDownIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            "@keyframes slideDownIn": {
              from: {
                transform: "translateY(-50px) scale(0.9)",
                opacity: 0,
              },
              to: {
                transform: "translateY(0) scale(1)",
                opacity: 1,
              },
            },
          }}
        >
          <Box
            sx={{
              backgroundColor: "rgba(244, 67, 54, 0.9)", // Soft Red with transparency
              backdropFilter: "blur(12px)", // Glassmorphism
              color: "white",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 20px 50px rgba(244, 67, 54, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.2)",
              maxWidth: "380px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography
                variant="h6"
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  letterSpacing: "0.5px",
                }}
              >
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    backgroundColor: "white",
                    borderRadius: "50%",
                    boxShadow: "0 0 10px white",
                  }}
                />
                YENİ BİLDİRİM
              </Typography>
              <IconButton
                size="small"
                onClick={() => setShowModal(false)}
                sx={{ color: "white", opacity: 0.7, "&:hover": { opacity: 1 } }}
              >
                <IconBell size="18" />
              </IconButton>
            </Stack>

            <Box
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.15)",
                padding: "16px",
                borderRadius: "12px",
                borderLeft: "4px solid #fff",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  mb: 0.5,
                  wordBreak: "break-word",
                  lineHeight: 1.3,
                }}
              >
                {lastBildirim?.konu}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  fontSize: "0.9rem",
                  wordBreak: "break-word",
                  lineHeight: 1.4,
                }}
              >
                {lastBildirim?.aciklama}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
              <Button
                onClick={() => {
                  if (lastBildirim) handleKontrolEt(lastBildirim);
                }}
                variant="contained"
                sx={{
                  backgroundColor: "white",
                  color: theme.palette.error.main,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  borderRadius: "8px",
                  px: 3,
                  py: 0.8,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Kontrol Et
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Şirket/Yıl Değiştirme Onay Diyaloğu */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            padding: "8px",
          }
        }}
      >
        <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 700 }}>
          ⚠️ Şirket ve Yıl Değişikliği
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-dialog-description" sx={{ color: 'text.primary' }}>
            Bu bildirim <strong>{pendingBildirim?.yil}</strong> yılına ve farklı bir şirkete aittir.
            Devam ederseniz mevcut seçili şirket ve yıl bilgileriniz değiştirilecektir.
            <br /><br />
            Onaylıyor musunuz?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmOpen(false)}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Vazgeç
          </Button>
          <Button
            onClick={handleConfirmSwitch}
            color="primary"
            variant="contained"
            autoFocus
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Onayla ve Değiştir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Notifications;

