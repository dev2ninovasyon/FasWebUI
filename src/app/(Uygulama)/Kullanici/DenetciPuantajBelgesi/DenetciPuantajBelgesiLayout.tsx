"use client";

import ProtectedRoute from "@/app/ProtectedRoute";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Kullanici",
    title: "Kullanıcı",
  },
  {
    to: "/Kullanici/DenetciPuantajBelgesi",
    title: "Denetçi Puantaj Belgesi",
  },
];

export default function DenetciPuantajBelgesiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <div>
        <Breadcrumb title="Denetçi Puantaj Belgesi" items={BCrumb} />
        {children}
      </div>
    </ProtectedRoute>
  );
}
