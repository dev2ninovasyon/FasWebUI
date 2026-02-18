"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/TeklifMektubu",
    title: "Teklif Mektubu",
  },
];

export default function TeklifMektubuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Teklif Mektubu" items={BCrumb}>
        <EkBelgeYukleButton formKodu="TeklifMektubu" />
      </Breadcrumb>
      {children}
    </div>
  );
}
