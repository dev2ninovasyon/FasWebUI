"use client";

import React, { useEffect, useState } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import MusteriIslemleriLayout from "../MusteriIslemleriLayout";
import { Box, Grid, TextField } from "@mui/material";
import { Autocomplete } from "@mui/material";
import MusteriEkleForm from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleForm";
import { getOldDenetlenenForCurrentDenetci } from "@/api/Musteri/MusteriIslemleri";
import { enqueueSnackbar } from "notistack";

const Page = () => {
  const [oldList, setOldList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getOldDenetlenenForCurrentDenetci();
        setOldList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("ImportFromOld fetch error:", err);
        enqueueSnackbar("Müşteriler yüklenemedi.", { variant: "error" });
      }
    };
    fetch();
  }, []);

  // Job polling
  useEffect(() => {
    if (!jobId) return;
    setPolling(true);
    let interval = setInterval(async () => {
      try {
        const status = await import("@/api/Musteri/MusteriIslemleri").then(m => m.getImportJobStatus(jobId));
        setJobStatus(status);
        const notifs = await import("@/api/Musteri/MusteriIslemleri").then(m => m.getImportJobNotifications(jobId));
        setNotifications(notifs);
        if (status.status === "Succeeded" || status.status === "Failed" || status.status === "Cancelled") {
          clearInterval(interval);
          setPolling(false);
        }
      } catch (e) {
        // ignore
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <MusteriIslemleriLayout>
      <PageContainer title="Müşterileri İçe Aktar" description="Eski veritabanından seçili şirketi yeni veritabanına taşı">
        <Grid container spacing={3}>
          <Grid size={12}>
            <ParentCard title="Müşteri Seç">
              <Grid container spacing={3}>
                <Grid size={12}>
                  <Autocomplete
                    options={oldList}
                    getOptionLabel={(opt: any) => opt.firmaAdi || opt.FirmaAdi || ""}
                    onChange={(e, val) => setSelected(val)}
                    renderInput={(params) => <TextField {...params} label="Müşteri Seçiniz" variant="outlined" />}
                  />
                </Grid>
                <Grid size={12}>
                  <Box>
                    <MusteriEkleForm key={selected?.id || selected?.Id || "empty"} initialData={selected} />
                  </Box>
                </Grid>
                <Grid size={12}>
                  <Box mt={2}>
                    <button
                      disabled={!selected || polling}
                      onClick={async () => {
                        try {
                          const { queued, alreadyQueued, jobId: newJobId, status } = await import("@/api/Musteri/MusteriIslemleri").then(m => m.startImportFromOldJob({
                            OldCompanyId: selected.id || selected.Id,
                            NewCompanyId: 0, // Gerekirse seçtir
                            Years: [], // Gerekirse seçtir
                            TableKeys: [] // Gerekirse seçtir
                            // TableKey: "MusteriImport" // Artık API fonksiyonu ekliyor
                          }));
                          setJobId(newJobId);
                          setJobStatus({ status });
                          enqueueSnackbar(alreadyQueued ? "Zaten kuyruğa alınmış veya çalışıyor." : "Kuyruğa alındı", { variant: "info" });
                        } catch (e: any) {
                          if (e && e.errors && e.errors.TableKey) {
                            enqueueSnackbar("TableKey gerekli: 'MusteriImport'", { variant: "error" });
                          } else if (e && e.errors) {
                            Object.entries(e.errors).forEach(([field, messages]: [string, any]) => {
                              (messages as string[]).forEach((msg) => {
                                enqueueSnackbar(`${field}: ${msg}`, { variant: "error" });
                              });
                            });
                          } else if (e && e.message) {
                            enqueueSnackbar(e.message, { variant: "error" });
                          } else {
                            enqueueSnackbar("Kuyruğa alınamadı", { variant: "error" });
                          }
                        }
                      }}
                    >
                      {polling ? "İşlem Devam Ediyor..." : "Müşteri Import Et (Kuyruğa Al)"}
                    </button>
                  </Box>
                </Grid>
                {jobId && (
                  <Grid size={12}>
                    <Box mt={2}>
                      <strong>Durum:</strong> {jobStatus?.status}
                      <ul>
                        {notifications.map((n, i) => (
                          <li key={i}>{n.createdAt}: {n.status} - {n.message}</li>
                        ))}
                      </ul>
                      {jobStatus?.errorMessage && <div style={{ color: "red" }}>{jobStatus.errorMessage}</div>}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </ParentCard>
          </Grid>
        </Grid>
      </PageContainer>
    </MusteriIslemleriLayout>
  );
};

export default Page;
