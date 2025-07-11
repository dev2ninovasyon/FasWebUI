"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ProtectedRoute from "@/app/ProtectedRoute";

const BCrumb = [
  {
    to: "/Musteri",
    title: "Müşteri",
  },
  {
    to: "/Musteri/MusteriIslemleri",
    title: "Müşteri İşlemleri",
  },
];

export default function MusteriIslemleriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <div>
        <Breadcrumb title="Müşteri İşlemleri" items={BCrumb} />
        {children}
      </div>
    </ProtectedRoute>
  );
}
