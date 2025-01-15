"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/Sozlesme",
    title: "Sözleşme",
  },
];

export default function SozlesmeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Sözleşme" items={BCrumb} />
      {children}
    </div>
  );
}
