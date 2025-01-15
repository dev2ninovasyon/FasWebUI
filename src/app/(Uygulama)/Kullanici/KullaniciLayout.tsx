"use client";

import ProtectedRoute from "@/app/ProtectedRoute";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Kullanici",
    title: "Kullanıcı",
  },
];

export default function KullaniciLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <div>
        <Breadcrumb title="Kullanıcı" items={BCrumb} />
        {children}
      </div>
    </ProtectedRoute>
  );
}
