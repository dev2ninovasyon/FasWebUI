"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/TemaAyarlari",
    title: "Tema Ayarları",
  },
];

export default function TemaAyarlariLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Tema Ayarları" items={BCrumb} />
      {children}
    </div>
  );
}
