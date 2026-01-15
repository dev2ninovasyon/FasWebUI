"use client";

import React, { useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box, Button } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import HesaplamalarLayout from "./HesaplamalarLayout";
import FilteredMenu from "@/app/(Uygulama)/components/Tables/MenuTable";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";

const Page = () => {
  const [showFilteredMenu, setShowFilteredMenu] = useState(true);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };

  return (
    <HesaplamalarLayout>
      <PageContainer title="Hesaplamalar" description="this is Hesaplamalar">
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
            <FilteredMenu title="HESAPLAMALAR" showStatusIcons={false} />
          ) : (
            <TopCards title="HESAPLAMALAR" />
          )}
        </Box>
      </PageContainer>
    </HesaplamalarLayout>
  );
};

export default Page;
