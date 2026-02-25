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
      <head>
        <link rel="preconnect" href="https://www.google.com" />
        <link
          rel="preconnect"
          href="https://www.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <Script src="/libs/html-docx.js" strategy="beforeInteractive" />
        <Script
          src="https://www.google.com/recaptcha/api.js?render=6Ld2CyEsAAAAALNU5rSOM_Q2RAWkQ2RADbsS5NQW"
          strategy="afterInteractive"
        />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
