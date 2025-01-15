"use client";

import MaddiDogrulamaListe from "@/app/(Uygulama)/components/CalismaKagitlari/MaddiDogrulama/MaddiDogrulamaListe";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box } from "@mui/material";

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
  return (
    <>
      <Breadcrumb title="Maddi Doğrulama Prosedürleri" items={BCrumb} />
      <PageContainer
        title="Maddi Doğrulama Prosedürleri"
        description="Bu sayfa Maddi Doğrulama Prosedürleri ile ilgilidir."
      >
        <Box>
          <MaddiDogrulamaListe />
        </Box>
      </PageContainer>
    </>
  );
};

export default Page;
