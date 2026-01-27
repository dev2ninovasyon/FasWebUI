import React from "react";
import { Box, Typography, Divider } from "@mui/material";

const ReportFooter: React.FC = () => {
    return (
        <Box sx={{ mt: 6, pt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", color: "#7F8C8D" }}>
                <Typography variant="caption">
                    Bu belge Fas Bağımsız Denetim Sistemi tarafından otomatik olarak oluşturulmuştur.
                </Typography>
                <Typography variant="caption">
                    Sayfa <span className="pageNumber"></span>
                </Typography>
            </Box>
        </Box>
    );
};

export default ReportFooter;
