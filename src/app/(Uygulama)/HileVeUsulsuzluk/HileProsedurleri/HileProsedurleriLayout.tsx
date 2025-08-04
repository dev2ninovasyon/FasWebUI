"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/HileVeUsulsuzluk",
    title: "Hile Ve Usulsüzlük",
  },
  {
    to: "/HileVeUsulsuzluk/HileProsedurleri",
    title: "Hile Prosedürleri",
  },
];

export default function HileProsedurleriLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Hile Prosedürleri" items={BCrumb} />
      {children}
    </div>
  );
}
