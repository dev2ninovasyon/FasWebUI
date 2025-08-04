"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import MuhasebeHatalariVeHileLayout from "./MuhasebeHatalariVeHileLayout";
import MuhasebeHatalariVeHileTopCard from "@/app/(Uygulama)/components/Cards/MuhasebeHatalariVeHileTopCard";

const Page = () => {
  return (
    <MuhasebeHatalariVeHileLayout>
      <PageContainer
        title="Muhasebe Hataları Ve Hileye İlişkin Çalışmalar"
        description="this is Muhasebe Hataları Ve Hileye İlişkin Çalışmalar"
      >
        <Box>
          <MuhasebeHatalariVeHileTopCard />
        </Box>
      </PageContainer>
    </MuhasebeHatalariVeHileLayout>
  );
};

export default Page;
