import { z } from "zod";

export interface SignInValidationMessages {
  emailRequired?: string;
  emailInvalid?: string;
  passwordRequired?: string;
}

export function createSignInSchema(messages: SignInValidationMessages = {}) {
  return z.object({
    email: z
      .string()
      .min(1, messages.emailRequired ?? "Email is required")
      .email(messages.emailInvalid ?? "Please enter a valid email address"),
    password: z
      .string()
      .min(1, messages.passwordRequired ?? "Password is required"),
  });
}

export const signInSchema = createSignInSchema();
export type SignInFormData = z.infer<typeof signInSchema>;

export interface SignUpValidationMessages {
  nameRequired?: string;
  nameMin?: string;
  nameMax?: string;
  emailRequired?: string;
  emailInvalid?: string;
  passwordMin?: string;
  confirmPasswordRequired?: string;
  passwordsDoNotMatch?: string;
}

export function createSignUpSchema(messages: SignUpValidationMessages = {}) {
  return z
    .object({
      name: z
        .string()
        .min(1, messages.nameRequired ?? "Name is required")
        .min(2, messages.nameMin ?? "Name must be at least 2 characters")
        .max(50, messages.nameMax ?? "Name cannot exceed 50 characters"),
      email: z
        .string()
        .min(1, messages.emailRequired ?? "Email is required")
        .email(messages.emailInvalid ?? "Please enter a valid email address"),
      password: z
        .string()
        .min(8, messages.passwordMin ?? "Password must be at least 8 characters"),
      confirmPassword: z
        .string()
        .min(1, messages.confirmPasswordRequired ?? "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: messages.passwordsDoNotMatch ?? "Passwords do not match",
      path: ["confirmPassword"],
    });
}

export const signUpSchema = createSignUpSchema();
export type SignUpFormData = z.infer<typeof signUpSchema>;

export interface ForgotPasswordValidationMessages {
  emailRequired?: string;
  emailInvalid?: string;
}

export function createForgotPasswordSchema(
  messages: ForgotPasswordValidationMessages = {}
) {
  return z.object({
    email: z
      .string()
      .min(1, messages.emailRequired ?? "Email is required")
      .email(messages.emailInvalid ?? "Please enter a valid email address"),
  });
}

export const forgotPasswordSchema = createForgotPasswordSchema();
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
