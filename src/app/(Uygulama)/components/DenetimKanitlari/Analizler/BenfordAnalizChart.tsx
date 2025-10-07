"use client";

import dynamic from "next/dynamic";
import React, { useMemo } from "react";
import { Grid, useTheme } from "@mui/material";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { BenfordDagilimResponse } from "./BenfordAnaliz";

const Chart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => null, // üst tarafta BlankCard içinde Skeleton zaten gösteriliyor
});

interface Props {
  response: BenfordDagilimResponse | null;
  title: string; // başlığı dış kartta gösteriyoruz
}

const BenfordChart: React.FC<Props> = ({ response }) => {
  const theme = useTheme();
  const customizer = useSelector((s: AppState) => s.customizer);

  const primary =
    customizer.activeMode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.main;
  const secondary =
    customizer.activeMode === "dark"
      ? theme.palette.secondary.light
      : theme.palette.secondary.main;

  const categories = useMemo(
    () => (response?.dagilim ?? []).map((d) => d.basamak.toString()),
    [response]
  );

  const series = useMemo(
    () => [
      {
        name: "Gerçek %",
        data: (response?.dagilim ?? []).map((d) => Math.round(d.gercekFrekans * 1000) / 10),
      },
      {
        name: "Teorik %",
        data: (response?.dagilim ?? []).map((d) => Math.round(d.teorikFrekans * 1000) / 10),
      },
    ],
    [response]
  );

  const options: any = {
    chart: {
      type: "line",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      animations: { enabled: true },
      toolbar: { show: false },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 3, curve: "smooth" },
    markers: { size: 3, hover: { sizeOffset: 2 } },
    xaxis: { categories, title: { text: "İlk Basamak" } },
    yaxis: {
      title: { text: "Yüzde (%)" },
      labels: { formatter: (v: number) => `${v}` },
      min: 0,
      max: 35, // istersen kaldır
    },
    colors: [primary, secondary],
    legend: { position: "top" },
    tooltip: { shared: true, intersect: false },
  };

  return (
    <Grid container>
      <Grid item xs={12} lg={12}>
        {(response?.dagilim ?? []).length > 0 ? (
          <Chart options={options} series={series} type="line" height={420} width="100%" />
        ) : null}
      </Grid>
    </Grid>
  );
};

export default BenfordChart;
