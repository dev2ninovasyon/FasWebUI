"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    Box,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Paper,
    IconButton,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { IconX } from "@tabler/icons-react";
import WelcomeStep from "./steps/WelcomeStep";
import KullaniciStep from "./steps/KullaniciStep";
import MusteriStep from "./steps/MusteriStep";
import DenetimKadrosuStep from "./steps/DenetimKadrosuStep";
import DenetimSozlesmesiStep from "./steps/DenetimSozlesmesiStep";
import MusteriKabulStep from "./steps/MusteriKabulStep";
import { getDenetciById, updateDenetci } from "@/api/Denetci/Denetci";
import { getKullaniciAyarlar, updateKurulumAyarlari } from "@/api/Kullanici/KullaniciAyarlar";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

interface SetupWizardModalProps {
    open: boolean;
    onClose: () => void;
    onComplete: (data: WizardData) => void;
}

export interface WizardData {
    kullanici?: any[];
    musteri?: any;
    denetimKadrosu?: any;
    denetimSozlesmesi?: any;
    musteriKabul?: any;
}

const steps = [
    "Hoş Geldiniz",
    "Kullanıcı Ekleme",
    "Müşteri Ekleme",
    "Müşteri Kabul",
    "Denetim Kadrosu",
    "Denetim Sözleşmesi",
];

