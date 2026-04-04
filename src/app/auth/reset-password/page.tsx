"use client";

import AuthPageShell from "../AuthPageShell";
import ResetPasswordForm from "../authForms/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <AuthPageShell
      title="Yeni Şifre Belirle"
      description="Şimdi hesabınız için yeni bir şifre oluşturabilirsiniz."
    >
      <ResetPasswordForm />
    </AuthPageShell>
  );
}
