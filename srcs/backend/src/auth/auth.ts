import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { apiKey } from "@better-auth/api-key";
import { twoFactor, admin } from 'better-auth/plugins';
import { generateUsername } from "../lib/generateUsername";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const DEFAULT_AVATAR = "/nest/uploads/default-avatar.png";

export const auth = betterAuth({
  appName: "ft_transcendence",
  baseURL: process.env.BETTER_AUTH_URL ?? "https://localhost:3000",
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

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              image: DEFAULT_AVATAR, // always override — ignore Google's picture
              pseudo:
                (user as { pseudo?: string | null }).pseudo ??
                (user.email ? generateUsername(user.email) : null),
            },
          };
        },
      },
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: process.env.REDIRECT_URI!,

      mapProfileToUser: (profile) => {
        if (!profile.email) {
          throw new Error("Google account did not provide an email.");
        }

        return {
          name: profile.name ?? "",
          pseudo: generateUsername(profile.email),
        };
      },
    },
  },

  plugins: [
    apiKey({
      apiKeyHeaders: "x-api-key",
      enableMetadata: true,
      enableSessionForAPIKeys: true,
    }),
    twoFactor({
      issuer: 'ft_transcendence',
    }),
    admin({
      defaultRole: 'user',
    }),
  ],
});