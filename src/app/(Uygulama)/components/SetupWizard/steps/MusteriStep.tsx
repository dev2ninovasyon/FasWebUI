import { Box, Typography } from "@mui/material";
import React from "react";
import MusteriEkleForm from "@/app/(Uygulama)/components/Musteri/MusteriIslemleri/MusteriEkleForm";

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

    const handleCustomerCreated = (customerId: number, customerData: any) => {
        // Update wizard data with the new customer info including ID
        onDataChange(customerData);
        // Move to next step
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
            <MusteriEkleForm
                initialData={data}
                onCustomerCreated={handleCustomerCreated}
                skipNavigation={true}
                showNavigationButtons={true}
                onBack={onBack}
                isWizardView={true}
            />
        </Box>
    );
};
