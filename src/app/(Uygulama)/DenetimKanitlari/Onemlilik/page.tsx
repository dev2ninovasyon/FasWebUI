"use client";

import React, { useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box, Button } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import FilteredMenu from "@/app/(Uygulama)/components/Tables/MenuTable";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import OnemlilikLayout from "./OnemlilikLayout";

const Page = () => {
  const [showFilteredMenu, setShowFilteredMenu] = useState(true);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };

  return (
    <OnemlilikLayout>
      <PageContainer title="Önemlilik" description="this is Önemlilik">
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
            <FilteredMenu title="Önemlilik" showStatusIcons={false} />
          ) : (
            <TopCards title="Önemlilik" />
          )}
        </Box>
      </PageContainer>
    </OnemlilikLayout>
  );
};

export default Page;
