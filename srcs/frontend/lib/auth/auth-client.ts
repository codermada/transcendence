import { createAuthClient } from "better-auth/react";
import { apiKeyClient } from "@better-auth/api-key/client";
import { twoFactorClient, adminClient } from "better-auth/client/plugins";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/nest/auth`;
  }
  return `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"}/auth`;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    apiKeyClient(),
    twoFactorClient({
            
            twoFactorPage: "/two-factor", // the page to redirect if a user needs to verify their 2nd factor
        }),
    adminClient(),
  ],
});
