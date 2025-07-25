"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan Ve Program",
  },
  {
    to: "/PlanVeProgram/SorumlulukBildirimi",
    title: "Sorumluluk Bildirimi",
  },
];

export default function SorumlulukBildirimiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Breadcrumb title="Sorumluluk Bildirimi" items={BCrumb} />
      {children}
    </div>
  );
}
