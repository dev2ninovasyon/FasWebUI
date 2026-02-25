import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Autocomplete } from "@mui/material";
import MusteriEkleForm from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleForm";
import ImportProgressDialog from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/ImportProgressDialog";
import { PendingImportDialog } from "@/app/(Uygulama)/components/Admin/PendingImportDialog";
import {
  checkDenetciExistsInOldDb,
  getOldDenetlenenForCurrentDenetci,
  getTransferredDenetlenenIdsByDenetciId,
} from "@/api/Musteri/MusteriIslemleri";
import { IconDatabase, IconPlus } from "@tabler/icons-react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { usePendingImports } from "@/app/(Uygulama)/hooks/usePendingImports";

interface MusteriStepProps {
  data?: any;
  onDataChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function MusteriStep({
  data,
  onDataChange,
  onNext,
  onBack,
}: MusteriStepProps) {
  const user = useSelector((state: AppState) => state.userReducer);
  const [mode, setMode] = useState<"new" | "import">("new");
  const [oldList, setOldList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [canImport, setCanImport] = useState<boolean>(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [pendingDialogOpen, setPendingDialogOpen] = useState(false);

  const { firstPendingJob, hasPendingJobs, refetch: refetchPendingImports } = usePendingImports();

  const fetchOld = async () => {
    try {
      const denetciId = user?.denetciId || 0;
      const [data, transferredIds] = await Promise.all([
        getOldDenetlenenForCurrentDenetci(),
        denetciId > 0
          ? getTransferredDenetlenenIdsByDenetciId(denetciId)
          : Promise.resolve([]),
      ]);

      const transferredSet = new Set((transferredIds || []).map((x) => Number(x)));
      const filtered = (Array.isArray(data) ? data : []).filter((item: any) => {
        const id = Number(item?.id ?? item?.Id ?? 0);
        return !transferredSet.has(id);
      });
      setOldList(filtered);
    } catch (err) {
      console.error("MusteriStep: Musteriler yuklenemedi:", err);
    }
  };

  useEffect(() => {
    const checkImportEligibility = async () => {
      const exists = await checkDenetciExistsInOldDb();
      setCanImport(exists);
    };
    checkImportEligibility();
  }, []);

  useEffect(() => {
    if (mode === "import") {
      fetchOld();
    }
  }, [mode, user?.denetciId]);

  useEffect(() => {
    if (mode === "import" && hasPendingJobs && firstPendingJob) {
      setPendingDialogOpen(true);
    }
  }, [mode, hasPendingJobs, firstPendingJob]);

  const handleCustomerCreated = (_customerId: number, customerData: any) => {
    onDataChange(customerData);
    setTimeout(() => {
      onNext();
    }, 500);
  };

  const handleImportCompleted = async () => {
    await fetchOld();
    setSelected(null);
    await refetchPendingImports();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Musteri Ekleme
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        Denetimini yapacaginiz firmayi sisteme ekleyin. Firmanin temel bilgilerini bu adimda tanimlayacaksiniz.
      </Typography>
      <Typography variant="caption" color="primary.main" sx={{ display: "block", mb: 3, fontStyle: "italic" }}>
        * Firma bilgilerini daha sonra Musteri Islemleri menusunden dilediginiz zaman guncelleyebilirsiniz.
      </Typography>

      <Stack spacing={1} direction="row" justifyContent="start" marginBottom={3}>
        <Button
          variant={mode === "new" ? "contained" : "outlined"}
          color="primary"
          onClick={() => {
            setMode("new");
            setSelected(null);
          }}
          startIcon={<IconPlus width={18} />}
        >
          Yeni Musteri Ekle
        </Button>
        {canImport && (
          <Button
            variant={mode === "import" ? "contained" : "outlined"}
            color="secondary"
            onClick={() => setMode("import")}
            startIcon={<IconDatabase width={18} />}
          >
            Musteri Tasi
          </Button>
        )}
      </Stack>

      {mode === "import" && (
        <Box sx={{ mb: 3 }}>
          {hasPendingJobs && (
            <Alert severity="warning" sx={{ mb: 1.5 }}>
              Yarim kalan bir tasima islemi var. Devam etmek veya iptal etmek icin acilan uyariyi kullanabilirsiniz.
            </Alert>
          )}
          <Autocomplete
            options={oldList}
            getOptionLabel={(opt: any) => opt.firmaAdi || opt.FirmaAdi || ""}
            onChange={(_e, val) => setSelected(val)}
            renderInput={(params) => (
              <TextField {...params} label="Musteri Seciniz" variant="outlined" size="small" />
            )}
          />
        </Box>
      )}

      <MusteriEkleForm
        key={mode === "import" ? (selected?.id || selected?.Id || "import-empty") : "new"}
        initialData={mode === "import" ? selected : data}
        onCustomerCreated={handleCustomerCreated}
        skipNavigation={true}
        showNavigationButtons={mode !== "import"}
        onBack={onBack}
        isWizardView={true}
        isImportMode={mode === "import" && Boolean(selected?.id || selected?.Id)}
        onImportJobStarted={(startedJobId) => {
          setJobId(startedJobId);
          setProgressOpen(true);
        }}
      />

      <PendingImportDialog
        open={pendingDialogOpen}
        job={firstPendingJob}
        onClose={() => setPendingDialogOpen(false)}
        onActionComplete={async (action) => {
          await refetchPendingImports();
          if (action === "continue" && firstPendingJob?.jobId) {
            setJobId(firstPendingJob.jobId);
            setProgressOpen(true);
          }
          if (action === "cancel") {
            await fetchOld();
          }
        }}
      />

      <ImportProgressDialog
        open={progressOpen}
        jobId={jobId}
        onClose={() => setProgressOpen(false)}
        onCompleted={handleImportCompleted}
      />
    </Box>
  );
}
