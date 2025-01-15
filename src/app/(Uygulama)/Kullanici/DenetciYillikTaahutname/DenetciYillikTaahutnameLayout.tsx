"use client";

import ProtectedRoute from "@/app/ProtectedRoute";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

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
        <Breadcrumb title="Denetçi Yıllık Taahütname" items={BCrumb} />
        {children}
      </div>
    </ProtectedRoute>
  );
}
