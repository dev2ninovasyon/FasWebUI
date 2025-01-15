"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import dynamic from "next/dynamic";
import TeklifMektubuLayout from "./TeklifMektubuLayout";

const CustomEditor = dynamic(
  () => import("@/app/(Uygulama)/components/Editor/CustomEditor"),
  { ssr: false }
);

const controller = "TeklifMektubu";

const Page = () => {
  return (
    <TeklifMektubuLayout>
      <PageContainer
        title="Teklif Mektubu"
        description="this is Teklif Mektubu"
      >
        <CustomEditor controller={controller} />
      </PageContainer>
    </TeklifMektubuLayout>
  );
};

export default Page;
