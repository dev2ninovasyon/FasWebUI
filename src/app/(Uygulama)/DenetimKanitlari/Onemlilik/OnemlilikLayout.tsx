"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/DenetimKanitlari",
    title: "Denetim Kanıtları",
  },
  {
    to: "/DenetimKanitlari/Onemlilik",
    title: "Önemlilik",
  },
];

export default function OnemlilikLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Önemlilik" items={BCrumb} />
      {children}
    </div>
  );
}
