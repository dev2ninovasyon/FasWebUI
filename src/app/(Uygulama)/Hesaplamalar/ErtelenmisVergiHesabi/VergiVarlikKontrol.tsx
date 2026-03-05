"use client";

import React from "react";
import { Box } from "@mui/material";
import VergiVarlik from "./VergiVarlik";
import VergiYukumluluk from "./VergiYukumluluk";
import ErtelenmisVergiHesabiCard from "@/app/(Uygulama)/components/Hesaplamalar/ErtelenmisVergiHesabi/ErtelenemisVergiHesabiCard";

const VergiVarlikKontrol: React.FC = () => {
    return (
        <Box>
            <VergiVarlik hesaplaTiklandimi={false} />
            <VergiYukumluluk hesaplaTiklandimi={false} />
            <ErtelenmisVergiHesabiCard hesaplaTiklandimi={false} />
        </Box>
    );
};

export default VergiVarlikKontrol;
