"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSignInSchema, type SignInFormData } from "@/lib/validations/auth";
import { signIn } from "@/lib/auth/sign-in";
import { InputField } from "@/components/ui/InputField";
import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function SignInForm() {
  const t = useTranslations("Auth.signIn");
  const tVal = useTranslations("Auth.validation");
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const schema = createSignInSchema({
    emailRequired: tVal("emailRequired"),
    emailInvalid: tVal("emailInvalid"),
    passwordRequired: tVal("passwordRequired"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(schema),
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
        setServerError(result.error.message ?? t("invalidCredentials"));
        return;
      }

      router.push("/feed");
    } catch {
      setServerError(t("genericError"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <InputField
        id="email"
        label={t("emailLabel")}
        type="email"
        placeholder={t("emailPlaceholder")}
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <InputField
        id="password"
        label={t("passwordLabel")}
        type="password"
        placeholder={t("passwordPlaceholder")}
        autoComplete="current-password"
        rightLabel={
          <Link
            href="/forgot-password"
            className="text-xs text-violet-400 hover:text-violet-300"
          >
            {t("forgotPassword")}
          </Link>
        }
        error={errors.password?.message}
        {...register("password")}
      />

      <FormAlert message={serverError} type="error" />

      <SubmitButton isLoading={isSubmitting} loadingText={t("submitting")}>
        {t("submit")}
      </SubmitButton>
    </form>
  );
}
