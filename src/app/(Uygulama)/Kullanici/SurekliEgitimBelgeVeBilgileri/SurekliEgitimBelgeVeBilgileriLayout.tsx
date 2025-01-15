"use client";

import ProtectedRoute from "@/app/ProtectedRoute";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Kullanici",
    title: "Kullanıcı",
  },
  {
    to: "/Kullanici/SurekliEgitimBelgeVeBilgileri",
    title: "Sürekli Eğitim Belge ve Bilgileri",
  },
];

export default function SurekliEgitimBelgeVeBilgileriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <div>
        <Breadcrumb title="Sürekli Eğitim Belge ve Bilgileri" items={BCrumb} />
        {children}
      </div>
    </ProtectedRoute>
  );
}
