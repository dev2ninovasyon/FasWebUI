"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";

import MusteriLayout from "./MusteriLayout";
import TopCards from "@/app/(Uygulama)/components/Cards/TopCards";
import FilteredMenu from "@/app/(Uygulama)/components/Tables/MenuTable";
import { Box, Button } from "@mui/material";
import { IconLayoutGrid, IconList } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);

  const [showFilteredMenu, setShowFilteredMenu] = useState(true);

  const handleToggle = () => {
    setShowFilteredMenu((prev) => !prev);
  };

  useEffect(() => {
    if (user.rol == undefined) {
      setShowFilteredMenu(false);
    } else {
      setShowFilteredMenu(true);
    }
  }, [user.rol]);

  return (
    <MusteriLayout>
      <PageContainer title="Müşteri" description="this is Müşteri">
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
              {/* Toggle between icons */}
            </Button>
          </Box>

          {showFilteredMenu ? (
            <FilteredMenu title="MÜŞTERİ" />
          ) : (
            <TopCards title="MÜŞTERİ" />
          )}
        </Box>
      </PageContainer>
    </MusteriLayout>
  );
};

export default Page;
