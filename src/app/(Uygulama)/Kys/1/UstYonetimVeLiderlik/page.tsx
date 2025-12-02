"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
    return (
        <PageContainer
            title="3. Üst Yönetim ve Liderlik Yapısı"
            description="Üst Yönetim ve Liderlik Yapısı"
        >
            <Box>
                <TopCards title="3. Üst Yönetim ve Liderlik Yapısı" />
            </Box>
        </PageContainer>
    );
};

export default Page;
