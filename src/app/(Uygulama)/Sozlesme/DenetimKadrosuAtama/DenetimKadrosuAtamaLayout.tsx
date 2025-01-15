"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

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
    <div>
      <Breadcrumb title="Denetim Kadrosu Atama" items={BCrumb} />
      {children}
    </div>
  );
}
