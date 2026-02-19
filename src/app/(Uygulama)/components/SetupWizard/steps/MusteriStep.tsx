import { Box, Typography, Button, Stack, Grid, TextField } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Autocomplete } from "@mui/material";
import MusteriEkleForm from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleForm";
import { getOldDenetlenenForCurrentDenetci } from "@/api/Musteri/MusteriIslemleri";
import { IconPlus, IconDatabase } from "@tabler/icons-react";

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
    const [mode, setMode] = useState<"new" | "import">("new");
    const [oldList, setOldList] = useState<any[]>([]);
    const [selected, setSelected] = useState<any | null>(null);

    useEffect(() => {
        if (mode === "import") {
            const fetchOld = async () => {
                try {
                    const data = await getOldDenetlenenForCurrentDenetci();
                    setOldList(Array.isArray(data) ? data : []);
                } catch (err) {
                    console.error("MusteriStep: Müşteriler yüklenemedi:", err);
                }
            };
            fetchOld();
        }
    }, [mode]);

    const handleCustomerCreated = (customerId: number, customerData: any) => {
        onDataChange(customerData);
        setTimeout(() => {
            onNext();
        }, 500);
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Müşteri Ekleme
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                Denetimini yapacağınız firmayı sisteme ekleyin. Firmanın temel bilgilerini bu adımda tanımlayacaksınız.
            </Typography>
            <Typography variant="caption" color="primary.main" sx={{ display: "block", mb: 3, fontStyle: "italic" }}>
                * Firma bilgilerini daha sonra 'Müşteri İşlemleri' menüsünden dilediğiniz zaman güncelleyebilirsiniz.
            </Typography>

            <Stack spacing={1} direction="row" justifyContent="start" marginBottom={3}>
                <Button
                    variant={mode === "new" ? "contained" : "outlined"}
                    color="primary"
                    onClick={() => { setMode("new"); setSelected(null); }}
                    startIcon={<IconPlus width={18} />}
                >
                    Yeni Müşteri Ekle
                </Button>
                <Button
                    variant={mode === "import" ? "contained" : "outlined"}
                    color="secondary"
                    onClick={() => setMode("import")}
                    startIcon={<IconDatabase width={18} />}
                >
                    Müşterileri Taşı
                </Button>
            </Stack>

            {mode === "import" && (
                <Box sx={{ mb: 3 }}>
                    <Autocomplete
                        options={oldList}
                        getOptionLabel={(opt: any) => opt.firmaAdi || opt.FirmaAdi || ""}
                        onChange={(e, val) => setSelected(val)}
                        renderInput={(params) => <TextField {...params} label="Müşteri Seçiniz" variant="outlined" size="small" />}
                    />
                </Box>
            )}

            <MusteriEkleForm
                key={mode === "import" ? (selected?.id || selected?.Id || "import-empty") : "new"}
                initialData={mode === "import" ? selected : data}
                onCustomerCreated={handleCustomerCreated}
                skipNavigation={true}
                showNavigationButtons={true}
                onBack={onBack}
                isWizardView={true}
            />
        </Box>
    );
};
