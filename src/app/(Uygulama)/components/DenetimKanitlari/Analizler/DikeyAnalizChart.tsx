import { Button, Grid, Typography, useTheme } from "@mui/material";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Veri {
  id: number;
  tabloAdi: string;
  kalemId: number | null;
  kalemParentId: number | null;
  parentId: number | null;
  adi: string;
  kebirKodu: number | null;
  tutarCariDonem: number;
  oranGenelCariDonem: number;
  oranGrupCariDonem: number;
  tutarOncekiDonem: number;
  oranGenelOncekiDonem: number;
  oranGrupOncekiDonem: number;
}

interface Props {
  kalemData: Veri[];
  tabloAdi: string;
  title: string;
}

const DikeyAnalizChart: React.FC<Props> = ({ kalemData, tabloAdi, title }) => {
  const user = useSelector((state: AppState) => state.userReducer);
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();

  const primary =
    customizer.activeMode == "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.main;
  const secondary =
    customizer.activeMode == "dark"
      ? theme.palette.secondary.light
      : theme.palette.secondary.main;
  const info =
    customizer.activeMode == "dark"
      ? theme.palette.info.light
      : theme.palette.info.main;
  const success =
    customizer.activeMode == "dark"
      ? theme.palette.success.light
      : theme.palette.success.main;
  const warning =
    customizer.activeMode == "dark"
      ? theme.palette.warning.light
      : theme.palette.warning.main;
  const error =
    customizer.activeMode == "dark"
      ? theme.palette.error.light
      : theme.palette.error.main;

  function getFilteredValues<T>(
    data: typeof kalemData,
    parentKalemAdi: string,
    property: keyof (typeof kalemData)[number],
    condition: (item: (typeof kalemData)[number]) => boolean
  ): T[] {
    const parentKalemId = data.find(
      (item) => item.adi === parentKalemAdi
    )?.kalemId;

    if (!parentKalemId) {
      return [];
    }

    return data
      .filter((item) => item.kalemParentId === parentKalemId && condition(item))
      .map((item) => item[property] as T);
  }

  let donenVarliklarKalemAdlari = getFilteredValues<string>(
    kalemData,
    `Dönen Varlıklar [abstract]`,
    "adi",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );
  let donenVarliklarOranlarOnceki = getFilteredValues<number>(
    kalemData,
    `Dönen Varlıklar [abstract]`,
    "oranGrupOncekiDonem",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );
  let donenVarliklarOranlarCari = getFilteredValues<number>(
    kalemData,
    `Dönen Varlıklar [abstract]`,
    "oranGrupCariDonem",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );

  let duranVarliklarKalemAdlari = getFilteredValues<string>(
    kalemData,
    `Duran Varlıklar [abstract]`,
    "adi",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );
  let duranVarliklarOranlarOnceki = getFilteredValues<number>(
    kalemData,
    `Duran Varlıklar [abstract]`,
    "oranGrupOncekiDonem",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );
  let duranVarliklarOranlarCari = getFilteredValues<number>(
    kalemData,
    `Duran Varlıklar [abstract]`,
    "oranGrupCariDonem",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );

  let ozkaynaklarKalemAdlari = getFilteredValues<string>(
    kalemData,
    `Özkaynaklar [abstract]`,
    "adi",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );
  let ozkaynaklarOranlarOnceki = getFilteredValues<number>(
    kalemData,
    `Özkaynaklar [abstract]`,
    "oranGrupOncekiDonem",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );
  let ozkaynaklarOranlarCari = getFilteredValues<number>(
    kalemData,
    `Özkaynaklar [abstract]`,
    "oranGrupCariDonem",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );

  let kisaVadeliYukumluluklerKalemAdlari = getFilteredValues<string>(
    kalemData,
    `Kısa Vadeli Yükümlülükler [abstract]`,
    "adi",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );
  let kisaVadeliYukumluluklerOranlarOnceki = getFilteredValues<number>(
    kalemData,
    `Kısa Vadeli Yükümlülükler [abstract]`,
    "oranGrupOncekiDonem",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );
  let kisaVadeliYukumluluklerOranlarCari = getFilteredValues<number>(
    kalemData,
    `Kısa Vadeli Yükümlülükler [abstract]`,
    "oranGrupCariDonem",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );

  let uzunVadeliYukumluluklerKalemAdlari = getFilteredValues<string>(
    kalemData,
    `Uzun Vadeli Yükümlülükler [abstract]`,
    "adi",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );
  let uzunVadeliYukumluluklerOranlarOnceki = getFilteredValues<number>(
    kalemData,
    `Uzun Vadeli Yükümlülükler [abstract]`,
    "oranGrupOncekiDonem",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );
  let uzunVadeliYukumluluklerOranlarCari = getFilteredValues<number>(
    kalemData,
    `Uzun Vadeli Yükümlülükler [abstract]`,
    "oranGrupCariDonem",
    (item) => item.oranGrupCariDonem !== 0 && item.oranGrupOncekiDonem !== 0
  );

  let donemNetKariZarariKalemAdlari = getFilteredValues<string>(
    kalemData,
    `Dönem Net Karı (Zararı) [abstract]`,
    "adi",
    (item) =>
      item.oranGenelCariDonem !== 0 &&
      item.oranGenelOncekiDonem !== 0 &&
      item.oranGenelCariDonem !== 100 &&
      item.oranGenelOncekiDonem !== 100
  );
  let donemNetKariZarariOranlarOnceki = getFilteredValues<number>(
    kalemData,
    `Dönem Net Karı (Zararı) [abstract]`,
    "oranGenelOncekiDonem",
    (item) =>
      item.oranGenelCariDonem !== 0 &&
      item.oranGenelOncekiDonem !== 0 &&
      item.oranGenelCariDonem !== 100 &&
      item.oranGenelOncekiDonem !== 100
  );
  let donemNetKariZarariOranlarCari = getFilteredValues<number>(
    kalemData,
    `Dönem Net Karı (Zararı) [abstract]`,
    "oranGenelCariDonem",
    (item) =>
      item.oranGenelCariDonem !== 0 &&
      item.oranGenelOncekiDonem !== 0 &&
      item.oranGenelCariDonem !== 100 &&
      item.oranGenelOncekiDonem !== 100
  );

  const chartOptionsDonenOnceki: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(donenVarliklarOranlarOnceki[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: donenVarliklarKalemAdlari,
  };
  const chartOptionsDonenCari: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(donenVarliklarOranlarCari[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: donenVarliklarKalemAdlari,
  };

  const chartOptionsDuranOnceki: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(duranVarliklarOranlarOnceki[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: duranVarliklarKalemAdlari,
  };
  const chartOptionsDuranCari: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(duranVarliklarOranlarCari[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: duranVarliklarKalemAdlari,
  };

  const chartOptionsKisaOnceki: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(kisaVadeliYukumluluklerOranlarOnceki[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: kisaVadeliYukumluluklerKalemAdlari,
  };
  const chartOptionsKisaCari: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(kisaVadeliYukumluluklerOranlarCari[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: kisaVadeliYukumluluklerKalemAdlari,
  };

  const chartOptionsUzunOnceki: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(uzunVadeliYukumluluklerOranlarOnceki[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: uzunVadeliYukumluluklerKalemAdlari,
  };
  const chartOptionsUzunCari: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(uzunVadeliYukumluluklerOranlarCari[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: uzunVadeliYukumluluklerKalemAdlari,
  };

  const chartOptionsOzkaynakOnceki: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(ozkaynaklarOranlarOnceki[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: ozkaynaklarKalemAdlari,
  };
  const chartOptionsOzkaynakCari: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(ozkaynaklarOranlarCari[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: ozkaynaklarKalemAdlari,
  };

  const chartOptionsDonemNetKariZarariOnceki: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(donemNetKariZarariOranlarOnceki[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: donemNetKariZarariKalemAdlari,
  };
  const chartOptionsDonemNetKariZarariCari: any = {
    chart: {
      id: "pie-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      events: {},
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const index = opts.seriesIndex;
        return `${Math.abs(donemNetKariZarariOranlarCari[index])}%`;
      },
    },
    colors: [primary, secondary, info, success, warning, error],
    plotOptions: {
      pie: {
        donut: {
          size: "70px",
        },
      },
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
    tooltip: {
      fillSeriesColor: false,
    },
    labels: donemNetKariZarariKalemAdlari,
  };

  return (
    <Grid container>
      {tabloAdi == "finansaldurum" && (
        <>
          <Grid item xs={12} lg={12} mb={3}>
            <ParentCard title={`${title} (${user.yil ? user.yil - 1 : 0})`}>
              <Grid container>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <Grid item xs={12} lg={4}>
                    <Typography variant="h6" align="center" mb={1}>
                      Dönen Varlıklar
                    </Typography>
                    <Chart
                      options={chartOptionsDonenOnceki}
                      series={donenVarliklarOranlarOnceki.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Typography variant="h6" align="center" mb={1}>
                      Duran Varlıklar
                    </Typography>
                    <Chart
                      options={chartOptionsDuranOnceki}
                      series={duranVarliklarOranlarOnceki.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <Grid item xs={12} lg={4}>
                    <Typography variant="h6" align="center" mb={1} mt={3}>
                      Kısa Vadeli Yükümlülükler
                    </Typography>
                    <Chart
                      options={chartOptionsKisaOnceki}
                      series={kisaVadeliYukumluluklerOranlarOnceki.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Typography variant="h6" align="center" mb={1} mt={3}>
                      Uzun Vadeli Yükümlülükler
                    </Typography>
                    <Chart
                      options={chartOptionsUzunOnceki}
                      series={uzunVadeliYukumluluklerOranlarOnceki.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Typography variant="h6" align="center" mb={1} mt={3}>
                      Özkaynaklar
                    </Typography>
                    <Chart
                      options={chartOptionsOzkaynakOnceki}
                      series={ozkaynaklarOranlarOnceki.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </ParentCard>
          </Grid>
          <Grid item xs={12} lg={12}>
            <ParentCard title={`${title} (${user.yil ? user.yil : 0})`}>
              <Grid container>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <Grid item xs={12} lg={4}>
                    <Typography variant="h6" align="center" mb={1}>
                      Dönen Varlıklar
                    </Typography>
                    <Chart
                      options={chartOptionsDonenCari}
                      series={donenVarliklarOranlarCari.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Typography variant="h6" align="center" mb={1}>
                      Duran Varlıklar
                    </Typography>
                    <Chart
                      options={chartOptionsDuranCari}
                      series={duranVarliklarOranlarCari.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <Grid item xs={12} lg={4}>
                    <Typography variant="h6" align="center" mb={1} mt={3}>
                      Kısa Vadeli Yükümlülükler
                    </Typography>
                    <Chart
                      options={chartOptionsKisaCari}
                      series={kisaVadeliYukumluluklerOranlarCari.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Typography variant="h6" align="center" mb={1} mt={3}>
                      Uzun Vadeli Yükümlülükler
                    </Typography>
                    <Chart
                      options={chartOptionsUzunCari}
                      series={uzunVadeliYukumluluklerOranlarCari.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                  <Grid item xs={12} lg={4}>
                    <Typography variant="h6" align="center" mb={1} mt={3}>
                      Özkaynaklar
                    </Typography>
                    <Chart
                      options={chartOptionsOzkaynakCari}
                      series={ozkaynaklarOranlarCari.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </ParentCard>
          </Grid>
        </>
      )}
      {tabloAdi == "karzarar" && (
        <>
          <Grid item xs={12} lg={12} mb={3}>
            <ParentCard title={`${title} (${user.yil ? user.yil - 1 : 0})`}>
              <Grid container>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <Grid item xs={12} lg={4}>
                    <Chart
                      options={chartOptionsDonemNetKariZarariOnceki}
                      series={donemNetKariZarariOranlarOnceki.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </ParentCard>
          </Grid>
          <Grid item xs={12} lg={12}>
            <ParentCard title={`${title} (${user.yil ? user.yil : 0})`}>
              <Grid container>
                <Grid
                  item
                  xs={12}
                  lg={12}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <Grid item xs={12} lg={4}>
                    <Chart
                      options={chartOptionsDonemNetKariZarariCari}
                      series={donemNetKariZarariOranlarCari.map((val) =>
                        Math.abs(val)
                      )}
                      type="pie"
                      height="300px"
                      width="100%"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </ParentCard>
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default DikeyAnalizChart;
