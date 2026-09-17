"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSignUpSchema, type SignUpFormData } from "@/lib/validations/auth";
import { signUp } from "@/lib/auth/sign-up";
import { InputField } from "@/components/ui/InputField";
import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton"; // adjust path

export function SignUpForm() {
  const t = useTranslations("Auth.signUp");
  const tVal = useTranslations("Auth.validation");
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const schema = createSignUpSchema({
    nameRequired: tVal("nameRequired"),
    nameMin: tVal("nameMin"),
    nameMax: tVal("nameMax"),
    emailRequired: tVal("emailRequired"),
    emailInvalid: tVal("emailInvalid"),
    passwordMin: tVal("passwordMin"),
    confirmPasswordRequired: tVal("confirmPasswordRequired"),
    passwordsDoNotMatch: tVal("passwordsDoNotMatch"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
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
        setServerError(result.error.message ?? t("accountCreationError"));
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
          id="name"
          label={t("nameLabel")}
          type="text"
          placeholder={t("namePlaceholder")}
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />

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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <InputField
          id="confirmPassword"
          label={t("confirmPasswordLabel")}
          type="password"
          placeholder={t("confirmPasswordPlaceholder")}
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <FormAlert message={serverError} type="error" />

        <SubmitButton isLoading={isSubmitting} loadingText={t("submitting")}>
          {t("submit")}
        </SubmitButton>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-surface-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface px-2 text-surface-foreground/60">
            {t("orContinueWith")}
          </span>
        </div>
      </div>

      <GoogleAuthButton mode="signup" callbackURL="/feed" />
    </div>
  );
}