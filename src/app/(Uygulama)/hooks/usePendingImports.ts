import { useEffect, useState } from "react";
import { apiFetch } from "@/api/apiBase";

export interface PendingImportJob {
  jobId: string;
  status: string;
  pendingTableKey: string;
  tableDisplayName: string; // TÃ¼rkÃ§e isim
  errorMessage: string;
  pausedAt: string;
  oldCompanyId: number;
  newCompanyId: number;
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

  const checkPendingJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch("/DataTransfer/ImportJob/pending");

      if (response && response.jobs) {
        setPendingJobs(response.jobs);
      } else {
        setPendingJobs([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Hata oluÅŸtu";
      setError(errorMessage);
      setPendingJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yÃ¼klenmesinde kontrol et
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


