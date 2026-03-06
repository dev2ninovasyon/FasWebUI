import Script from "next/script";
import AppProviders from "./AppProviders";
import "./global.css";
import "slick-carousel/slick/slick.css";
import "../../public/styles/slick-theme-fixed.css";

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
