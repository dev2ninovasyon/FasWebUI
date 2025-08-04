"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/HileVeUsulsuzluk",
    title: "Hile Ve Usulsüzlük",
  },
  {
    to: "/HileVeUsulsuzluk/MuhasebeHatalariVeHile",
    title: "Muhasebe Hataları Ve Hileye İlişkin Çalışmalar",
  },
];

export default function MuhasebeHatalariVeHileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb
        title="Muhasebe Hataları Ve Hileye İlişkin Çalışmalar"
        items={BCrumb}
      />
      {children}
    </div>
  );
}
