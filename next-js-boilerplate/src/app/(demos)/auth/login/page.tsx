import { LoginForm } from "@/features/auth/ui/login-form";
import { SocialLoginButtons } from "@/features/auth/ui/social-login-buttons";

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <LoginForm />
      <SocialLoginButtons />
    </div>
  );
}
