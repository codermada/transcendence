"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema, type SignUpFormData } from "@/lib/validations/auth";
import { signUp } from "@/lib/auth/sign-up";
import { InputField } from "@/components/ui/InputField";
import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function SignUpForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setServerError("");

    try {
      const result = await signUp({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        setServerError(result.error.message ?? "Unable to create account.");
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
        id="name"
        label="Name"
        type="text"
        placeholder="Your name"
        autoComplete="name"
        error={errors.name?.message}
        {...register("name")}
      />

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
        placeholder="Create a password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <FormAlert message={serverError} type="error" />

      <SubmitButton isLoading={isSubmitting} loadingText="Creating account...">
        Create account
      </SubmitButton>
    </form>
  );
}
