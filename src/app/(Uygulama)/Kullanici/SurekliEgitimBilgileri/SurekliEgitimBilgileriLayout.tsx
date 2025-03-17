"use client";

import ProtectedRoute from "@/app/ProtectedRoute";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Kullanici",
    title: "Kullanıcı",
  },
  {
    to: "/Kullanici/SurekliEgitimBilgileri",
    title: "Sürekli Eğitim Bilgileri",
  },
];

export default function SurekliEgitimBilgileriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <div>
        <Breadcrumb title="Sürekli Eğitim Bilgileri" items={BCrumb} />
        {children}
      </div>
    </ProtectedRoute>
  );
}
