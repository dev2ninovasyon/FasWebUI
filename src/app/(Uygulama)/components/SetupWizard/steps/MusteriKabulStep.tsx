"use client";

import { Box, Button, Grid, Typography, Paper, FormControl, RadioGroup, FormControlLabel, Radio, Rating, Divider } from "@mui/material";
import { useState } from "react";
import CustomFormLabel from "../../Forms/ThemeElements/CustomFormLabel";
import CustomTextField from "../../Forms/ThemeElements/CustomTextField";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

interface MusteriKabulStepProps {
    data?: any;
    sirket?: any;
    onDataChange: (data: any) => void;
    onComplete: () => void;
    onBack: () => void;
}

export default function MusteriKabulStep({
    data,
    sirket,
    onDataChange,
    onComplete,
    onBack,
}: MusteriKabulStepProps) {
    const [riskDegerlendirmesi, setRiskDegerlendirmesi] = useState(data?.riskDegerlendirmesi || 3);
    const [bagimsizlikDurumu, setBagimsizlikDurumu] = useState(data?.bagimsizlikDurumu || "evet");
    const [kabulKarari, setKabulKarari] = useState(data?.kabulKarari || "kabul");
    const [notlar, setNotlar] = useState(data?.notlar || "");

    const handleComplete = () => {
        if (!kabulKarari) {
            alert("Lütfen kabul kararı verin");
            return;
        }

        onDataChange({
            riskDegerlendirmesi,
            bagimsizlikDurumu,
            kabulKarari,
            notlar,
        });
        onComplete();
    };

    return (
        <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2, md: 4 }, border: 1, borderColor: "divider" }}>
            <Typography variant="h5" gutterBottom>
                Müşteri Kabul Değerlendirmesi
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 4 }}>
                {sirket?.sirketAdi || "Şirket"} için müşteri kabul sürecini tamamlayın.
            </Typography>

            <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                <Grid item xs={12}>
                    <CustomFormLabel>
                        Risk Değerlendirmesi *
                    </CustomFormLabel>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Rating
                            name="risk-rating"
                            value={riskDegerlendirmesi}
                            onChange={(event, newValue) => {
                                setRiskDegerlendirmesi(newValue || 3);
                            }}
                            max={5}
                            size="large"
                        />
                        <Typography variant="body2" color="textSecondary">
                            {riskDegerlendirmesi === 1 && "Çok Düşük Risk"}
                            {riskDegerlendirmesi === 2 && "Düşük Risk"}
                            {riskDegerlendirmesi === 3 && "Orta Risk"}
                            {riskDegerlendirmesi === 4 && "Yüksek Risk"}
                            {riskDegerlendirmesi === 5 && "Çok Yüksek Risk"}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Divider />
                </Grid>

                <Grid item xs={12}>
                    <CustomFormLabel>
                        Bağımsızlık Durumu *
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <RadioGroup
                            value={bagimsizlikDurumu}
                            onChange={(e) => setBagimsizlikDurumu(e.target.value)}
                        >
                            <FormControlLabel
                                value="evet"
                                control={<Radio />}
                                label="Bağımsızlık koşulları sağlanıyor"
                            />
                            <FormControlLabel
                                value="hayir"
                                control={<Radio />}
                                label="Bağımsızlık koşulları sağlanamıyor"
                            />
                            <FormControlLabel
                                value="inceleme"
                                control={<Radio />}
                                label="Ek inceleme gerekiyor"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <Divider />
                </Grid>

                <Grid item xs={12}>
                    <CustomFormLabel>
                        Müşteri Kabul Kararı *
                    </CustomFormLabel>
                    <FormControl fullWidth>
                        <RadioGroup
                            value={kabulKarari}
                            onChange={(e) => setKabulKarari(e.target.value)}
                        >
                            <FormControlLabel
                                value="kabul"
                                control={<Radio />}
                                label="Kabul Et - Denetim sözleşmesi onaylandı"
                            />
                            <FormControlLabel
                                value="sartliKabul"
                                control={<Radio />}
                                label="Şartlı Kabul - Ek koşullar ile kabul"
                            />
                            <FormControlLabel
                                value="red"
                                control={<Radio />}
                                label="Reddet - Müşteri kabul edilemez"
                            />
                        </RadioGroup>
                    </FormControl>
                </Grid>

                <Grid item xs={12}>
                    <CustomFormLabel htmlFor="notlar">
                        Değerlendirme Notları
                    </CustomFormLabel>
                    <CustomTextField
                        id="notlar"
                        fullWidth
                        multiline
                        rows={4}
                        value={notlar}
                        onChange={(e: any) => setNotlar(e.target.value)}
                        placeholder="Müşteri kabul süreci ile ilgili notlar, koşullar veya ek bilgiler..."
                    />
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ p: 2, bgcolor: "success.light", borderRadius: 1, mt: 2 }}>
                        <Typography variant="body2" color="success.dark">
                            <strong>Son Adım!</strong> Tüm kurulum adımlarını tamamladınız.
                            "Tamamla" butonuna tıklayarak kurulumu bitirin ve programa başlayın.
                        </Typography>
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
                    color="success"
                    onClick={handleComplete}
                    endIcon={<IconCheck />}
                    size="large"
                    sx={{ width: { xs: '100%', sm: 'auto' }, order: { xs: 1, sm: 2 } }}
                >
                    Tamamla ve Başla
                </Button>
            </Box>
        </Paper>
    );
}
