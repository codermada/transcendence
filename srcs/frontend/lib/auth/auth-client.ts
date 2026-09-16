import { createAuthClient } from "better-auth/react";
import { apiKeyClient } from "@better-auth/api-key/client";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "https://localhost:9000/nest/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    apiKeyClient(),
    twoFactorClient({
            
            twoFactorPage: "/two-factor", // the page to redirect if a user needs to verify their 2nd factor
        }),
  ],
});