export default function SetupWizardModal({
    open,
    onClose,
    onComplete,
}: SetupWizardModalProps) {
    const [activeStep, setActiveStep] = useState(0);
    const [wizardData, setWizardData] = useState<WizardData>({});
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);
    const [isLoadingProgress, setIsLoadingProgress] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const user = useSelector((state: AppState) => state.userReducer);

    // Load wizard progress when modal opens
    useEffect(() => {
        if (open && user.token && user.id) {
            loadWizardProgress();
        }
    }, [open, user.token, user.id]);

    const loadWizardProgress = async () => {
        try {
            setIsLoadingProgress(true);
            const ayarlar = await getKullaniciAyarlar(user.token!, user.id!);

            if (ayarlar) {
                setActiveStep(ayarlar.kurulumAdimi || 0);

                if (ayarlar.setupWizardProgress) {
                    const progress = typeof ayarlar.setupWizardProgress === 'string'
                        ? JSON.parse(ayarlar.setupWizardProgress)
                        : ayarlar.setupWizardProgress;

                    setCompletedSteps(progress.completedSteps || []);
                    setWizardData(progress.data || {});
                }
            }
        } catch (error) {
            console.log("Progress yüklenirken hata:", error);
        } finally {
            setIsLoadingProgress(false);
        }
    };

    const saveWizardProgress = async (step: number, data: WizardData, completed: number[], isComplete: boolean = false) => {
        if (!user.token || !user.id) return;

        try {
            const progress = {
                completedSteps: completed,
                data: data
            };



            await updateKurulumAyarlari(
                user.token,
                user.id,
                isComplete,
                step,
                JSON.stringify(progress)
            );


        } catch (error) {
            console.log("Progress kaydedilirken hata:", error);
        }
    };

    const handleNext = async () => {
        // Mark current step as completed
        const newCompletedSteps = Array.from(new Set([...completedSteps, activeStep]));
        setCompletedSteps(newCompletedSteps);

        if (activeStep === steps.length - 1) {
            // Completion - mark as complete
            await saveWizardProgress(activeStep, wizardData, newCompletedSteps, true);
            onComplete(wizardData);
        } else {
            const nextStep = activeStep + 1;
            setActiveStep(nextStep);
            await saveWizardProgress(nextStep, wizardData, newCompletedSteps);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleStepClick = (stepIndex: number) => {
        // Only allow clicking on completed steps or current step
        if (completedSteps.includes(stepIndex) || stepIndex <= activeStep) {
            setActiveStep(stepIndex);
        }
    };

    const updateWizardData = (stepKey: keyof WizardData, data: any) => {
        setWizardData((prev) => ({
            ...prev,
            [stepKey]: data,
        }));
    };

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <WelcomeStep onNext={handleNext} />;
            case 1:
                return (
                    <KullaniciStep
                        data={wizardData.kullanici}
                        onDataChange={(data) => updateWizardData("kullanici", data)}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 2:
                return (
                    <MusteriStep
                        data={wizardData.musteri}
                        onDataChange={(data) => updateWizardData("musteri", data)}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            case 3:
                return (
                    <MusteriKabulStep
                        data={wizardData.musteriKabul}
                        sirket={wizardData.musteri}
                        onDataChange={(data) => updateWizardData("musteriKabul", data)}
                        onComplete={handleNext}
                        onBack={handleBack}
                    />
                );
            case 4:
                return (
                    <DenetimKadrosuStep
                        data={wizardData.denetimKadrosu}
                        sirket={wizardData.musteri}
                        onDataChange={(data) => updateWizardData("denetimKadrosu", data)}
                        onComplete={handleNext}
                        onBack={handleBack}
                    />
                );
            case 5:
                return (
                    <DenetimSozlesmesiStep
                        data={wizardData.denetimSozlesmesi}
                        sirket={wizardData.musteri}
                        onDataChange={(data) => updateWizardData("denetimSozlesmesi", data)}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog
            open={open}
            fullScreen
            disableEscapeKeyDown
            onClose={(event, reason) => {
                if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                    onClose();
                }
            }}
            PaperProps={{
                sx: {
                    bgcolor: "background.default",
                },
            }}
        >
            <Box
                sx={{
                    height: "100vh",
                    width: "100%",
                    display: "flex",
                    alignItems: { xs: "flex-start", sm: "center" },
                    justifyContent: "center",
                    p: { xs: 0, sm: 2, md: 3 },
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: { xs: "100%", sm: "1000px", md: "1200px", lg: "1400px" },
                        bgcolor: "background.paper",
                        borderRadius: { xs: 0, sm: 2 },
                        boxShadow: 0,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        height: { xs: "100vh", sm: "95vh", md: "90vh" },
                    }}
                >
                    {/* Header with Stepper */}
                    <Box
                        sx={{
                            p: { xs: 1.5, sm: 2, md: 3 },
                            flexShrink: 0,
                        }}
                    >
                        {activeStep === 0 ? (
                            <>

                            </>
                        ) : (
                            <>

                                <Stepper
                                    activeStep={activeStep - 1}
                                    sx={{ mt: { xs: 1, sm: 2 } }}
                                    orientation={isMobile ? "vertical" : "horizontal"}
                                >
                                    {steps.slice(1).map((label, index) => {
                                        const stepNumber = index + 1;
                                        const isCompleted = completedSteps.includes(stepNumber);
                                        const isClickable = isCompleted || stepNumber <= activeStep;

                                        return (
                                            <Step key={label} completed={isCompleted}>
                                                <StepLabel
                                                    onClick={() => isClickable && handleStepClick(stepNumber)}
                                                    sx={{
                                                        '& .MuiStepLabel-label': {
                                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                                            cursor: isClickable ? 'pointer' : 'not-allowed',
                                                            opacity: isClickable ? 1 : 0.5
                                                        }
                                                    }}
                                                >
                                                    {label}
                                                </StepLabel>
                                            </Step>
                                        );
                                    })}
                                </Stepper>
                            </>
                        )}
                    </Box>

                    {/* Content Area */}
                    <Box
                        sx={{
                            flex: 1,
                            p: { xs: 1, sm: 1.5, md: 2 },
                            display: "flex",
                            flexDirection: "column",
                            minHeight: 0,
                            overflow: "auto",
                        }}
                    >
                        {getStepContent(activeStep)}
                    </Box>
                </Box>
            </Box>
        </Dialog>
    );
}
