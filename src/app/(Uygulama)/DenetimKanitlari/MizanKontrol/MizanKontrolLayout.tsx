"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/MizanKontrol",
    title: "Mizan Kontrol",
  },
];

export default function MizanKontrolLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Mizan Kontrol" items={BCrumb} />
      {children}
    </div>
  );
}
