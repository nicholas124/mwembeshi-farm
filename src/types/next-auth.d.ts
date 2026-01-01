import { UserRole } from "@prisma/client";
import "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      avatar: string | null;
      language: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string | null;
    language?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    avatar: string | null;
    language: string;
  }
}
