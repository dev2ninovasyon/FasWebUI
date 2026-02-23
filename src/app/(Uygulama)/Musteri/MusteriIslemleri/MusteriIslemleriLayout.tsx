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

interface Props {
  children: React.ReactNode;
  title?: string;
  items?: any[];
}

export default function MusteriIslemleriLayout({
  children,
  title = "Müşteri İşlemleri",
  items = BCrumb,
}: Props) {
  return (
    <ProtectedRoute allowedRoles={["DenetciAdmin"]}>
      <div>
        <Breadcrumb title={title} items={items} />
        {children}
      </div>
    </ProtectedRoute>
  );
}
