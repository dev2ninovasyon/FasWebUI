"use client";

import { Box, Button, Grid, Typography, Paper, FormControl, Select, MenuItem, Chip } from "@mui/material";
import { useState } from "react";
import CustomFormLabel from "../../Forms/ThemeElements/CustomFormLabel";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

interface DenetimKadrosuStepProps {
    data?: any;
    kullanicilar?: any;
    onDataChange: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function DenetimKadrosuStep({
    data,
    kullanicilar,
    onDataChange,
    onNext,
    onBack,
}: DenetimKadrosuStepProps) {
    const [sorumluDenetci, setSorumluDenetci] = useState(data?.sorumluDenetci || "");
    const [ekipUyeleri, setEkipUyeleri] = useState<string[]>(data?.ekipUyeleri || []);

    const handleNext = () => {
        if (!sorumluDenetci) {
            alert("Lütfen sorumlu denetçi seçin");
            return;
        }

        onDataChange({
            sorumluDenetci,
            ekipUyeleri,
        });
        onNext();
    };

    // Kullanıcı verisi varsa kullan, yoksa örnek veri
    const availableUsers = kullanicilar
        ? [{ email: kullanicilar.email, name: kullanicilar.personelAdi }]
        : [{ email: "ornek@fas.com", name: "Örnek Kullanıcı" }];

    return (
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2, md: 4 }, border: 1, borderColor: "divider" }}>
            <Typography variant="h5" gutterBottom>
                Denetim Kadrosu Ataması
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                Denetim ekibini oluşturun ve sorumlulukları atayın.
            </Typography>

            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid item xs={12}>
                    <CustomFormLabel htmlFor="sorumluDenetci">
                        Sorumlu Denetçi *
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <Select
                            id="sorumluDenetci"
                            value={sorumluDenetci}
                            onChange={(e) => setSorumluDenetci(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem value="" disabled>
                                Sorumlu denetçi seçin
                            </MenuItem>
                            {availableUsers.map((user, index) => (
                                <MenuItem key={index} value={user.email}>
                                    {user.name} ({user.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                        <strong>Not:</strong> Daha fazla ekip üyesi ve detaylı görev atamaları için kurulum tamamlandıktan sonra
                        Denetim Kadrosu sayfasını kullanabilirsiniz.
                    </Typography>
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: "background.default", borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Atanan Roller:
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            {sorumluDenetci && (
                                <Chip label={`Sorumlu Denetçi: ${sorumluDenetci}`} color="primary" />
                            )}
                            {!sorumluDenetci && (
                                <Typography variant="body2" color="textSecondary">
                                    Henüz kimse atanmadı
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Box sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: "space-between", mt: { xs: 2, sm: 3, md: 4 } }}>
                <Button
                    variant="outlined"
                    onClick={onBack}
                    startIcon={<IconArrowLeft />}
                    sx={{ width: { xs: '100%', sm: 'auto' }, order: { xs: 2, sm: 1 } }}
                >
                    Geri
                </Button>
                <Button
                    variant="contained"
                    onClick={handleNext}
                    endIcon={<IconArrowRight />}
                    sx={{ width: { xs: '100%', sm: 'auto' }, order: { xs: 1, sm: 2 } }}
                >
                    İleri
                </Button>
            </Box>
        </Paper>
    );
}
