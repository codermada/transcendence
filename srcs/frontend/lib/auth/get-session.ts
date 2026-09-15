import { authClient } from "@/lib/auth/auth-client";

export async function getSession() {
  return authClient.getSession();
}
