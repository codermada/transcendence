import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      footer={
        <p>
          Remember your password?{" "}
          <Link href="/sign-in" className="text-violet-400 hover:text-violet-300">
            Sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
