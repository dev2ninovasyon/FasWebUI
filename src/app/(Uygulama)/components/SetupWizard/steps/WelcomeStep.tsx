"use client";

import { Box, Typography, Button, List, ListItem, ListItemIcon, ListItemText, Grid, Divider } from "@mui/material";
import { IconUserPlus, IconBuilding, IconUsers, IconFileText, IconChecklist } from "@tabler/icons-react";
import Logo from "../../Layout/Shared/Logo/Logo";

interface WelcomeStepProps {
    onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
    const setupSteps = [
        {
            icon: <IconUserPlus size={24} />,
            title: "Kullanıcı Ekleme",
            description: "Sistem kullanıcılarını tanımlayın",
        },
        {
            icon: <IconBuilding size={24} />,
            title: "Müşteri Ekleme",
            description: "Denetlenecek müşterileri ekleyin",
        },
        {
            icon: <IconChecklist size={24} />,
            title: "Müşteri Kabul",
            description: "Müşteri kabul süreçlerini tamamlayın",
        },
        {
            icon: <IconUsers size={24} />,
            title: "Denetim Kadrosu Atama",
            description: "Denetim ekibinizi oluşturun",
        },
        {
            icon: <IconFileText size={24} />,
            title: "Denetim Sözleşmesi",
            description: "Denetim sözleşmelerini yapılandırın",
        },
    ];

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Grid container spacing={6} alignItems="center">
                {/* Sol Taraf - Hoş Geldiniz Mesajı */}
                <Grid item xs={12} md={5}>
                    <Box sx={{ p: 2, pb: 8 }}>
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                            <Logo />
                        </Box>
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: "primary.main", letterSpacing: "-0.5px", textAlign: "left" }}>
                            FAS Programına <br /> Hoş Geldiniz!
                        </Typography>
                        <Typography variant="h6" color="textSecondary" sx={{ mb: 3, lineHeight: 1.6, fontWeight: 400, textAlign: "left" }}>
                            Programa başlamadan önce yandaki kurulum adımlarını tamamlamanız gerekmektedir.
                        </Typography>
                        <Typography variant="body1" color="textSecondary" sx={{ opacity: 0.8, textAlign: "left", mb: 2 }}>
                            Bu adımlar, sistemi verimli bir şekilde kullanabilmeniz için gerekli temel yapılandırmaları içerir.
                        </Typography>
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500, textAlign: "left", fontStyle: "italic" }}>
                            * Not: Kurulum sırasında yaptığınız tüm işlemleri daha sonra ilgili menülerden dilediğiniz zaman değiştirebilirsiniz.
                        </Typography>
                        <Typography variant="body2" color="error.main" sx={{ fontWeight: 500, textAlign: "left", mt: 1 }}>
                            * Kurulum adımları tamamlanmadan programın diğer bölümlerine erişim sağlanamaz.
                        </Typography>
                    </Box>
                </Grid>

                {/* Orta - Ayırıcı Çizgi */}
                <Grid item xs={12} md={1} sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
                    <Divider orientation="vertical" flexItem sx={{ height: "100%", borderColor: "divider" }} />
                </Grid>

                {/* Sağ Taraf - Kurulum Adımları ve Buton */}
                <Grid item xs={12} md={6}>
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 3, color: "text.primary" }}>
                            Kurulum Adımları
                        </Typography>
                        <List sx={{ py: 0, mb: 2 }}>
                            {setupSteps.map((step, index) => (
                                <ListItem
                                    key={index}
                                    sx={{
                                        py: 1.5,
                                        px: 2,
                                        mb: 1.5,
                                        borderRadius: 2,
                                        bgcolor: "background.paper",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        transition: "all 0.2s",
                                        "&:hover": {
                                            borderColor: "primary.main",
                                            bgcolor: "primary.light",
                                            "& .MuiListItemIcon-root": {
                                                color: "primary.main"
                                            }
                                        }
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 48, color: "text.secondary", transition: "color 0.2s" }}>
                                        {step.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                                                {index + 1}. {step.title}
                                            </Typography>
                                        }
                                        secondary={step.description}
                                    />
                                </ListItem>
                            ))}
                        </List>

                        <Button
                            variant="contained"
                            size="large"
                            onClick={onNext}
                            fullWidth
                            sx={{
                                py: 2,
                                fontSize: "1.1rem",
                                fontWeight: 600,
                                borderRadius: 2,
                                textTransform: "none"
                            }}
                        >
                            Kuruluma Başla
                        </Button>
                        <Typography variant="caption" color="textSecondary" sx={{ display: "block", mt: 2, textAlign: "center" }}>
                            Kurulum yaklaşık 10-15 dakika sürecektir
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
