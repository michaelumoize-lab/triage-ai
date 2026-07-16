import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
if (!BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

export const auth = betterAuth({
  // Database adapter
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secret: BETTER_AUTH_SECRET,

  // Email & Password Authentication
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },

  // Social Providers - Google Only
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // Session Configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  // Account Configuration
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  // User Configuration - Custom fields for doctors
  user: {
    additionalFields: {
      specialty: {
        type: "string",
        required: false,
        defaultValue: null,
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: null,
      },
      isActive: {
        type: "boolean",
        required: true,
        defaultValue: true,
      },
      lastLoginAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },
});
