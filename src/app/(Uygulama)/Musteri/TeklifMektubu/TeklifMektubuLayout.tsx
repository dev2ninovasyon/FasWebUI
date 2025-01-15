"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/TeklifMektubu",
    title: "Teklif Mektubu",
  },
];

export default function TeklifMektubuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Teklif Mektubu" items={BCrumb} />
      {children}
    </div>
  );
}
