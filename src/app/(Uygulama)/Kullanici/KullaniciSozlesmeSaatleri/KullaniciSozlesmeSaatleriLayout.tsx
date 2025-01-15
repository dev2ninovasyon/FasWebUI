"use client";

import ProtectedRoute from "@/app/ProtectedRoute";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Kullanici",
    title: "Kullanıcı",
  },
  {
    to: "/Kullanici/KullaniciSozlesmeSaatleri",
    title: "Kullanıcı Sözleşme Saatleri",
  },
];

export default function KullaniciSozlesmeSaatleriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <div>
        <Breadcrumb title="Kullanıcı Sözleşme Saatleri" items={BCrumb} />
        {children}
      </div>
    </ProtectedRoute>
  );
}
