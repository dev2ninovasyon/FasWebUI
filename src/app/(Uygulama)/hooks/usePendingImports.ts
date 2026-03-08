import { useEffect, useState } from "react";
import { apiFetch } from "@/api/apiBase";

export interface PendingImportJob {
  jobId: string;
  status: string;
  pendingTableKey: string;
  tableDisplayName: string; // Türkçe isim
  errorMessage: string;
  pausedAt: string;
  tasinanDenetlenenId?: number;
  totalTables: number;
  completedTables: number;
  // Pending table stage details
  pendingTableTotalRecords: number;
  pendingTableProcessedRecords: number;
  pendingTableStatus: string;
}

export const usePendingImports = () => {
  const [pendingJobs, setPendingJobs] = useState<PendingImportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizePendingJob = (raw: any): PendingImportJob => ({
    jobId: raw?.jobId ?? raw?.JobId ?? "",
    status: raw?.status ?? raw?.Status ?? "",
    pendingTableKey: raw?.pendingTableKey ?? raw?.PendingTableKey ?? "",
    tableDisplayName: raw?.tableDisplayName ?? raw?.TableDisplayName ?? "",
    errorMessage: raw?.errorMessage ?? raw?.ErrorMessage ?? "",
    pausedAt: raw?.pausedAt ?? raw?.PausedAt ?? "",
    tasinanDenetlenenId: raw?.tasinanDenetlenenId ?? raw?.TasinanDenetlenenId,
    totalTables: Number(raw?.totalTables ?? raw?.TotalTables ?? 0),
    completedTables: Number(raw?.completedTables ?? raw?.CompletedTables ?? 0),
    pendingTableTotalRecords: Number(raw?.pendingTableTotalRecords ?? raw?.PendingTableTotalRecords ?? 0),
    pendingTableProcessedRecords: Number(raw?.pendingTableProcessedRecords ?? raw?.PendingTableProcessedRecords ?? 0),
    pendingTableStatus: raw?.pendingTableStatus ?? raw?.PendingTableStatus ?? "",
  });

  const checkPendingJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/DataTransfer/ImportJob/pending");

      if (response && response.jobs) {
        setPendingJobs(
          Array.isArray(response.jobs) ? response.jobs.map(normalizePendingJob) : []
        );
      } else {
        setPendingJobs([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Hata oluştu";
      setError(errorMessage);
      setPendingJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklenmesinde kontrol et
  useEffect(() => {
    checkPendingJobs();
  }, []);

  return {
    pendingJobs,
    loading,
    error,
    hasPendingJobs: pendingJobs.length > 0,
    firstPendingJob: pendingJobs.length > 0 ? pendingJobs[0] : null,
    refetch: checkPendingJobs,
  };
};


