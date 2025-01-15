"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Kys",
    title: "KYS",
  },
  {
    to: "/Kys/1",
    title: "KYS-1",
  },
  {
    to: "/Kys/1/RiskDegerlendirmeSureci",
    title: "Risk Değerlendirme Süreci",
  },
];

export default function RiskDegerlendirmeSureciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Risk Değerlendirme Süreci" items={BCrumb} />
      {children}
    </div>
  );
}
