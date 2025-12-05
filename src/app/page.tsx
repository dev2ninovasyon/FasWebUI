import LoginPageClient from "./auth/LoginPageClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return <LoginPageClient />;
}

Page.layout = "Blank";

