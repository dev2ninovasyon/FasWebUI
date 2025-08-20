"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/DenetimDosya",
    title: "Denetim Dosya",
  },
];
export default function DenetimDosyaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Denetim Dosya" items={BCrumb} />
      {children}
    </div>
  );
}
