// src/app/(Uygulama)/Veri/FaturaInceleme/page.tsx
"use client";
import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import FaturaInceleme from "@/app/(Uygulama)/components/Veri/Fatura/FaturaInceleme";

const BCrumb = [
  { to: "/DenetimKanitlari", title: "Denetim Kanıtları" },
  { to: "/DenetimKanitlari/FaturaInceleme", title: "Fatura İnceleme" },
];

export default function Page() {
  return (
    <PageContainer title="Fatura İnceleme" description="Fatura İnceleme">
      <Breadcrumb title="Fatura İnceleme" items={BCrumb} />
      <FaturaInceleme tip="Alınan" />
    </PageContainer>
  );
}
