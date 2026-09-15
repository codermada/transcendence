"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema, type SignInFormData } from "@/lib/validations/auth";
import { signIn } from "@/lib/auth/sign-in";
import { InputField } from "@/components/ui/InputField";
import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function SignInForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setServerError("");

    try {
      const result = await signIn({
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        setServerError(result.error.message ?? "Invalid email or password.");
        return;
      }

      router.push("/feed");
    } catch {
      setServerError("Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <InputField
        id="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <InputField
        id="password"
        label="Password"
        type="password"
        placeholder="Your password"
        autoComplete="current-password"
        rightLabel={
          <Link
            href="/forgot-password"
            className="text-xs text-violet-400 hover:text-violet-300"
          >
            Forgot password?
          </Link>
        }
        error={errors.password?.message}
        {...register("password")}
      />

      <FormAlert message={serverError} type="error" />

      <SubmitButton isLoading={isSubmitting} loadingText="Signing in...">
        Sign in
      </SubmitButton>
    </form>
  );
}
