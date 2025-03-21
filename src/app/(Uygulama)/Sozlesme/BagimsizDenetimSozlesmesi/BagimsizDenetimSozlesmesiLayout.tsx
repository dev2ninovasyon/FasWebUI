"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Sozlesme",
    title: "Sözleşme",
  },
  {
    to: "/Musteri/BagimsizDenetimSozlesmesi",
    title: "Bağımsız Denetim Sözleşmesi",
  },
];

export default function BagimsizDenetimSozlesmesiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Bağımsız Denetim Sözleşmesi" items={BCrumb} />
      {children}
    </div>
  );
}
