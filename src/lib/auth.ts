import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "fallback-secret-change-me"
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.isActive) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          language: user.language,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar ?? null;
        token.language = user.language ?? 'en';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string | null;
        session.user.language = token.language as string;
      }
      return session;
    },
  },
};

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Helper function to verify passwords
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Resolves the authenticated user from either a NextAuth session (web) or a
// mobile JWT bearer token (issued by /api/auth/mobile-login).
export async function getRequestUser(
  request: NextRequest
): Promise<{ id: string; email: string; role: string } | null> {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return {
      id: session.user.id,
      email: session.user.email ?? "",
      role: session.user.role,
    };
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const { payload } = await jwtVerify(authHeader.slice(7), JWT_SECRET);
      return {
        id: payload.id as string,
        email: payload.email as string,
        role: payload.role as string,
      };
    } catch {
      return null;
    }
  }

  return null;
}
