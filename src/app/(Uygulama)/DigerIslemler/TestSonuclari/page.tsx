"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import DigerIslemlerLayout from "../DigerIslemlerLayout";
import TestSonuclariPage from "./TestSonuclariPage";

const BCrumb = [
  {
    to: "/DigerIslemler",
    title: "Diger Islemler",
  },
  {
    to: "/DigerIslemler/TestSonuclari",
    title: "Test Sonuclari",
  },
];

export default function Page() {
  return (
    <DigerIslemlerLayout>
      <PageContainer
        title="Test Sonuclari"
        description="Testlerin son calisma durumunu gosteren ozet ekran"
      >
        <Breadcrumb title="Test Sonuclari" items={BCrumb} />
        <TestSonuclariPage />
      </PageContainer>
    </DigerIslemlerLayout>
  );
}
