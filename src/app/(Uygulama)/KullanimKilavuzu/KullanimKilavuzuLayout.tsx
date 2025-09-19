"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/KullanimKilavuzu",
    title: "Kullanım Kılavuzu",
  },
];

export default function KullanimKilavuzuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Kullanım Kılavuzu" items={BCrumb} />
      {children}
    </div>
  );
}
