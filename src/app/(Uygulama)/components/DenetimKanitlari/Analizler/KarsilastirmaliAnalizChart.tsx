import { Button, Grid, useTheme } from "@mui/material";
import dynamic from "next/dynamic";
import React, { useState } from "react";
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
  tutarOncekiDonem: number;
  mutlak: number;
  yuzde: number;
  reel: number;
}

interface Props {
  kalemData: Veri[];
  tabloAdi: string;
  title: string;
}

const KarsilastirmaliAnalizChart: React.FC<Props> = ({
  kalemData,
  tabloAdi,
  title,
}) => {
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

  const [activeChart, setActiveChart] = useState<
    "Ana" | "Ara" | "Alt" | "En Alt"
  >("Ana");

  const [kaynaklarMi, setKaynaklarMi] = useState<boolean>(false);
  const [yukumluluklerMi, setYukumluluklerMi] = useState<boolean>(false);

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

  let anaKalemAdlari = getFilteredValues<string>(
    kalemData,
    `${title}`,
    "adi",
    (item) => item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
  );
  let anaTutarlarOnceki = getFilteredValues<number>(
    kalemData,
    `${title}`,
    "tutarOncekiDonem",
    (item) => item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
  );
  let anaTutarlarCari = getFilteredValues<number>(
    kalemData,
    `${title}`,
    "tutarCariDonem",
    (item) => item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
  );

  const [araKalemAdlari, setAraKalemAdlari] = React.useState<string[]>([]);
  const [araTutarlarOnceki, setAraTutarlarOnceki] = React.useState<number[]>(
    []
  );
  const [araTutarlarCari, setAraTutarlarCari] = React.useState<number[]>([]);

  const [altKalemAdlari, setAltKalemAdlari] = React.useState<string[]>([]);
  const [altTutarlarOnceki, setAltTutarlarOnceki] = React.useState<number[]>(
    []
  );
  const [altTutarlarCari, setAltTutarlarCari] = React.useState<number[]>([]);

  const [enAltKalemAdlari, setEnAltKalemAdlari] = React.useState<string[]>([]);
  const [enAltTutarlarOnceki, setEnAltTutarlarOnceki] = React.useState<
    number[]
  >([]);
  const [enAltTutarlarCari, setEnAltTutarlarCari] = React.useState<number[]>(
    []
  );

  const getChartData = () => {
    switch (activeChart) {
      case "Ana":
        return {
          categories: anaKalemAdlari,
          series: [
            {
              name: `${user.yil ? user.yil - 1 : null} Tutar`,
              data: anaTutarlarOnceki,
            },
            {
              name: `${user.yil ? user.yil : null} Tutar`,
              data: anaTutarlarCari,
            },
          ],
        };
      case "Ara":
        return {
          categories: araKalemAdlari,
          series: [
            {
              name: `${user.yil ? user.yil - 1 : null} Tutar`,
              data: araTutarlarOnceki,
            },
            {
              name: `${user.yil ? user.yil : null} Tutar`,
              data: araTutarlarCari,
            },
          ],
        };
      case "Alt":
        return {
          categories: altKalemAdlari,
          series: [
            {
              name: `${user.yil ? user.yil - 1 : null} Tutar`,
              data: altTutarlarOnceki,
            },
            {
              name: `${user.yil ? user.yil : null} Tutar`,
              data: altTutarlarCari,
            },
          ],
        };
      case "En Alt":
        return {
          categories: enAltKalemAdlari,
          series: [
            {
              name: `${user.yil ? user.yil - 1 : null} Tutar`,
              data: enAltTutarlarOnceki,
            },
            {
              name: `${user.yil ? user.yil : null} Tutar`,
              data: enAltTutarlarCari,
            },
          ],
        };
      default:
        return { categories: [], series: [] };
    }
  };

  const chartData = getChartData();

  const chartOptions: any = {
    chart: {
      id: "dynamic-chart",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      foreColor: "#adb0bb",
      toolbar: { show: false },
      events: {
        dataPointSelection: (event: any, chartContext: any, config: any) => {
          const dataPointIndex = config.dataPointIndex;

          if (tabloAdi == "finansaldurum") {
            if (activeChart === "Ana") {
              if (dataPointIndex === 0) {
                setAraKalemAdlari(
                  getFilteredValues<string>(
                    kalemData,
                    "Varlıklar [abstract]",
                    "adi",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setAraTutarlarOnceki(
                  getFilteredValues<number>(
                    kalemData,
                    "Varlıklar [abstract]",
                    "tutarOncekiDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setAraTutarlarCari(
                  getFilteredValues<number>(
                    kalemData,
                    "Varlıklar [abstract]",
                    "tutarCariDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
              } else if (dataPointIndex === 1) {
                setKaynaklarMi(true);

                setAraKalemAdlari(
                  getFilteredValues<string>(
                    kalemData,
                    "Kaynaklar [abstract]",
                    "adi",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setAraTutarlarOnceki(
                  getFilteredValues<number>(
                    kalemData,
                    "Kaynaklar [abstract]",
                    "tutarOncekiDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setAraTutarlarCari(
                  getFilteredValues<number>(
                    kalemData,
                    "Kaynaklar [abstract]",
                    "tutarCariDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
              }
              setActiveChart("Ara");
            } else if (activeChart === "Ara") {
              if (dataPointIndex === 0 && kaynaklarMi) {
                setYukumluluklerMi(true);

                setAltKalemAdlari(
                  getFilteredValues<string>(
                    kalemData,
                    "Yükümlülükler [abstract]",
                    "adi",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setAltTutarlarOnceki(
                  getFilteredValues<number>(
                    kalemData,
                    "Yükümlülükler [abstract]",
                    "tutarOncekiDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );

                setAltTutarlarCari(
                  getFilteredValues<number>(
                    kalemData,
                    "Yükümlülükler [abstract]",
                    "tutarCariDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );

                setActiveChart("Alt");
              } else if (dataPointIndex === 1 && kaynaklarMi) {
                setYukumluluklerMi(false);

                setEnAltKalemAdlari(
                  getFilteredValues<string>(
                    kalemData,
                    "Özkaynaklar [abstract]",
                    "adi",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarOnceki(
                  getFilteredValues<number>(
                    kalemData,
                    "Özkaynaklar [abstract]",
                    "tutarOncekiDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarCari(
                  getFilteredValues<number>(
                    kalemData,
                    "Özkaynaklar [abstract]",
                    "tutarCariDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );

                setActiveChart("En Alt");
              } else if (dataPointIndex === 0 && !kaynaklarMi) {
                setEnAltKalemAdlari(
                  getFilteredValues<string>(
                    kalemData,
                    "Dönen Varlıklar [abstract]",
                    "adi",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarOnceki(
                  getFilteredValues<number>(
                    kalemData,
                    "Dönen Varlıklar [abstract]",
                    "tutarOncekiDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarCari(
                  getFilteredValues<number>(
                    kalemData,
                    "Dönen Varlıklar [abstract]",
                    "tutarCariDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );

                setActiveChart("En Alt");
              } else if (dataPointIndex === 1 && !kaynaklarMi) {
                setEnAltKalemAdlari(
                  getFilteredValues<string>(
                    kalemData,
                    "Duran Varlıklar [abstract]",
                    "adi",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarOnceki(
                  getFilteredValues<number>(
                    kalemData,
                    "Duran Varlıklar [abstract]",
                    "tutarOncekiDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarCari(
                  getFilteredValues<number>(
                    kalemData,
                    "Duran Varlıklar [abstract]",
                    "tutarCariDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );

                setActiveChart("En Alt");
              }
            } else if (activeChart === "Alt") {
              if (dataPointIndex === 0) {
                setEnAltKalemAdlari(
                  getFilteredValues<string>(
                    kalemData,
                    "Kısa Vadeli Yükümlülükler [abstract]",
                    "adi",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarOnceki(
                  getFilteredValues<number>(
                    kalemData,
                    "Kısa Vadeli Yükümlülükler [abstract]",
                    "tutarOncekiDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarCari(
                  getFilteredValues<number>(
                    kalemData,
                    "Kısa Vadeli Yükümlülükler [abstract]",
                    "tutarCariDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
              } else if (dataPointIndex === 1) {
                const adlar = kalemData
                  .filter(
                    (k) =>
                      k.kalemParentId ===
                        kalemData.find(
                          (kalem) =>
                            kalem.adi === "Uzun Vadeli Yükümlülükler [abstract]"
                        )?.kalemId &&
                      k.tutarCariDonem !== 0 &&
                      k.tutarOncekiDonem !== 0
                  )
                  .map((k) => k.adi);
                const onceki = kalemData
                  .filter(
                    (k) =>
                      k.kalemParentId ===
                        kalemData.find(
                          (kalem) =>
                            kalem.adi === "Uzun Vadeli Yükümlülükler [abstract]"
                        )?.kalemId &&
                      k.tutarCariDonem !== 0 &&
                      k.tutarOncekiDonem !== 0
                  )
                  .map((k) => k.tutarOncekiDonem);
                const cari = kalemData
                  .filter(
                    (k) =>
                      k.kalemParentId ===
                        kalemData.find(
                          (kalem) =>
                            kalem.adi === "Uzun Vadeli Yükümlülükler [abstract]"
                        )?.kalemId &&
                      k.tutarCariDonem !== 0 &&
                      k.tutarOncekiDonem !== 0
                  )
                  .map((k) => k.tutarCariDonem);

                setEnAltKalemAdlari(
                  getFilteredValues<string>(
                    kalemData,
                    "Uzun Vadeli Yükümlülükler [abstract]",
                    "adi",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarOnceki(
                  getFilteredValues<number>(
                    kalemData,
                    "Uzun Vadeli Yükümlülükler [abstract]",
                    "tutarOncekiDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarCari(
                  getFilteredValues<number>(
                    kalemData,
                    "Uzun Vadeli Yükümlülükler [abstract]",
                    "tutarCariDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
              }
              setActiveChart("En Alt");
            }
          } else if (tabloAdi == "karzarar") {
            if (activeChart === "Ana") {
              if (dataPointIndex === 0) {
                setEnAltKalemAdlari(
                  getFilteredValues<string>(
                    kalemData,
                    "Dönem Net Karı (Zararı) [abstract]",
                    "adi",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarOnceki(
                  getFilteredValues<number>(
                    kalemData,
                    "Dönem Net Karı (Zararı) [abstract]",
                    "tutarOncekiDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
                setEnAltTutarlarCari(
                  getFilteredValues<number>(
                    kalemData,
                    "Dönem Net Karı (Zararı) [abstract]",
                    "tutarCariDonem",
                    (item) =>
                      item.tutarCariDonem !== 0 && item.tutarOncekiDonem !== 0
                  )
                );
              }
              setActiveChart("En Alt");
            }
          }
        },
      },
    },
    colors: [primary, secondary],
    plotOptions: {
      bar: {
        horizontal: false,
        endingShape: "rounded",
        columnWidth: "20%",
        colors: {
          ranges: [
            {
              from: Number.MIN_VALUE,
              to: 0,
              color: theme.palette.error, // Negatif değerler için kırmızı
            },
          ],
        },
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: { categories: chartData.categories },
    yaxis: {
      title: { text: "Tutar" },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val: number) =>
          new Intl.NumberFormat("tr-TR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(val),
      },
      theme: "dark",
    },
    grid: { show: false },
    legend: {
      show: true,
      position: "bottom",
      width: "50px",
    },
  };

  const handleBack = () => {
    if (tabloAdi == "finansaldurum") {
      if (activeChart === "En Alt" && yukumluluklerMi) setActiveChart("Alt");
      else if (activeChart === "En Alt" && !yukumluluklerMi)
        setActiveChart("Ara");
      else if (activeChart === "Alt") setActiveChart("Ara");
      else if (activeChart === "Ara") setActiveChart("Ana");
    } else if (tabloAdi == "karzarar") {
      if (activeChart === "En Alt") setActiveChart("Ana");
    }
  };

  return (
    <ParentCard title={title}>
      <Grid container>
        <Grid item xs={12} mt={2} sx={{ minHeight: 300, maxHeight: 300 }}>
          <Chart
            options={chartOptions}
            series={chartData.series}
            type="bar"
            height="300px"
            width="100%"
          />
        </Grid>
        {activeChart !== "Ana" && (
          <Grid item xs={12}>
            <Button
              type="button"
              size="medium"
              variant="outlined"
              color="primary"
              onClick={handleBack}
            >
              Geri
            </Button>
          </Grid>
        )}
      </Grid>
    </ParentCard>
  );
};

export default KarsilastirmaliAnalizChart;
