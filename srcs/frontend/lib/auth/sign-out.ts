import { authClient } from "@/lib/auth/auth-client";

export async function signOut() {
  return authClient.signOut();
}
