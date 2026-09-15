import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

export const auth = betterAuth({
  appName: "ft_transcendence",

  baseURL: process.env.BETTER_AUTH_URL ?? "https://localhost:9000",

  basePath: "/auth",

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    },
  },

  trustedOrigins: [
    "https://localhost:9000",
  ],
});


//npx @better-auth/cli generate (generate the database schema in schema.prisma)
// npx @better-auth/cli info