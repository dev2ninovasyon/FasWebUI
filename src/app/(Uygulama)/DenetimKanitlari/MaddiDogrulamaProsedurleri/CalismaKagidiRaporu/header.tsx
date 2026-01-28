import React from "react";
import { Box, Typography, Grid, Divider, useTheme } from "@mui/material";
import Image from "next/image";

interface Props {
    denetlenenId: number;
    yil: number;
    denetciName: string;
    denetlenenName: string;
    reportName: string;
}

const ReportHeader: React.FC<Props> = ({
    denetlenenId,
    yil,
    denetciName,
    denetlenenName,
    reportName,
}) => {
    const theme = useTheme();

    return (
        <Box sx={{ mb: 4 }}>
            <Grid container alignItems="center" spacing={2}>
                <Grid size={2}>
                    <Image
                        src={theme.palette.mode === 'dark' ? "/images/logos/light-logo.svg" : "/images/logos/dark-logo.svg"}
                        alt="Logo"
                        width={120}
                        height={40}
                        priority
                    />
                </Grid>
                <Grid textAlign="center" size={8}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                        {denetlenenName}
                    </Typography>
                    <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                        {yil} Yılı Bağımsız Denetim Çalışma Kağıdı
                    </Typography>
                </Grid>
                <Grid textAlign="right" size={2}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                        Tarih: {new Date().toLocaleDateString("tr-TR")}
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Belge No: CW-{denetlenenId}-{yil}
                    </Typography>
                </Grid>
            </Grid>
            <Divider sx={{ my: 2, borderBottomWidth: 2, borderColor: theme.palette.divider }} />
            <Box sx={{ textAlign: "center", py: 1, bgcolor: theme.palette.action.hover, borderRadius: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {reportName}
                </Typography>
            </Box>
        </Box>
    );
};

export default ReportHeader;
