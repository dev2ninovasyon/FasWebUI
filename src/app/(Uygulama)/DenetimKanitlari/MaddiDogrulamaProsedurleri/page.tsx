"use client";

import { useState, useEffect } from "react";
import MaddiDogrulamaListe from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaListe";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import AddIcon from "@mui/icons-material/Add";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/MaddiDogrulamaProsedurleri",
    title: "Maddi Doğrulama Prosedürleri",
  },
];

const Page = () => {
  const [viewMode, setViewMode] = useState<"list" | "card">("list");

  return (
    <>
      <Breadcrumb title="Maddi Doğrulama Prosedürleri" items={BCrumb} />
      <PageContainer
        title="Maddi Doğrulama Prosedürleri"
        description="Bu sayfa Maddi Doğrulama Prosedürleri ile ilgilidir."
      >
        <Box>
          <MaddiDogrulamaListe onViewModeChange={setViewMode} />
        </Box>
      </PageContainer>
    </>
  );
};

export default Page;
