import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";

interface PaylasimBaglantisiPopUpProps {
  isPopUpOpen: boolean;
  handleClosePopUp: () => void;
}

const PaylasimBaglantisiPopUp: React.FC<PaylasimBaglantisiPopUpProps> = ({
  isPopUpOpen,
  handleClosePopUp,
}) => {
  return (
    <Dialog
      fullWidth
      maxWidth={"md"}
      open={isPopUpOpen}
      onClose={handleClosePopUp}
    >
      <>
        <DialogContent className="testdialog" sx={{ overflow: "visible" }}>
          <Stack
            direction="row"
            spacing={2}
            justifyContent={"space-between"}
            alignItems="center"
          >
            <Typography variant="h4" py={1} px={3}>
              Paylaşım Bağlantısı
            </Typography>
            <IconButton size="small" onClick={handleClosePopUp}>
              <IconX size="18" />
            </IconButton>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogContent>
          <Box px={3} pt={3}>
            <Button
              type="button"
              size="medium"
              variant="outlined"
              color="primary"
              fullWidth
            >
              Paylaşım Bağlantısı Oluştur
            </Button>
          </Box>
          <Box px={3} pt={3}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6" p={1}>
                  Bağlantı Linki:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6" p={1}></Typography>
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6" p={1}>
                  Bağlantı Bitiş Zamanı:
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} lg={6}>
                <Typography variant="h6" p={1}></Typography>
              </Grid>
            </Grid>
          </Box>
          <Box px={3} py={3}>
            <Button
              type="button"
              size="medium"
              variant="outlined"
              color="error"
              fullWidth
            >
              Paylaşım Bağlantısını Sil
            </Button>
          </Box>
        </DialogContent>
      </>
    </Dialog>
  );
};

export default PaylasimBaglantisiPopUp;
