"use client";

import ProtectedRoute from "@/app/ProtectedRoute";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

import EkBelgeYukleButton from "@/app/(Uygulama)/components/CalismaKagitlari/Cards/EkBelgeYukleButton";
const BCrumb = [
  {
    to: "/Kullanici",
    title: "Kullanıcı",
  },
  {
    to: "/Kullanici/DenetciYillikTaahutname",
    title: "Denetçi Yıllık Taahütname",
  },
];

export default function DenetciYillikTaahutnameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <div>
        <Breadcrumb title="Denetçi Yıllık Taahütname" items={BCrumb}>
        <EkBelgeYukleButton formKodu="YillikTaahhutname" />
      </Breadcrumb>
        {children}
      </div>
    </ProtectedRoute>
  );
}
