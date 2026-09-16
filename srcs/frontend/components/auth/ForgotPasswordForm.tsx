"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createForgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { InputField } from "@/components/ui/InputField";
import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ForgotPasswordForm() {
  const t = useTranslations("Auth.forgotPassword");
  const tVal = useTranslations("Auth.validation");
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const schema = createForgotPasswordSchema({
    emailRequired: tVal("emailRequired"),
    emailInvalid: tVal("emailInvalid"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async () => {
    setServerError("");
    setSuccessMessage("");

    try {
      // Simulate/Trigger reset link (placeholder until backend email reset service is connected)
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccessMessage(t("successMessage"));
    } catch {
      setServerError(t("errorMessage"));
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

      <FormAlert message={serverError} type="error" />
      <FormAlert message={successMessage} type="success" />

      <SubmitButton isLoading={isSubmitting} loadingText={t("submitting")}>
        {t("submit")}
      </SubmitButton>
    </form>
  );
}
