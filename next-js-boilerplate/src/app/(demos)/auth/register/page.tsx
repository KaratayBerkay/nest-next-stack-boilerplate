import { RegisterForm } from "@/features/auth/ui/register-form";
import { SocialLoginButtons } from "@/features/auth/ui/social-login-buttons";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <RegisterForm />
      <SocialLoginButtons />
    </div>
  );
}
