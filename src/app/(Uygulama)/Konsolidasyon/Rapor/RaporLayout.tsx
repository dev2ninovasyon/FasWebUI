"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ProtectedPage from "@/app/ProtectedPage";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";

const BCrumb = [
  {
    to: "/Konsolidasyon",
    title: "Konsolidasyon",
  },
  {
    to: "/Konsolidasyon/Rapor",
    title: "Rapor",
  },
];

export default function RaporLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: AppState) => state.userReducer);
  return (
    <ProtectedPage allowed={user.konsolidemi || false}>
      <div>
        <Breadcrumb title="Rapor" items={BCrumb} />
        {children}
      </div>
    </ProtectedPage>
  );
}
