import { createAuthClient } from "better-auth/react";
import { apiKeyClient } from "@better-auth/api-key/client";

export const authClient = createAuthClient({
  baseURL: "https://localhost:9000/nest/auth",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    apiKeyClient(),
  ],
});
