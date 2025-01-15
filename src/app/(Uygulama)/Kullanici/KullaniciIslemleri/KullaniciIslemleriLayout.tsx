"use client";

import ProtectedRoute from "@/app/ProtectedRoute";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Kullanici",
    title: "Kullanıcı",
  },
  {
    to: "/Kullanici/KullaniciIslemleri",
    title: "Kullanıcı İşlemleri",
  },
];

export default function KullaniciIslemleriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <div>
        <Breadcrumb title="Kullanıcı İşlemleri" items={BCrumb} />
        {children}
      </div>
    </ProtectedRoute>
  );
}
