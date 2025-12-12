import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import dynamic from "next/dynamic";
import React from "react";
const YorumEditor = dynamic(
    () => import("@/app/(Uygulama)/components/Editor/YorumEditor"),
    {
        ssr: false,
    }
);

interface MaddiDogrulamaYorumComponentProps {
    parentName: string;
    childName: string;
}

const MaddiDogrulamaYorumComponent: React.FC<
    MaddiDogrulamaYorumComponentProps
> = ({ parentName, childName }) => {
    const user = useSelector((state: AppState) => state.userReducer);

    // belgeAdi oluşturma mantığı:
    // İsteğe göre burası özelleştirilebilir.
    // Kullanıcı "MaddiDogrulamaProsedurleri/${parentName}/${childName}" formatını istemişti.
    const belgeAdi = `MaddiDogrulamaProsedurleri/${parentName}/${childName}`;

    return (
        <YorumEditor
            denetlenenId={user.denetlenenId || 0}
            yil={user.yil || 0}
            belgeAdi={belgeAdi}
        />
    );
};

export default MaddiDogrulamaYorumComponent;
