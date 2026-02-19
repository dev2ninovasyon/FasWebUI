import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Link,
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  full?: boolean; // when true, dialog opens fullscreen
}

const FullScreenInfoDialog: React.FC<Props> = ({
  open,
  onClose,
  title = "Bilgi",
  children,
  full = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      {...(full ? { fullScreen: true } : { maxWidth: "md", fullWidth: true })}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {children ? (
          children
        ) : (
          <>
            <Typography paragraph>
              İskonto oranı: "Bankalarca Açılan Ticari Kredilere Uygulanan Ağırlıklı Ortalama Faiz Oranları" verisinden veya alacağın vadesine uygun DİBS (Devlet İç Borçlanma Senetleri) getiri eğrisinden veya TLREF oranı alınabilir. TLREF için: <Link href="https://www.borsaistanbul.com/endeksler/tlref" target="_blank" rel="noopener">https://www.borsaistanbul.com/endeksler/tlref</Link>
            </Typography>
            <Typography paragraph>
              Revize oran için açıklama: Değişken faizli araçlarda, piyasa koşullarına göre faiz güncellendiğinde, revize edilmiş nakit akışlarını varlığın defter değerine eşitleyen yeni bir etkin faiz oranı hesaplanır.
            </Typography>
            <Typography paragraph>Not: Önce İskonto Oranı, sonra Revize Oranı girilmelidir.</Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Kapat</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FullScreenInfoDialog;
