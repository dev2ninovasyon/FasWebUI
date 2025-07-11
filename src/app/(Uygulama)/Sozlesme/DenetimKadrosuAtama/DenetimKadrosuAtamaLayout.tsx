"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ProtectedRoute from "@/app/ProtectedRoute";

const BCrumb = [
  {
    to: "/Sozlesme",
    title: "Sözleşme",
  },
  {
    to: "/Sozlesme/DenetimKadrosuAtama",
    title: "Denetim Kadrosu Atama",
  },
];

export default function DenetimKadrosuAtamaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <div>
        <Breadcrumb title="Denetim Kadrosu Atama" items={BCrumb} />
        {children}
      </div>
    </ProtectedRoute>
  );
}
