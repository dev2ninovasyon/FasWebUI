"use client";

import React, { useEffect, useState, useRef } from "react";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import ParentCard from "@/app/(Uygulama)/components/Layout/Shared/ParentCard/ParentCard";
import MusteriIslemleriLayout from "../MusteriIslemleriLayout";
import {
  Box,
  Stack,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
} from "@mui/material";
import MusteriEkleForm from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleForm";
import {
  getOldDenetlenenForCurrentDenetci,
  getOldDenetlenenDetay,
  mapOldDenetlenenToFormData,
} from "@/api/Musteri/MusteriIslemleri";
import type {
  OldDenetlenenListItemDto,
  OldDenetlenenDetayDto,
} from "@/api/Musteri/MusteriIslemleriDtos";
import { enqueueSnackbar } from "notistack";

const BCrumb = [
  { to: "/Musteri", title: "Müşteri" },
  { to: "/Musteri/MusteriIslemleri", title: "Müşteri İşlemleri" },
  { to: "/Musteri/MusteriIslemleri/ImportFromOld", title: "Müşteri Taşı" },
];

const Page = () => {
  const [oldList, setOldList] = useState<OldDenetlenenListItemDto[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [selected, setSelected] = useState<OldDenetlenenListItemDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any> | null>(null);

  // AbortController for race condition prevention
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load company list on mount
  useEffect(() => {
    const loadList = async () => {
      try {
        setListLoading(true);
        setListError(null);
        const data = await getOldDenetlenenForCurrentDenetci();
        setOldList(Array.isArray(data) ? data : []);
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
        setListError(errorMsg);
        enqueueSnackbar("Müşteriler yüklenemedi: " + errorMsg, {
          variant: "error",
        });
      } finally {
        setListLoading(false);
      }
    };

    loadList();
  }, []);

  // Load selected company details when selection changes
  useEffect(() => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!selected) {
      setFormData(null);
      setDetailError(null);
      return;
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    const loadDetail = async () => {
      try {
        setDetailLoading(true);
        setDetailError(null);

        const detailData = await getOldDenetlenenDetay(selected.id);

        // Check if request was aborted before state update
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const mapped = mapOldDenetlenenToFormData(detailData);
        setFormData(mapped);
      } catch (error) {
        // Ignore abort errors
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        const errorMsg =
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
        setDetailError(errorMsg);
        enqueueSnackbar("Firma detayları yüklenemedi: " + errorMsg, {
          variant: "error",
        });
      } finally {
        setDetailLoading(false);
      }
    };

    loadDetail();

    // Cleanup: abort request on unmount or selection change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selected]);

  return (
    <MusteriIslemleriLayout title="Müşteri Taşı" items={BCrumb}>
      <PageContainer title="Müşteri Taşı" description="Eski veriler aktarılıyor">
        <Stack spacing={3}>
          {/* Company Selection Section */}
          <ParentCard title="Müşteri Seç">
            <Stack spacing={3}>
              {listLoading ? (
                <Box display="flex" justifyContent="center" py={3}>
                  <CircularProgress size={40} />
                </Box>
              ) : listError ? (
                <Alert severity="error">{listError}</Alert>
              ) : (
                <Box>
                  <Autocomplete
                    options={oldList}
                    getOptionLabel={(opt: OldDenetlenenListItemDto) =>
                      opt.firmaAdi || ""
                    }
                    value={selected}
                    onChange={(e, val) => setSelected(val)}
                    fullWidth
                    sx={{ minWidth: 350, maxWidth: 600 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Müşteri Seçiniz"
                        variant="outlined"
                        fullWidth
                      />
                    )}
                    noOptionsText="Müşteri bulunamadı"
                    isOptionEqualToValue={(opt, val) => opt.id === val.id}
                  />
                </Box>
              )}
            </Stack>
          </ParentCard>

          {/* Firm Detail Section */}
          {selected && (
            <ParentCard title="Firma Detayları">
              <Stack spacing={2}>
                {detailLoading ? (
                  <Box display="flex" justifyContent="center" py={5}>
                    <CircularProgress size={40} />
                  </Box>
                ) : detailError ? (
                  <Alert severity="error">{detailError}</Alert>
                ) : formData ? (
                  <MusteriEkleForm
                    key={`import-${selected.id}`}
                    initialData={formData}
                    showPdfUpload={false}
                    isImportMode={true}
                  />
                ) : (
                  <Alert severity="warning">Firma verileri bulunamadı</Alert>
                )}
              </Stack>
            </ParentCard>
          )}
        </Stack>
      </PageContainer>
    </MusteriIslemleriLayout>
  );
};

export default Page;
