"use client";

import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import MizanKontrolLayout from "./MizanKontrolLayout";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import FilteredMenu from "@/app/(Uygulama)/components/Tables/MenuTable";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";

const Page = () => {
  const [showFilteredMenu, setShowFilteredMenu] = useState(false);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };

  return (
    <MizanKontrolLayout>
      <PageContainer title="Mizan Kontrol" description="this is Mizan Kontrol">
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              paddingBottom: showFilteredMenu ? "32px" : "0px",
              paddingRight: "10px",
            }}
          >
            <Button onClick={handleToggle}>
              {showFilteredMenu ? (
                <IconLayoutGrid size={24} />
              ) : (
                <IconList size={24} />
              )}
            </Button>
          </Box>
          {showFilteredMenu ? (
            <FilteredMenu title="Mizan Kontrol" showStatusIcons={false} />
          ) : (
            <TopCards title="Mizan Kontrol" />
          )}
        </Box>
      </PageContainer>
    </MizanKontrolLayout>
  );
};

export default Page;
