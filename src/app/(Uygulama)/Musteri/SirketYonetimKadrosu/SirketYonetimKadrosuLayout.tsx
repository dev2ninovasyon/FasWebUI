"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/SirketYonetimKadrosu",
    title: "Şirket Yönetim Kadrosu",
  },
];

export default function SirketYonetimKadrosuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Şirket Yönetim Kadrosu" items={BCrumb} />
      {children}
    </div>
  );
}
