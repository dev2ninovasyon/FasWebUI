"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
];

export default function KonsolidasyonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Enflasyon" items={BCrumb} />
      {children}
    </div>
  );
}
