import 'dotenv/config';
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { apiKey } from "@better-auth/api-key";
import { twoFactor, admin } from 'better-auth/plugins';
import { generateUsername } from "../lib/generateUsername";
import nodemailer from 'nodemailer';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const DEFAULT_AVATAR = "/nest/uploads/default-avatar.png";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  await transporter.sendMail({
    from: `"ft_transcendence" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

export const auth = betterAuth({
  appName: "ft_transcendence",
  baseURL: process.env.BETTER_AUTH_URL ?? `http://${process.env.NEXT_PUBLIC_IP_ADDRESS ? process.env.NEXT_PUBLIC_IP_ADDRESS : 'localhost'}:3000`,
  basePath: "/auth",

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,

    sendResetPassword: async ({ user, url }) => {
      const resetUrl = new URL(url);

      resetUrl.protocol = 'https:';
      resetUrl.host = `${process.env.NEXT_PUBLIC_IP_ADDRESS ? process.env.NEXT_PUBLIC_IP_ADDRESS : 'localhost'}:9000`;
      resetUrl.pathname = `/nest${resetUrl.pathname}`;

      await sendMail({
        to: user.email,
        subject: 'Reset your password',
        html: `
        <div
          style="
            background-color: #09090b;
            padding: 40px 20px;
            font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI',
              Roboto, 'Helvetica Neue', Arial, sans-serif;
            color: #ffffff;
          "
        >
          <div
            style="
              max-width: 480px;
              margin: 0 auto;
              background-color: #18181b;
              border: 1px solid #27272a;
              border-radius: 16px;
              padding: 32px;
              text-align: center;
            "
          >
            <span
              style="
                display: inline-block;
                border-radius: 9999px;
                border: 1px solid rgba(139, 92, 246, 0.3);
                background-color: rgba(139, 92, 246, 0.1);
                padding: 4px 12px;
                font-size: 12px;
                font-weight: 500;
                color: #a78bfa;
                margin-bottom: 24px;
              "
            >
              Security
            </span>

            <h1
              style="
                font-size: 28px;
                font-weight: 700;
                line-height: 36px;
                margin: 0 0 16px;
                color: #ffffff;
              "
            >
              Reset your password
            </h1>

            <p
              style="
                color: #a1a1aa;
                font-size: 15px;
                line-height: 24px;
                margin: 0 0 32px;
              "
            >
              Hi ${user.name}, you requested to reset your password.
              Click the button below to create a new password.
            </p>

            <a
              href="${resetUrl.toString()}"
              style="
                display: inline-block;
                background-color: #7c3aed;
                color: #ffffff;
                text-decoration: none;
                font-weight: 600;
                font-size: 14px;
                padding: 12px 24px;
                border-radius: 16px;
                box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.3),
                            0 4px 6px -4px rgba(124, 58, 237, 0.3);
              "
            >
              Reset Password
            </a>

            <p
              style="
                margin: 32px 0 0;
                color: #d4d4d8;
                font-size: 13px;
                line-height: 20px;
              "
            >
              If you did not request a password reset, you can safely ignore
              this email.
            </p>
          </div>
        </div>
      `,
      });
    },
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60,
    },
  },

  trustedOrigins: [
    `https://${process.env.NEXT_PUBLIC_IP_ADDRESS ? process.env.NEXT_PUBLIC_IP_ADDRESS : 'localhost'}:9000`,
    `http://${process.env.NEXT_PUBLIC_IP_ADDRESS ? process.env.NEXT_PUBLIC_IP_ADDRESS : 'localhost'}:3000`,
    `http://${process.env.NEXT_PUBLIC_IP_ADDRESS ? process.env.NEXT_PUBLIC_IP_ADDRESS : 'localhost'}:3001`,
    ...(process.env.UI_URL ? [process.env.UI_URL] : []),
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