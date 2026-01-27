import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import dynamic from "next/dynamic";
import React from "react";
import { Box, Grid } from "@mui/material";

const YorumEditor = dynamic(
    () => import("@/app/(Uygulama)/components/Editor/YorumEditor"),
    {
        ssr: false,
    }
);

interface MaddiDogrulamaYorumComponentProps {
    parentName: string;
    childName: string;
    isReport?: boolean;
}

const MaddiDogrulamaYorumComponent: React.FC<
    MaddiDogrulamaYorumComponentProps
> = ({ parentName, childName, isReport }) => {
    const user = useSelector((state: AppState) => state.userReducer);

    // belgeAdi oluşturma mantığı:
    // İsteğe göre burası özelleştirilebilir.
    // Kullanıcı "MaddiDogrulamaProsedurleri/${parentName}/${childName}" formatını istemişti.
    const belgeAdi = `MaddiDogrulamaProsedurleri/${parentName}/${childName}`;

    return (
        <Box sx={{ width: "100%", marginY: 3 }}>
            <YorumEditor
                denetlenenId={user.denetlenenId || 0}
                yil={user.yil || 0}
                belgeAdi={belgeAdi}
                isReport={isReport}
            />
        </Box>
    );
};

export default MaddiDogrulamaYorumComponent;
