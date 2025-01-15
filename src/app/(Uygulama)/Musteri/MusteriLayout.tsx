"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
];

export default function MusteriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Müşteri" items={BCrumb} />
      {children}
    </div>
  );
}
