"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/IliskiliTaraflar",
    title: "İlişkili Taraflar",
  },
];

export default function IliskiliTaraflarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="İlişkili Taraflar" items={BCrumb} />
      {children}
    </div>
  );
}
