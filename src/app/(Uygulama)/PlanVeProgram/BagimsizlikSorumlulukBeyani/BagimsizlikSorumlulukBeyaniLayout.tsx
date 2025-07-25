"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan Ve Program",
  },
  {
    to: "/PlanVeProgram/BagimsizlikSorumlulukBeyani",
    title: "Bağımsızlık Sorumluluk Beyanı",
  },
];

export default function BagimsizlikSorumlulukBeyaniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Bağımsızlık Sorumluluk Beyanı" items={BCrumb} />
      {children}
    </div>
  );
}
