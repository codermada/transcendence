"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/validations/auth";
import { InputField } from "@/components/ui/InputField";
import { FormAlert } from "@/components/ui/FormAlert";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ForgotPasswordForm() {
  const [successMessage, setSuccessMessage] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
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
      setSuccessMessage(
        "If an account exists with this email, you will receive a reset link shortly."
      );
    } catch {
      setServerError("Unable to send reset link. Please try again later.");
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

      <FormAlert message={serverError} type="error" />
      <FormAlert message={successMessage} type="success" />

      <SubmitButton isLoading={isSubmitting} loadingText="Sending link...">
        Send reset link
      </SubmitButton>
    </form>
  );
}
