import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://localhost:9000/nest/auth",
  fetchOptions: {
    credentials: "include",
  },
});
