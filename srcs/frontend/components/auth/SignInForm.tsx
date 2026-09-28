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
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

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
    <div className="space-y-5">
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
              className="text-xs font-medium text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300"
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-zinc-200/80 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2.5 font-medium text-zinc-500 dark:bg-zinc-950 dark:text-zinc-400">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      <GoogleAuthButton mode="signin" callbackURL="/feed" />
    </div>
  );
}