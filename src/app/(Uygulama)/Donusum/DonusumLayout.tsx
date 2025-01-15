"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Donusum",
    title: "Dönüşüm",
  },
];

export default function DonusumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Dönüşüm" items={BCrumb} />
      {children}
    </div>
  );
}
