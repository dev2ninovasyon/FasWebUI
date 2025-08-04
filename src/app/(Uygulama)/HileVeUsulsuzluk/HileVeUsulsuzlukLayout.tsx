"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/HileVeUsulsuzluk",
    title: "Hile Ve Usulsüzlük",
  },
];

export default function HileVeUsulsuzlukLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Hile Ve Usulsüzlük" items={BCrumb} />
      {children}
    </div>
  );
}
