"use client";

import React, { useState } from "react";
import Fab from "@mui/material/Fab";
import { useTheme } from "@mui/material/styles";
import { IconInfoCircle } from "@tabler/icons-react";
import DriverTour from "@/app/(Uygulama)/components/Dashboards/DriverTour";

const TourFloatingButton: React.FC = () => {
    const [showTour, setShowTour] = useState(false);
    const theme = useTheme();

    return (
        /* <>
             <Fab
                 variant="extended"          // yazılı fab
                 color="primary"
                 size="medium"
                 onClick={() => setShowTour(true)}
                 sx={{
                     position: "fixed",
                     right: 24,
                     bottom: 24,
                     zIndex: theme.zIndex.modal + 1,
                     boxShadow: 4,
                     gap: 1.2,                 // ikon ile yazı arası boşluk
                     px: 2.5,                  // sağ/sol padding
                 }}
             >
                 <IconInfoCircle size={20} style={{ marginRight: 4 }} />
                 Rehberi Başlat
             </Fab>
 
             <DriverTour run={showTour} onClose={() => setShowTour(false)} />
         </>
         */
        <></>
    );
};

export default TourFloatingButton;
