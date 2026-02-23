import React, { useState, useEffect } from "react";
import { startImportFromOldPipelineJob, getImportPipelineJobStatus } from "@/api/Musteri/MusteriIslemleri";

export default function ImportFromOldJobButton({ denetciId, denetlenenId, yil }: { denetciId: number, denetlenenId: number, yil: number }) {
  const [jobId, setJobId] = useState<string|null>(null);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    try {
      const { jobId, alreadyQueued } = await startImportFromOldPipelineJob({
        TableKey: 'ImportFromOldPipeline',
        DenetciId: denetciId,
        DenetlenenId: denetlenenId,
        Yil: yil
      });
      setJobId(jobId);
      alert(alreadyQueued ? 'Zaten kuyruğa alınmış.' : 'Kuyruğa alındı');
    } catch (e: any) {
      alert(e.message || 'Kuyruğa alınamadı');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!jobId) return;
    const interval = setInterval(async () => {
      const status = await getImportPipelineJobStatus(jobId);
      setJobStatus(status);
      if (status.status === 'Succeeded' || status.status === 'Failed') clearInterval(interval);
    }, 2000);
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div>
      <button onClick={handleImport} disabled={loading}>{loading ? 'Kuyruğa alınıyor...' : 'Müşteri Taşı'}</button>
      {jobStatus && (
        <div style={{ marginTop: 16 }}>
          <b>Durum:</b> {jobStatus.status}<br/>
          {jobStatus.errorMessage && <span style={{ color: 'red' }}>{jobStatus.errorMessage}</span>}
        </div>
      )}
    </div>
  );
}
