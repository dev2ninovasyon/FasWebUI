"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/DigerIslemler",
    title: "Diğer İşlemler",
  },
];
export default function DigerIslemlerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Diğer İşlemler" items={BCrumb} />
      {children}
    </div>
  );
}
