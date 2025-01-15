"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/GenelKurul",
    title: "Genel Kurul",
  },
];

export default function GenelKurulLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Genel Kurul" items={BCrumb} />
      {children}
    </div>
  );
}
