"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/Hissedarlar",
    title: "Hissedarlar",
  },
];

export default function HissedarlarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Hissedarlar" items={BCrumb}>
        <EkBelgeYukleButton formKodu="Hissedarlar" />
      </Breadcrumb>
      {children}
    </div>
  );
}
