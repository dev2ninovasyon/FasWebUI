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
];

export default function KonsolidasyonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.konsolidemi || false}>
      <div>
        <Breadcrumb title="Konsolidasyon" items={BCrumb} />
        {children}
      </div>
    </ProtectedPage>
  );
}
