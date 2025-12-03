"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";

const Page = () => {
    return (
        <PageContainer
            title="1. Belgelendirme"
            description="Belgelendirme"
        >
            <Box>
                <TopCards title="1. Belgelendirme" />
            </Box>
        </PageContainer>
    );
};

export default Page;
