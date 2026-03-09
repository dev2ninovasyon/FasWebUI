"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/IsletmeninSurekliligiVeAnalitikInceleme",
    title: "İşletmenin Sürekliliği ve Analitik İnceleme",
  },
];

export default function IsletmeninSurekliligiVeAnalitikIncelemeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb
        title="İşletmenin Sürekliliği ve Analitik İnceleme"
        items={BCrumb}
      />
      {children}
    </div>
  );
}
