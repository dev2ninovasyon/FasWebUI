"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Kys",
    title: "KYS",
  },
];

export default function KysLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Breadcrumb title="Kalite Yönetim Sistemi" items={BCrumb} />
      {children}
    </div>
  );
}
