import type { Metadata } from "next";
import Script from "next/script";
import AppProviders from "./AppProviders";
import "./global.css";
import "slick-carousel/slick/slick.css";
import "../../public/styles/slick-theme-fixed.css";

export const metadata: Metadata = {
  title: {
    template: "%s | FAS Denetim",
    default: "FAS Denetim",
  },
  description: "FAS Financial Audit Software - Finansal Denetim Yazılımı",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head />
      <body>
        <Script src="/libs/html-docx.js" strategy="beforeInteractive" />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
