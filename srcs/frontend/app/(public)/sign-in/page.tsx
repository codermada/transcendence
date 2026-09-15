import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <AuthCard
      title={
        <>
          Welcome back to Heart<span className="text-violet-500">beat</span>
        </>
      }
      subtitle="Sign in to continue connecting with friends."
      footer={
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-violet-400 hover:text-violet-300">
            Create account
          </Link>
        </p>
      }
    >
      <SignInForm />
    </AuthCard>
  );
}
