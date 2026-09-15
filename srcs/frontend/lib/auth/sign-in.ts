import { authClient } from "@/lib/auth/auth-client";

type SignInCredentials = {
  email: string;
  password: string;
};

export async function signIn(credentials: SignInCredentials) {
  return authClient.signIn.email(credentials);
}