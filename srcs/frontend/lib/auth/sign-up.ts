import { authClient } from "@/lib/auth/auth-client";

type SignUpCredentials = {
  name: string;
  email: string;
  password: string;
};

export async function signUp({
  name,
  email,
  password,
}: SignUpCredentials) {
  return authClient.signUp.email({
    name,
    email,
    password,
  });
}
