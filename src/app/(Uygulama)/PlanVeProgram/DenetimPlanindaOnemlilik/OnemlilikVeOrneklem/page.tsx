"use client";

import React, { useRef } from "react";
import { Grid } from "@mui/material";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import OnemlilikExcelStepper, { OnemlilikExcelStepperRef } from "./OnemlilikExcelStepper";
import BelgeKontrolCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/BelgeKontrolCard";
import IslemlerCard from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/IslemlerCard";
import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan Ve Program",
  },
  {
    to: "/PlanVeProgram/DenetimPlanindaOnemlilik",
    title: "Denetim Planında Önemlilik",
  },
  {
    to: "/PlanVeProgram/DenetimPlanindaOnemlilik/OnemlilikVeOrneklem",
    title: "Önemlilik Ve Örneklem",
  },
];

const Page = () => {
  const user = useSelector((state: AppState) => state.userReducer);
  const stepperRef = useRef<OnemlilikExcelStepperRef>(null);

  const controller = "OnemlilikVeOrneklem";

  return (
    <PageContainer
      title="Önemlilik Ve Örneklem"
      description="Denetim Planı Önemlilik Ve Örneklem"
    >
      <Breadcrumb title="Önemlilik Ve Örneklem" items={BCrumb}>
        <EkBelgeYukleButton formKodu="OnemlilikVeOrneklem" />
      </Breadcrumb>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <OnemlilikExcelStepper ref={stepperRef} />
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <BelgeKontrolCard
                fetch={() => {}}
                hazirlayan="Denetçi - Yardımcı Denetçi"
                controller={controller}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <BelgeKontrolCard
                fetch={() => {}}
                onaylayan="Sorumlu Denetçi"
                controller={controller}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <BelgeKontrolCard
                fetch={() => {}}
                kaliteKontrol="Kalite Kontrol Sorumlu Denetçi"
                controller={controller}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <IslemlerCard
            controller={controller}
            handleReset={() => stepperRef.current?.handleReset()}
            handleRestorePrevious={() => stepperRef.current?.handleRestorePrevious()}
            handleExcelDownload={() => stepperRef.current?.handleExcelDownload()}
            handleWordDownload={() => stepperRef.current?.handleWordDownload()}
            handlePdfPreview={() => stepperRef.current?.handleOpenPreview()}
          />
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Page;
