"use client";

import React, { useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import { Box, Button } from "@mui/material";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import FilteredMenu from "@/app/(Uygulama)/components/Tables/MenuTable";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/FinansalTablolar",
    title: "Finansal Tablolar",
  },
];

const Page = () => {
  const [showFilteredMenu, setShowFilteredMenu] = useState(false);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };

  return (
    <PageContainer
      title="Finansal Tablolar"
      description="this is Finansal Tablolar"
    >
      <Breadcrumb title="Finansal Tablolar" items={BCrumb} />
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
          <FilteredMenu title="Finansal Tablolar" showStatusIcons={false} />
        ) : (
          <TopCards title="Finansal Tablolar" />
        )}
      </Box>
    </PageContainer>
  );
};

export default Page;
