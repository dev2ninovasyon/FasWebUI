"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Rapor",
    title: "Rapor",
  },
];

export default function RaporLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Rapor" items={BCrumb} />
      {children}
    </div>
  );
}
