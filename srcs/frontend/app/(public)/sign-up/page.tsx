import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthCard
      title={
        <>
          Join Heart<span className="text-violet-500">beat</span>
        </>
      }
      subtitle="Create an account and start connecting with friends."
      footer={
        <p>
          Already have an account?{" "}
          <Link href="/sign-in" className="text-violet-400 hover:text-violet-300">
            Sign in
          </Link>
        </p>
      }
    >
      <SignUpForm />
    </AuthCard>
  );
}
