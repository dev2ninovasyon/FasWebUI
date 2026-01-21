"use client";

import React, { useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import { Box, Button } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import FilteredMenu from "@/app/(Uygulama)/components/Tables/MenuTable";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import MutabakatLayout from "./MutabakatLayout";

const Page = () => {
  const [showFilteredMenu, setShowFilteredMenu] = useState(true);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };

  return (
    <MutabakatLayout>
      <PageContainer title="Mutabakat" description="this is Mutabakat">
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
            <FilteredMenu title="Mutabakat" showStatusIcons={false} />
          ) : (
            <TopCards title="Mutabakat" />
          )}
        </Box>
      </PageContainer>
    </MutabakatLayout>
  );
};

export default Page;
