"use client";

import PageContainer from "@/app/(Uygulama)/components/Container/PageContainer";
import Breadcrumb from "@/app/(Uygulama)/components/Layout/Shared/Breadcrumb/Breadcrumb";
import FisBuyukluguAnaliziChart from "@/app/(Uygulama)/components/PlanVeProgram/FisBuyukluguAnalizi/FisBuyukluguAnaliziChart";

const BCrumb = [
  {
    to: "/PlanVeProgram",
    title: "Plan ve Program",
  },
   {
    to: "/PlanVeProgram/DenetimPlanindaOnemlilik",
    title: "Denetim Planında Önemlilik",
  },
  {
    to: "/PlanVeProgram/DenetimPlanindaOnemlilik/FisBuyukluguAnalizi",
    title: "Fiş Büyüklüğü Analizi",
  },
];

const ColumnChart = () => {
  return (
    <PageContainer title="Column Chart" description="this is Column Chart">
      {/* breadcrumb */}
      <Breadcrumb title="Column Chart" items={BCrumb} />
      {/* end breadcrumb */}
      <FisBuyukluguAnaliziChart />
    </PageContainer>
  );
};

export default ColumnChart;