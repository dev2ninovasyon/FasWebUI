"use client";

import React, { useMemo } from "react";
import { Box, Grid, IconButton, Stack, Tooltip, useTheme } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import { IconRefresh, IconZoomIn, IconZoomOut } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { BenfordDagilimResponse } from "./BenfordAnaliz";

export const BENFORD_CHART_HEIGHT = 560;
const MIN_CHART_ZOOM = 0.6;
const MAX_CHART_ZOOM = 2;
const CHART_ZOOM_STEP = 0.2;

interface Props {
  response: BenfordDagilimResponse | null;
  title: string;
  onBasamakClick?: (basamak: number) => void;
}

const BenfordChart: React.FC<Props> = ({ response, onBasamakClick }) => {
  const theme = useTheme();
  const customizer = useSelector((s: AppState) => s.customizer);
  const [chartZoom, setChartZoom] = React.useState(1);

  const primary =
    customizer.activeMode === "dark"
      ? theme.palette.primary.light
      : theme.palette.primary.main;
  const secondary =
    customizer.activeMode === "dark"
      ? theme.palette.secondary.light
      : theme.palette.secondary.main;

  const rows = useMemo(
    () =>
      (response?.dagilim ?? []).map((d) => ({
        basamak: d.basamak,
        gercek: Math.round(d.gercekFrekans * 1000) / 10,
        teorik: Math.round(d.teorikFrekans * 1000) / 10,
      })),
    [response]
  );

  const yAxisMax = useMemo(() => {
    const maxValue = rows.reduce(
      (max, row) => Math.max(max, row.gercek, row.teorik),
      0
    );

    return Math.max(35, Math.ceil((maxValue * 1.15) / 5) * 5);
  }, [rows]);

  return (
    <Grid container>
      <Grid
        size={{
          xs: 12,
          lg: 12,
        }}
      >
        {rows.length > 0 ? (
          <>
            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mb: 1 }}>
              <Tooltip title="Yakınlaştır">
                <span>
                  <IconButton
                    aria-label="Grafiği yakınlaştır"
                    size="small"
                    onClick={() =>
                      setChartZoom((value) => Math.min(value + CHART_ZOOM_STEP, MAX_CHART_ZOOM))
                    }
                    disabled={chartZoom >= MAX_CHART_ZOOM}
                  >
                    <IconZoomIn size={20} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Küçült">
                <span>
                  <IconButton
                    aria-label="Grafiği küçült"
                    size="small"
                    onClick={() =>
                      setChartZoom((value) => Math.max(value - CHART_ZOOM_STEP, MIN_CHART_ZOOM))
                    }
                    disabled={chartZoom <= MIN_CHART_ZOOM}
                  >
                    <IconZoomOut size={20} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Sıfırla">
                <span>
                  <IconButton
                    aria-label="Grafik yakınlaştırmasını sıfırla"
                    size="small"
                    onClick={() => setChartZoom(1)}
                    disabled={chartZoom === 1}
                  >
                    <IconRefresh size={20} />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>

            <Box sx={{ height: BENFORD_CHART_HEIGHT, overflow: "auto", position: "relative" }}>
              <Box
                sx={{
                  height: BENFORD_CHART_HEIGHT * chartZoom,
                  position: "relative",
                  width: `${chartZoom * 100}%`,
                }}
              >
                <Box
                  sx={{
                    left: 0,
                    position: "absolute",
                    top: 0,
                    transform: `scale(${chartZoom})`,
                    transformOrigin: "top left",
                    width: `${100 / chartZoom}%`,
                  }}
                >
                  <LineChart
                    colors={[primary, secondary]}
                    dataset={rows}
                    grid={{ horizontal: true, vertical: true }}
                    height={BENFORD_CHART_HEIGHT}
                    margin={{ left: 72, right: 24, top: 48, bottom: 64 }}
                    onMarkClick={(_, item) => {
                      if (item.dataIndex === undefined) return;
                      const basamak = rows[item.dataIndex]?.basamak;
                      if (onBasamakClick && basamak) {
                        onBasamakClick(basamak);
                      }
                    }}
                    series={[
                      {
                        dataKey: "gercek",
                        label: "Gerçek %",
                        curve: "linear",
                        showMark: true,
                      },
                      {
                        dataKey: "teorik",
                        label: "Teorik %",
                        curve: "linear",
                        showMark: true,
                      },
                    ]}
                    slotProps={{
                      legend: {
                        position: { vertical: "top", horizontal: "center" },
                      },
                    }}
                    sx={{
                      "& .MuiChartsAxis-label": {
                        fill: theme.palette.text.secondary,
                      },
                      "& .MuiChartsAxis-tickLabel": {
                        fill: theme.palette.text.secondary,
                      },
                      "& .MuiChartsGrid-line": {
                        stroke: theme.palette.divider,
                      },
                    }}
                    xAxis={[
                      {
                        dataKey: "basamak",
                        label: "İlk Basamak",
                        scaleType: "point",
                      },
                    ]}
                    yAxis={[
                      {
                        label: "Yüzde (%)",
                        min: 0,
                        max: yAxisMax,
                        valueFormatter: (value: number) => `${value}`,
                      },
                    ]}
                  />
                </Box>
              </Box>
            </Box>
          </>
        ) : null}
      </Grid>
    </Grid>
  );
};

export default BenfordChart;
