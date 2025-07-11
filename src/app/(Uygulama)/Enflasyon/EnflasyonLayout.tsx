"use client";

import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import ProtectedPage from "@/app/ProtectedPage";
import { AppState } from "@/store/store";
import { useSelector } from "@/store/hooks";

const BCrumb = [
  {
    to: "/Enflasyon",
    title: "Enflasyon",
  },
];

export default function EnflasyonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useSelector((state: AppState) => state.userReducer);

  return (
    <ProtectedPage allowed={user?.enflasyonmu || false}>
      <div>
        <Breadcrumb title="Enflasyon" items={BCrumb} />
        {children}
      </div>
    </ProtectedPage>
  );
}
